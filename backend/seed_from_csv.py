"""
seed_from_csv.py
================
Migrates the PaySim CSV dataset into the RiskForge SQLite database.

Usage:
    python seed_from_csv.py [--limit N] [--csv PATH] [--wipe]

Options:
    --limit N     Number of transactions to import (default: 10000)
    --csv PATH    Path to the CSV file (default: auto-detected)
    --wipe        Drop and recreate all tables before seeding
    --all         Import ALL rows (warning: very slow for 6M+ rows)

The script creates a balanced, fraud-heavy sample:
  - ~50% fraud transactions (isFraud=1)
  - ~50% clean transactions (isFraud=0)
  This ensures the dashboard has interesting risk data to display.
"""

import os
import sys
import csv
import uuid
import datetime
import argparse
import random

# Force UTF-8 output on Windows to handle emoji in print statements
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# ── ensure backend directory is on path ──────────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from database import engine, Base, SessionLocal
from models import User, Merchant, Transaction
from risk_engine.scoring import calculate_risk

# ── constants ─────────────────────────────────────────────────────────────────
DEFAULT_CSV_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..",
    "PS_20174392719_1491204439457_log.csv"
)
BATCH_SIZE = 500  # rows per DB commit

# Transaction types present in the CSV
TRANSFER_TYPES = {"TRANSFER", "CASH_OUT"}  # types that can be fraud in PaySim

# Synthetic base date – step 1 in the CSV = this datetime
BASE_DATE = datetime.datetime(2023, 1, 1, 0, 0, 0)


def step_to_datetime(step: int) -> datetime.datetime:
    """Convert PaySim simulation step (1 hour) to a real datetime."""
    return BASE_DATE + datetime.timedelta(hours=int(step))


def derive_location(name_orig: str) -> str:
    """Deterministically assign a city based on last digit of account ID."""
    cities = [
        "Mumbai, MH", "Delhi, DL", "Bengaluru, KA", "Chennai, TN",
        "Hyderabad, TS", "Kolkata, WB", "Pune, MH", "Ahmedabad, GJ",
        "Jaipur, RJ", "Surat, GJ",
    ]
    try:
        idx = int(name_orig[-1]) % len(cities)
    except (ValueError, IndexError):
        idx = 0
    return cities[idx]


def derive_avg_transaction(old_balance: float) -> float:
    """Estimate average transaction from account balance."""
    if old_balance <= 0:
        return 500.0
    return round(old_balance * 0.05, 2)  # ~5% of balance


def upsert_user(db, name_orig: str, old_balance: float, seen_users: dict) -> User:
    """Return cached or newly-created User record (not yet committed)."""
    if name_orig in seen_users:
        return seen_users[name_orig]

    avg = derive_avg_transaction(old_balance)
    location = derive_location(name_orig)

    user = User(
        id=name_orig,
        name=f"Customer {name_orig[:8]}",
        email=f"{name_orig.lower()}@example.com",
        average_transaction=avg,
        usual_location=location,
        trust_score=random.randint(70, 95),
        created_at=BASE_DATE - datetime.timedelta(days=random.randint(30, 730)),
    )
    seen_users[name_orig] = user
    return user


def upsert_merchant(db, name_dest: str, seen_merchants: dict) -> Merchant:
    """Return cached or newly-created Merchant record (not yet committed)."""
    if name_dest in seen_merchants:
        return seen_merchants[name_dest]

    is_merchant = name_dest.startswith("M")
    risk_cat = "LOW" if is_merchant else "MEDIUM"  # C→C transfers are slightly riskier

    merchant = Merchant(
        id=name_dest,
        name=(
            f"Merchant {name_dest[:8]}" if is_merchant
            else f"Account {name_dest[:8]}"
        ),
        account_age_days=random.randint(1, 1460),
        risk_category=risk_cat,
        created_at=BASE_DATE - datetime.timedelta(days=random.randint(1, 1460)),
    )
    seen_merchants[name_dest] = merchant
    return merchant


def collect_sample(csv_path: str, limit: int, import_all: bool):
    """
    Two-pass strategy for a balanced sample:
      Pass 1 – collect all fraud rows (isFraud=1), up to limit//2
      Pass 2 – collect clean rows (isFraud=0), up to limit//2
    If import_all=True, stream everything without sampling.
    """
    if import_all:
        print("📥  Streaming ALL rows (this may take a very long time)…")
        with open(csv_path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                yield row
        return

    half = limit // 2
    fraud_rows = []
    clean_rows = []

    print(f"📊  Scanning CSV for a balanced {limit}-row sample…")
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            is_fraud = row["isFraud"] == "1"
            if is_fraud and len(fraud_rows) < half:
                fraud_rows.append(row)
            elif not is_fraud and len(clean_rows) < half:
                clean_rows.append(row)
            if len(fraud_rows) >= half and len(clean_rows) >= half:
                break

    print(f"   Fraud rows collected  : {len(fraud_rows)}")
    print(f"   Clean rows collected  : {len(clean_rows)}")

    combined = fraud_rows + clean_rows
    random.shuffle(combined)
    for row in combined:
        yield row


def seed(csv_path: str, limit: int, wipe: bool, import_all: bool):
    print("\n🚀  RiskForge — CSV Seed Script")
    print("=" * 50)

    if wipe:
        print("⚠️   Wiping all tables…")
        Base.metadata.drop_all(bind=engine)
        print("✅  Tables dropped.")

    Base.metadata.create_all(bind=engine)
    print("✅  Tables ensured.")

    db = SessionLocal()

    # Check existing counts to avoid re-inserting
    existing_tx_ids = set(
        row[0] for row in db.execute(
            __import__("sqlalchemy").text("SELECT id FROM transactions")
        ).fetchall()
    ) if not wipe else set()

    seen_users: dict = {}
    seen_merchants: dict = {}

    users_to_add = []
    merchants_to_add = []
    txs_to_add = []

    imported = 0
    skipped = 0
    errors = 0

    rows = collect_sample(csv_path, limit, import_all)
    total_target = "ALL" if import_all else str(limit)
    print(f"\n⏳  Importing {total_target} transactions…\n")

    for row in rows:
        try:
            name_orig = row["nameOrig"]
            name_dest = row["nameDest"]
            amount = float(row["amount"])
            old_balance_orig = float(row["oldbalanceOrg"])
            is_fraud = row["isFraud"] == "1"
            is_flagged = row["isFlaggedFraud"] == "1"
            step = int(row["step"])
            tx_type = row["type"]

            # Generate deterministic TX id from CSV fields to keep idempotent
            tx_id_seed = f"{name_orig}_{name_dest}_{amount}_{step}_{tx_type}"
            uid = uuid.uuid5(uuid.NAMESPACE_DNS, tx_id_seed)
            tx_id = f"TX_{uid.hex[:8].upper()}"
            # Derive tx_code from tx_id (already unique) — avoids birthday collisions
            tx_code = f"TX{uid.hex[8:14].upper()}"

            if tx_id in existing_tx_ids:
                skipped += 1
                continue

            # ── User ────────────────────────────────────────────────────────
            user = upsert_user(db, name_orig, old_balance_orig, seen_users)
            if user not in users_to_add and name_orig not in existing_tx_ids:
                users_to_add.append(user)

            # ── Merchant / Destination ───────────────────────────────────────
            merchant = upsert_merchant(db, name_dest, seen_merchants)
            if merchant not in merchants_to_add:
                merchants_to_add.append(merchant)

            # ── Risk Scoring ─────────────────────────────────────────────────
            # Derive realistic per-row signals from the CSV columns
            new_balance_orig = float(row.get("newbalanceOrig", 0))
            old_balance_dest = float(row.get("oldbalanceDest", 0))
            new_balance_dest = float(row.get("newbalanceDest", 0))

            # User average: use actual old balance as a proxy for typical spending
            # but vary it realistically — avoid every row having 5% of balance
            avg_tx = max(old_balance_orig * 0.10, 500.0) if old_balance_orig > 0 else 1000.0

            location = derive_location(name_orig)

            # New device: true for TRANSFER/CASH_OUT (higher-risk types),
            # and for rows where the origin balance is fully drained (hallmark of fraud)
            balance_drained = (old_balance_orig > 0 and new_balance_orig == 0.0)
            high_risk_type = tx_type in TRANSFER_TYPES
            is_new_device = (is_fraud and high_risk_type) or balance_drained

            # Velocity: simulate based on transaction type and step
            # CASH_OUT/TRANSFER fraud clusters → higher count
            if is_fraud and tx_type in TRANSFER_TYPES:
                recent_velocity = random.randint(3, 15)
            elif high_risk_type:
                recent_velocity = random.randint(1, 5)
            else:
                recent_velocity = 1

            # Derive location for destination to detect anomaly
            dest_location = derive_location(name_dest)
            # If sender and receiver are in different cities, flag as anomalous location
            if dest_location != location and is_fraud:
                tx_location = dest_location  # use dest city to trigger location rule
            else:
                tx_location = location

            tx_dict = {"amount": amount, "is_new_device": is_new_device, "location": tx_location}
            user_dict = {"average_transaction": avg_tx, "usual_location": location}  # user's usual = their own city
            merchant_dict = {
                "account_age_days": merchant.account_age_days,
                "risk_category": merchant.risk_category,
            }

            scoring = calculate_risk(tx_dict, user_dict, merchant_dict, recent_transaction_count=recent_velocity)

            # For ground-truth fraud rows: ensure score is at least moderately high,
            # but preserve the real engine output if it's already high enough
            if is_fraud:
                risk_score = max(scoring["risk_score"], 55)
                if risk_score >= 86:
                    risk_level = "CRITICAL"
                elif risk_score >= 70:
                    risk_level = "HIGH"
                else:
                    risk_level = "MEDIUM"
            else:
                risk_score = scoring["risk_score"]
                risk_level = scoring["risk_level"]

            # Determine status
            if is_fraud:
                status = "FLAGGED"
            elif risk_score > 30:
                status = "FLAGGED"
            else:
                status = "APPROVED"

            risk_factors = scoring["risk_factors"]
            if is_flagged and "System flagged" not in risk_factors:
                risk_factors = risk_factors + ["System flagged"]

            # ── Transaction ──────────────────────────────────────────────────
            device_id = f"DEV_{uuid.uuid5(uuid.NAMESPACE_DNS, name_orig).hex[:6].upper()}"
            tx = Transaction(
                id=tx_id,
                tx_code=tx_code,
                user_id=name_orig,
                merchant_id=name_dest,
                amount=amount,
                currency="INR",
                device_id=device_id,
                is_new_device=is_new_device,
                location=location,
                ip_address=f"10.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}",
                timestamp=step_to_datetime(step),
                status=status,
                risk_score=risk_score,
                risk_level=risk_level,
                risk_factors=risk_factors,
            )
            txs_to_add.append(tx)
            existing_tx_ids.add(tx_id)
            imported += 1

            # ── Batch commit ─────────────────────────────────────────────────
            if len(txs_to_add) >= BATCH_SIZE:
                _flush(db, users_to_add, merchants_to_add, txs_to_add)
                users_to_add.clear()
                merchants_to_add.clear()
                txs_to_add.clear()
                print(f"   ✔  {imported} transactions committed…")

        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f"   ⚠ Row error: {e}")
            continue

    # Final flush
    if txs_to_add:
        _flush(db, users_to_add, merchants_to_add, txs_to_add)

    db.close()

    print("\n" + "=" * 50)
    print(f"✅  Import complete!")
    print(f"   Transactions imported : {imported}")
    print(f"   Rows skipped (dup)    : {skipped}")
    print(f"   Errors                : {errors}")
    print(f"   Unique users          : {len(seen_users)}")
    print(f"   Unique merchants      : {len(seen_merchants)}")
    print("=" * 50 + "\n")


def _flush(db, users, merchants, txs):
    """Bulk-insert users, merchants and transactions, ignoring duplicates."""
    try:
        # Use merge (upsert) so we can safely re-run without PK conflicts
        for u in users:
            db.merge(u)
        for m in merchants:
            db.merge(m)
        for t in txs:
            db.merge(t)
        db.commit()
    except Exception as e:
        db.rollback()
        # Fall back to one-by-one insertion so a single bad row doesn't kill the batch
        _flush_one_by_one(db, users, merchants, txs)


def _flush_one_by_one(db, users, merchants, txs):
    """Insert records individually, silently skipping duplicates."""
    for u in users:
        try:
            db.merge(u)
            db.commit()
        except Exception:
            db.rollback()
    for m in merchants:
        try:
            db.merge(m)
            db.commit()
        except Exception:
            db.rollback()
    for t in txs:
        try:
            db.merge(t)
            db.commit()
        except Exception:
            db.rollback()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed RiskForge DB from PaySim CSV")
    parser.add_argument("--limit", type=int, default=10000, help="Number of rows to import (default: 10000)")
    parser.add_argument("--csv", type=str, default=DEFAULT_CSV_PATH, help="Path to PaySim CSV file")
    parser.add_argument("--wipe", action="store_true", help="Drop and recreate all DB tables first")
    parser.add_argument("--all", dest="import_all", action="store_true", help="Import ALL rows (slow!)")
    args = parser.parse_args()

    csv_path = os.path.abspath(args.csv)
    if not os.path.exists(csv_path):
        print(f"❌  CSV not found at: {csv_path}")
        sys.exit(1)

    print(f"📁  CSV path : {csv_path}")
    print(f"🎯  Limit    : {'ALL' if args.import_all else args.limit}")
    print(f"🗑️   Wipe DB  : {args.wipe}")

    seed(csv_path, args.limit, args.wipe, args.import_all)
