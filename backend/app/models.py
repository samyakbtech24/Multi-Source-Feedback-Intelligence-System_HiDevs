import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=True)
    feedback_text = Column(Text, nullable=False)
    rating = Column(Integer, nullable=True)
    sentiment = Column(String, nullable=True, index=True)  # Positive, Neutral, Negative
    category = Column(String, nullable=True, index=True)   # Bug, Feature Request, etc.
    suggested_response = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="PENDING")  # PENDING, PROCESSED, FAILED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
