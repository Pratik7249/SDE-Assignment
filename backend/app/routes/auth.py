from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import Optional

from app.models import User
from app.database import get_db

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

class SignupRequest(BaseModel):
    username: str
    password: str
    role: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    if data.role not in ["manager", "employee", "admin", "hr"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    existing_user = db.query(User).filter_by(username=data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = pwd_context.hash(data.password)
    new_user = User(username=data.username, role=data.role, password=hashed_password)
    db.add(new_user)
    db.commit()

    return {"message": f"User {data.username} signed up successfully as {data.role}"}

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(username=data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    return {"message": "Login successful", "role": user.role}
