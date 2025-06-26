from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)

    feedback_given = relationship(
        "Feedback",
        back_populates="manager",
        foreign_keys="Feedback.manager_id"
    )
    feedback_received = relationship(
        "Feedback",
        back_populates="employee",
        foreign_keys="Feedback.employee_id"
    )

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    manager_id = Column(Integer, ForeignKey("users.id"))
    employee_id = Column(Integer, ForeignKey("users.id"))

    strengths = Column(Text)
    improvements = Column(Text)
    sentiment = Column(String) 
    timestamp = Column(DateTime, default=datetime.utcnow)
    acknowledged = Column(Boolean, default=False)
    anonymous = Column(Boolean, default=False)
    employee_comment = Column(Text, nullable=True)

    manager = relationship(
        "User",
        back_populates="feedback_given",
        foreign_keys=[manager_id]
    )
    employee = relationship(
        "User",
        back_populates="feedback_received",
        foreign_keys=[employee_id]
    )
