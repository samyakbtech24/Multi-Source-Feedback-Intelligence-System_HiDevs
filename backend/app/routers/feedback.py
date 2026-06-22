import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.ai import analyze_feedback

router = APIRouter(prefix="/feedback", tags=["feedback"])

def process_pending_feedbacks_task(db_session_factory):
    """
    Background worker function that runs outside the request-response cycle
    to process all PENDING feedback records using Gemini AI.
    """
    db = db_session_factory()
    try:
        pending_items = db.query(models.Feedback).filter(models.Feedback.status == "PENDING").all()
        for item in pending_items:
            try:
                result = analyze_feedback(item.feedback_text)
                item.sentiment = result["sentiment"]
                item.category = result["category"]
                item.status = "PROCESSED"
            except Exception as e:
                item.status = "FAILED"
            db.commit()
    finally:
        db.close()

@router.post("/upload", response_model=dict)
def upload_csv(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a CSV file containing feedback.
    Expected CSV headers (flexible):
    - feedback_text / text / comment (Required)
    - customer_name / name / customer (Optional)
    - rating / score (Optional)
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    try:
        # Read the file content
        contents = file.file.read().decode("utf-8")
        csv_file = io.StringIO(contents)
        reader = csv.DictReader(csv_file)
        
        # Check if headers exist
        if not reader.fieldnames:
            raise HTTPException(status_code=400, detail="CSV file is empty or missing headers.")
            
        headers = [h.strip().lower() for h in reader.fieldnames]
        
        # Determine the column index or key for required fields
        text_col = next((h for h in reader.fieldnames if h.strip().lower() in ["feedback_text", "text", "comment", "feedback"]), None)
        name_col = next((h for h in reader.fieldnames if h.strip().lower() in ["customer_name", "name", "customer"]), None)
        rating_col = next((h for h in reader.fieldnames if h.strip().lower() in ["rating", "score"]), None)
        
        if not text_col:
            raise HTTPException(
                status_code=400, 
                detail="CSV must contain a feedback text column (e.g., 'feedback_text', 'text', 'comment')."
            )
            
        inserted_count = 0
        
        for row in reader:
            text_val = row.get(text_col)
            if not text_val or not text_val.strip():
                continue  # Skip rows without feedback text
                
            name_val = row.get(name_col).strip() if name_col and row.get(name_col) else None
            
            # Safe parse rating
            rating_val = None
            if rating_col and row.get(rating_col):
                try:
                    rating_val = int(float(row.get(rating_col).strip()))
                    if not (1 <= rating_val <= 5):
                        rating_val = None
                except ValueError:
                    rating_val = None
            
            # Create pending feedback record
            db_feedback = models.Feedback(
                customer_name=name_val,
                feedback_text=text_val.strip(),
                rating=rating_val,
                status="PENDING"
            )
            db.add(db_feedback)
            inserted_count += 1
            
        if inserted_count == 0:
            raise HTTPException(status_code=400, detail="No valid feedback rows found in CSV.")
            
        db.commit()
        
        # Queue the background processing task
        # We pass the SessionLocal generator to open a clean db transaction in the background
        from app.database import SessionLocal
        background_tasks.add_task(process_pending_feedbacks_task, SessionLocal)
        
        return {
            "message": f"Successfully imported {inserted_count} feedback records. AI processing started in the background.",
            "count": inserted_count
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process CSV file: {str(e)}")

@router.get("/", response_model=List[schemas.FeedbackResponse])
def list_feedbacks(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None, description="Filter by status (PENDING, PROCESSED, FAILED)"),
    db: Session = Depends(get_db)
):
    """
    Get a list of all feedback items with optional filtering and pagination.
    """
    return crud.get_feedbacks(db, skip=skip, limit=limit, status=status)

@router.get("/{feedback_id}", response_model=schemas.FeedbackResponse)
def get_feedback_detail(feedback_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information about a single feedback item.
    """
    db_feedback = crud.get_feedback(db, feedback_id=feedback_id)
    if not db_feedback:
        raise HTTPException(status_code=404, detail="Feedback item not found.")
    return db_feedback

@router.post("/process-pending", response_model=dict)
def trigger_analysis(background_tasks: BackgroundTasks):
    """
    Manually trigger AI analysis for any remaining PENDING feedback items.
    """
    from app.database import SessionLocal
    background_tasks.add_task(process_pending_feedbacks_task, SessionLocal)
    return {"message": "Background analysis task triggered."}
