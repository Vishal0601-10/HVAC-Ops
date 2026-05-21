from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from . import models  # noqa: F401 - needed to register models
from .routers import users, projects

app = FastAPI(
    title="HVAC DevOps System",
    description="HVAC Installation Lifecycle Management API",
    version="2.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
Base.metadata.create_all(bind=engine)

# Routers
app.include_router(users.router)
app.include_router(projects.router)


@app.get("/")
def root():
    return {
        "message": "HVAC DevOps System API v2.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
