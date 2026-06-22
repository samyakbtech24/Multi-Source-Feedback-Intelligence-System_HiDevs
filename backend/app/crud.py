from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models, schemas

def get_feedback(db: Session, feedback_id: int):
    return db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()

def get_feedbacks(db: Session, skip: int = 0, limit: int = 100, status: str = None):
    query = db.query(models.Feedback)
    if status:
        query = query.filter(models.Feedback.status == status)
    return query.order_by(models.Feedback.id.desc()).offset(skip).limit(limit).all()

def create_feedback(db: Session, feedback: schemas.FeedbackCreate):
    db_feedback = models.Feedback(
        customer_name=feedback.customer_name,
        feedback_text=feedback.feedback_text,
        rating=feedback.rating,
        status="PENDING"
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def update_feedback(db: Session, db_feedback: models.Feedback, feedback_update: schemas.FeedbackUpdate):
    db_feedback.sentiment = feedback_update.sentiment
    db_feedback.category = feedback_update.category
    db_feedback.status = feedback_update.status
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def get_analytics_summary(db: Session) -> schemas.AnalyticsSummary:
    # 1. Total count
    total_count = db.query(models.Feedback).count()
    
    # 2. Status counts
    processed_count = db.query(models.Feedback).filter(models.Feedback.status == "PROCESSED").count()
    pending_count = db.query(models.Feedback).filter(models.Feedback.status == "PENDING").count()
    
    # 3. Average rating
    avg_rating_query = db.query(func.avg(models.Feedback.rating)).filter(models.Feedback.rating.isnot(None)).scalar()
    avg_rating = float(avg_rating_query) if avg_rating_query is not None else None
    
    # 4. Sentiment distribution
    sentiment_query = (
        db.query(models.Feedback.sentiment, func.count(models.Feedback.id))
        .filter(models.Feedback.status == "PROCESSED")
        .group_by(models.Feedback.sentiment)
        .all()
    )
    sentiment_distribution = [
        schemas.SentimentCount(sentiment=s if s else "Unknown", count=c) 
        for s, c in sentiment_query
    ]
    
    # 5. Category distribution
    category_query = (
        db.query(models.Feedback.category, func.count(models.Feedback.id))
        .filter(models.Feedback.status == "PROCESSED")
        .group_by(models.Feedback.category)
        .all()
    )
    category_distribution = [
        schemas.CategoryCount(category=c if c else "Unknown", count=cnt) 
        for c, cnt in category_query
    ]
    
    return schemas.AnalyticsSummary(
        total_feedback=total_count,
        processed_feedback=processed_count,
        pending_feedback=pending_count,
        average_rating=avg_rating,
        sentiment_distribution=sentiment_distribution,
        category_distribution=category_distribution
    )
