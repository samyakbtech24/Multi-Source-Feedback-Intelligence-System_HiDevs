import time
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import feedback, analytics

# Create database tables automatically at startup.
# In a full production application, we would use Alembic for schema migrations.
# But for a rapid MVP, declarative creation is optimal and self-contained.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Feedback Intelligence Platform API",
    description="REST API for parsing, analyzing, and reporting customer feedback using Gemini AI.",
    version="1.0.0"
)

# Custom performance response-time middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Response-Time"] = f"{process_time * 1000:.2f}ms"
    return response

# Set up CORS middleware to allow communication from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Response-Time"],  # Expose the response-time header to browser JS
)

# Include routers
app.include_router(feedback.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "AI Feedback Intelligence Platform API",
        "docs_url": "/docs"
    }

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """
    Operational Health Check executing a database ping to verify pool health.
    """
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "gemini_api_key_configured": bool(settings.GEMINI_API_KEY),
            "model_configured": settings.GEMINI_MODEL
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )
    finally:
        db.close()

