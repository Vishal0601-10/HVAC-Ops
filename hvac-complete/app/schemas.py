from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    phone: Optional[str] = None


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: Optional[str]
    registration_code: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class ProjectCreate(BaseModel):
    room_area: int
    floor: str
    windows: int
    ac_type: str
    client_id: int
    notes: Optional[str] = None


class ProjectOut(BaseModel):
    id: int
    room_area: int
    floor: str
    windows: int
    ac_type: str
    notes: Optional[str]
    cooling_load: Optional[int]
    recommended_ton: Optional[str]
    status: str
    client_id: int
    technician_id: Optional[int]
    client: Optional[UserOut]
    technician: Optional[UserOut]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    new_status: str


class AssignTechnician(BaseModel):
    technician_id: int
