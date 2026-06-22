from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# Base properties shared across schemas
class FeedbackBase(BaseModel):
    customer_name: Optional[str] = None
    feedback_text: str
    rating: Optional[int] = Field(None, ge=1, le=5)

# Properties to receive on Feedback creation (CSV / API import)
class FeedbackCreate(FeedbackBase):
    pass

# Properties to update (mostly by the AI analyzer)
class FeedbackUpdate(BaseModel):
    sentiment: Optional[str] = None
    category: Optional[str] = None
    status: str

# Properties returned to client
class FeedbackResponse(FeedbackBase):
    id: int
    sentiment: Optional[str] = None
    category: Optional[str] = None
    suggested_response: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Analytics Response Schema definitions
class SentimentCount(BaseModel):
    sentiment: str
    count: int

class CategoryCount(BaseModel):
    category: str
    count: int

class AnalyticsSummary(BaseModel):
    total_feedback: int
    processed_feedback: int
    pending_feedback: int
    average_rating: Optional[float] = None
    sentiment_distribution: List[SentimentCount]
    category_distribution: List[CategoryCount]
