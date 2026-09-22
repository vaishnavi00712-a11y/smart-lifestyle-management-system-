"""
Smart Lifestyle Management System - FastAPI Backend
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Smart Lifestyle Management API",
    description="FastAPI + MongoDB backend with complete user isolation, JWT auth, and lifestyle telemetry.",
    version="1.0.0"
)

# CORS Configuration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "Smart Lifestyle Management Backend (FastAPI)"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
