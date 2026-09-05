import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend directory is on sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base
from routes import transactions, decisions

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RiskForge API",
    description="AI-Powered Transaction Fraud Detection & Investigation Engine (Razorpay AI Buildathon)",
    version="1.0.0"
)

# Enable CORS for local dev & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router)
app.include_router(decisions.router)

@app.get("/")
def root():
    return {
        "service": "RiskForge Fraud Investigation Engine",
        "status": "ONLINE",
        "documentation": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
