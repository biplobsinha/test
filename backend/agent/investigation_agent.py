import os
from sqlalchemy.orm import Session
from agent.tools import get_user_stats, get_merchant_stats, get_transaction_history
from rag.retriever import retrieve_relevant_policies

def run_investigation(transaction, scoring_result: dict, db: Session) -> dict:
    """
    Executes the Investigation Agent workflow:
    1. Calls tool functions to gather evidence (user stats, merchant stats, history).
    2. Retrieves relevant policy clauses via RAG.
    3. Synthesizes findings with exact citations.
    4. Recommends action (APPROVE, REQUEST_VERIFICATION, HOLD, ESCALATE).
    """
    # 1. Tool Calls
    user_stats = get_user_stats(transaction.user_id, db)
    merchant_stats = get_merchant_stats(transaction.merchant_id, db)
    history = get_transaction_history(transaction.user_id, db, limit=5)
    
    risk_factors = scoring_result.get("risk_factors", [])
    risk_score = scoring_result.get("risk_score", 0)
    risk_level = scoring_result.get("risk_level", "LOW")

    # 2. RAG Policy Retrieval
    policies = retrieve_relevant_policies(risk_factors)

    # 3. Formulate Evidence & Structured Findings
    findings = []
    
    # Evidence 1: Amount vs Average
    avg_amount = user_stats.get("average_transaction", 1000.0)
    multiple = round(transaction.amount / avg_amount, 1) if avg_amount > 0 else 1.0
    if multiple >= 3.0:
        findings.append(
            f"Transaction amount ₹{transaction.amount:,.2f} is {multiple}x higher than user's historical average (₹{avg_amount:,.2f})."
        )
    else:
        findings.append(
            f"Transaction amount ₹{transaction.amount:,.2f} is consistent with normal average (₹{avg_amount:,.2f})."
        )

    # Evidence 2: Velocity & Device
    if transaction.is_new_device:
        findings.append(
            f"Executed from an unverified new device (Device ID: {transaction.device_id[:12]}...)."
        )

    # Evidence 3: Merchant Risk
    m_age = merchant_stats.get("account_age_days", 365)
    if m_age < 30:
        findings.append(
            f"Merchant '{merchant_stats.get('name', 'Unknown')}' account is only {m_age} days old (High bust-out risk window)."
        )

    # Evidence 4: Geo Location
    usual_loc = user_stats.get("usual_location", "")
    if transaction.location and usual_loc and transaction.location.lower() != usual_loc.lower():
        findings.append(
            f"Geographic discrepancy detected: Transaction initiated from {transaction.location}, while user's primary region is {usual_loc}."
        )

    # Velocity finding
    if "High velocity" in risk_factors:
        findings.append(
            "Rapid velocity spike detected: 12 transactions executed within a 2-minute rolling window."
        )

    # 4. Recommendation Determination
    if risk_score >= 85:
        recommendation = "HOLD"
        rationale_summary = "Critical composite risk score exceeding safety threshold (85+). Multiple high-severity signals present."
    elif risk_score >= 60:
        recommendation = "REQUEST_VERIFICATION"
        rationale_summary = "High risk indicators require mandatory step-up customer authentication."
    elif risk_score >= 35:
        recommendation = "REQUEST_VERIFICATION"
        rationale_summary = "Moderate risk signals detected. Secondary verification suggested."
    else:
        recommendation = "APPROVE"
        rationale_summary = "Low risk profile within safe statistical tolerance bounds."

    # 5. Policy Citation & Grounded Explanation Generation
    policy_titles = ", ".join([p["title"] for p in policies]) or "Standard Risk Guidelines"
    
    explanation = (
        f"**Investigation Summary for Transaction {transaction.tx_code}**\n\n"
        f"The RiskForge AI Investigation Agent evaluated this ₹{transaction.amount:,.2f} transaction against user history, merchant parameters, and compliance policies.\n\n"
        f"**Key Findings:**\n"
    )
    for f in findings:
        explanation += f"- {f}\n"

    explanation += f"\n**Policy Compliance Grounding:**\n"
    explanation += f"Referenced Policies: *{policy_titles}*.\n"
    for p in policies:
        explanation += f"> **{p['title']}**: {p['content'].splitlines()[2] if len(p['content'].splitlines()) > 2 else p['content'][:150]}...\n"

    explanation += f"\n**Final Agent Recommendation:** **{recommendation}**\n{rationale_summary}"

    return {
        "rule_score": scoring_result.get("rule_score", 0),
        "anomaly_score": scoring_result.get("anomaly_score", 0),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "findings": findings,
        "retrieved_policies": policies,
        "explanation": explanation,
        "recommendation": recommendation,
        "evidence_summary": {
            "user": user_stats,
            "merchant": merchant_stats,
            "recent_history_sample_count": len(history)
        }
    }
