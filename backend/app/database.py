from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

# Create database engine
# For SQLite, we pass check_same_thread=False; not needed for PostgreSQL
if "sqlite" in settings.DATABASE_URL:
    engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(settings.DATABASE_URL)

# Create a sessionmaker factory to generate database sessions for each request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base class for models
Base = declarative_base()

# Dependency helper to yield DB sessions per request and close them automatically
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
