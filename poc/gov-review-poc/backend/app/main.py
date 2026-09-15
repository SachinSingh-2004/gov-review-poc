from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.models import User
from app.routers import auth_router, project_router, review_router, context_router

# Initialize tables
Base.metadata.create_all(bind=engine)

from app.seed import seed

# Auto seed data if fresh database
def auto_seed():
    try:
        seed()
    except Exception as e:
        print("Auto seed error:", e)

auto_seed()

app = FastAPI(
    title="Governance Review POC API",
    version="1.0.0",
    docs_url="/docs"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/api")
app.include_router(project_router.router, prefix="/api")
app.include_router(review_router.router, prefix="/api")
app.include_router(context_router.router, prefix="/api")

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Governance Review POC API (Strict 12 Entities)",
        "version": "1.0.0",
        "docs": "/docs"
    }
