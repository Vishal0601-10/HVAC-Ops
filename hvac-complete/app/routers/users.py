from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas
from ..auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_admin
)

router = APIRouter(tags=["Users"])


def generate_registration_code(db: Session, role: str) -> str:
    role_prefix = {
        "admin": "ADM",
        "technician": "TECH",
        "client": "CLI",
    }
    prefix = role_prefix.get(role.lower(), "USR")
    count = db.query(models.User).filter(
        models.User.role == role.lower()
    ).count() + 1
    return f"{prefix}-{count:03d}"


@router.post("/users", response_model=schemas.UserOut, status_code=201)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    valid_roles = {"admin", "technician", "client"}
    if user.role.lower() not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Role must be one of: {', '.join(valid_roles)}")

    db_user = models.User(
        name=user.name,
        email=user.email.lower(),
        password=hash_password(user.password),
        role=user.role.lower(),
        phone=user.phone,
        registration_code=generate_registration_code(db, user.role),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=schemas.TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.email == form_data.username.lower()
    ).first()

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/users/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.get("/technicians", response_model=List[schemas.UserOut])
def get_technicians(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    return db.query(models.User).filter(models.User.role == "technician").all()


@router.get("/clients", response_model=List[schemas.UserOut])
def get_clients(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    return db.query(models.User).filter(models.User.role == "client").all()


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    db.delete(user)
    db.commit()
