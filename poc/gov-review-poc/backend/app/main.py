from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.models import User
from app.routers import auth_router, project_router, review_router, context_router

# Initialize tables
Base.metadata.create_all(bind=engine)

# Auto seed data if fresh database
def auto_seed():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            import sys, os
            sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'seed')))
            try:
                import seed_demo_data
                seed_demo_data.seed()
            except Exception as e:
                print("Auto seed error:", e)
    except Exception as e:
        print("Database check error:", e)
    finally:
        db.close()

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
