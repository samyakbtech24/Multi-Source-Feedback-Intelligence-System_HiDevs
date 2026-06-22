from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary", response_model=schemas.AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    """
    Get aggregated data for dashboard metrics:
    - Total, processed, and pending feedback counts.
    - Average customer rating.
    - Sentiment distribution counts.
    - Category distribution counts.
    """
    return crud.get_analytics_summary(db)
