from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
from typing import Optional
from collections import Counter
from sqlalchemy import desc

router = APIRouter()

class CommentBody(BaseModel):
    comment: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class FeedbackCreate(BaseModel):
    manager_username: str
    employee_username: str
    strengths: str
    improvements: str
    sentiment: str
    anonymous: Optional[bool] = False  

class FeedbackUpdate(BaseModel):
    manager_username: str
    strengths: Optional[str] = None
    improvements: Optional[str] = None
    employee_username: Optional[str] = None
    sentiment: Optional[str] = None

@router.post("/feedback")
def create_feedback(data: FeedbackCreate, db: Session = Depends(get_db)):
    manager = db.query(models.User).filter_by(username=data.manager_username, role="manager").first()
    employee = db.query(models.User).filter_by(username=data.employee_username, role="employee").first()

    if not manager or not employee:
        raise HTTPException(status_code=404, detail="Manager or employee not found")

    feedback = models.Feedback(
        manager_id=manager.id,
        employee_id=employee.id,
        strengths=data.strengths,
        improvements=data.improvements,
        sentiment=data.sentiment,
        acknowledged=False,
        anonymous=data.anonymous
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return {"message": "Feedback submitted", "feedback_id": feedback.id}

@router.get("/feedback/{username}")
def get_feedback(
    username: str,
    acknowledged: Optional[bool] = None,
    sort: Optional[str] = "desc",
    manager: Optional[str] = None,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter_by(username=username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    feedback_query = db.query(models.Feedback)

    if user.role == "employee":
        feedback_query = feedback_query.filter_by(employee_id=user.id)

        if manager:
            manager_user = db.query(models.User).filter_by(username=manager, role="manager").first()
            if manager_user:
                feedback_query = feedback_query.filter_by(manager_id=manager_user.id)

    elif user.role == "manager":
        feedback_query = feedback_query.filter_by(manager_id=user.id)

    else:
        raise HTTPException(status_code=400, detail="Invalid role")

    if acknowledged is not None:
        feedback_query = feedback_query.filter_by(acknowledged=acknowledged)

    if sort == "desc":
        feedback_query = feedback_query.order_by(desc(models.Feedback.timestamp))
    else:
        feedback_query = feedback_query.order_by(models.Feedback.timestamp)

    feedbacks = feedback_query.all()

    result = []
    for f in feedbacks:
        result.append({
            "id": f.id,
            "strengths": f.strengths,
            "improvements": f.improvements,
            "sentiment": f.sentiment,
            "timestamp": f.timestamp,
            "acknowledged": f.acknowledged,
            "from": None if f.anonymous and user.role == "employee" else f.manager.username,
            "to": f.employee.username if user.role == "manager" else None,
            "employee_comment": f.employee_comment  # ✅ Include comment
        })
    return result

@router.patch("/feedback/{feedback_id}/acknowledge")
def acknowledge_feedback(feedback_id: int, db: Session = Depends(get_db)):
    feedback = db.query(models.Feedback).filter_by(id=feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    if feedback.acknowledged:
        return {"message": "Already acknowledged"}

    feedback.acknowledged = True
    db.commit()
    return {"message": f"Feedback {feedback_id} acknowledged"}

@router.put("/feedback/{feedback_id}")
def update_feedback(feedback_id: int, data: FeedbackUpdate, db: Session = Depends(get_db)):
    feedback = db.query(models.Feedback).filter_by(id=feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    if feedback.manager.username != data.manager_username:
        raise HTTPException(status_code=403, detail="You can only update your own feedback")

    if data.employee_username:
        employee = db.query(models.User).filter_by(username=data.employee_username, role="employee").first()
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        feedback.employee_id = employee.id

    if data.strengths is not None:
        feedback.strengths = data.strengths
    if data.improvements is not None:
        feedback.improvements = data.improvements
    if data.sentiment is not None:
        feedback.sentiment = data.sentiment

    db.commit()
    db.refresh(feedback)
    return {
        "message": "Feedback updated",
        "feedback_id": feedback.id
    }

@router.get("/dashboard/manager/{username}")
def manager_dashboard(username: str, db: Session = Depends(get_db)):
    manager = db.query(models.User).filter_by(username=username, role="manager").first()
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")

    feedbacks = db.query(models.Feedback).filter_by(manager_id=manager.id).all()
    total = len(feedbacks)
    sentiments = Counter([f.sentiment for f in feedbacks])

    return {
        "manager": username,
        "total_feedbacks": total,
        "sentiment_counts": sentiments
    }

@router.get("/dashboard/employee/{username}")
def employee_dashboard(username: str, db: Session = Depends(get_db)):
    employee = db.query(models.User).filter_by(username=username, role="employee").first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    feedbacks = db.query(models.Feedback)\
        .filter_by(employee_id=employee.id)\
        .order_by(desc(models.Feedback.timestamp)).all()

    timeline = [
        {
            "id": f.id,
            "strengths": f.strengths,
            "improvements": f.improvements,
            "sentiment": f.sentiment,
            "timestamp": f.timestamp,
            "acknowledged": f.acknowledged,
            "from": None if f.anonymous else f.manager.username,
            "employee_comment": f.employee_comment  
        } for f in feedbacks
    ]

    return {
        "employee": username,
        "feedback_timeline": timeline
    }

@router.patch("/feedback/{feedback_id}/comment")
def add_comment(
    feedback_id: int,
    body: CommentBody,
    db: Session = Depends(get_db)
):
    fb = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")

    fb.employee_comment = body.comment
    db.commit()
    return {"message": "Comment added"}


