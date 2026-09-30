import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import auth, users, financial, credit, dashboard, ai, reports

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Credit Assistant API",
    description="AI-Powered Credit Health & Financial Wellness Platform API tailored for the Indian credit ecosystem.",
    version="1.0.0"
)

# CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
if not origins or "*" in origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(financial.router)
app.include_router(credit.router)
app.include_router(dashboard.router)
app.include_router(ai.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {
        "app": "Credit Assistant API",
        "status": "healthy",
        "version": "1.0.0",
        "documentation": "/docs"
    }

@app.get("/health")
def healthcheck():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
