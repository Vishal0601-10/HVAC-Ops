from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    password = Column(String(500), nullable=False)
    role = Column(String(50), nullable=False)  # admin | technician | client
    phone = Column(String(20), nullable=True)
    registration_code = Column(String(50), unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    client_projects = relationship(
        "Project", foreign_keys="Project.client_id", back_populates="client"
    )
    technician_projects = relationship(
        "Project", foreign_keys="Project.technician_id", back_populates="technician"
    )


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    room_area = Column(Integer, nullable=False)
    floor = Column(String(50), nullable=False)
    windows = Column(Integer, nullable=False)
    ac_type = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)

    cooling_load = Column(Integer)
    recommended_ton = Column(String(50))

    status = Column(String(100), default="Requirement Submitted")

    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    client = relationship("User", foreign_keys=[client_id], back_populates="client_projects")
    technician = relationship("User", foreign_keys=[technician_id], back_populates="technician_projects")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
