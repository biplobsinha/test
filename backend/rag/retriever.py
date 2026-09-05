import os

DOCS_DIR = os.path.join(os.path.dirname(__file__), "documents")

def load_documents():
    docs = {}
    if not os.path.exists(DOCS_DIR):
        return docs
    
    for filename in os.listdir(DOCS_DIR):
        if filename.endswith(".md"):
            filepath = os.path.join(DOCS_DIR, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                docs[filename] = f.read()
    return docs


def retrieve_relevant_policies(risk_factors: list[str]) -> list[dict]:
    """
    Keyword/factor matching retriever. Returns relevant policy clauses for
    the detected risk factors.
    """
    docs = load_documents()
    retrieved = []
    
    factor_map = {
        "unusual amount": "policy_large_transactions.md",
        "high velocity": "policy_velocity.md",
        "new device": "policy_new_device.md",
        "merchant risk": "policy_merchant_risk.md",
        "location anomaly": "policy_location_anomaly.md"
    }

    seen_files = set()
    for factor in risk_factors:
        factor_lower = factor.lower().strip()
        matched_file = factor_map.get(factor_lower)
        if matched_file and matched_file in docs and matched_file not in seen_files:
            retrieved.append({
                "title": matched_file.replace(".md", "").replace("policy_", "").replace("_", " ").title(),
                "filename": matched_file,
                "content": docs[matched_file]
            })
            seen_files.add(matched_file)

    # Fallback default if no specific factor matched or general policy requested
    if not retrieved and "policy_large_transactions.md" in docs:
        retrieved.append({
            "title": "Large Transactions",
            "filename": "policy_large_transactions.md",
            "content": docs["policy_large_transactions.md"]
        })

    return retrieved
