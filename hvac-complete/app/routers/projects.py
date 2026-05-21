from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user, require_admin
from ..services.cooling_calculator import calculate_cooling_load

router = APIRouter(tags=["Projects"])

VALID_STATUSES = [
    "Requirement Submitted",
    "Site Inspection",
    "Quotation Generated",
    "Technician Assigned",
    "Installation In Progress",
    "Quality Check",
    "Completed",
]

TECHNICIAN_ALLOWED_STATUSES = [
    "Installation In Progress",
    "Quality Check",
    "Completed",
]


def get_project_or_404(project_id: int, db: Session) -> models.Project:
    project = (
        db.query(models.Project)
        .options(joinedload(models.Project.client), joinedload(models.Project.technician))
        .filter(models.Project.id == project_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/projects", response_model=schemas.ProjectOut, status_code=201)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    client = db.query(models.User).filter(
        models.User.id == project.client_id,
        models.User.role == "client",
    ).first()
    if not client:
        raise HTTPException(status_code=400, detail="Invalid client ID")

    cooling_load, ton = calculate_cooling_load(
        project.room_area, project.windows, project.floor
    )

    db_project = models.Project(
        room_area=project.room_area,
        floor=project.floor,
        windows=project.windows,
        ac_type=project.ac_type,
        notes=project.notes,
        cooling_load=cooling_load,
        recommended_ton=ton,
        status="Requirement Submitted",
        client_id=project.client_id,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return get_project_or_404(db_project.id, db)


@router.get("/projects", response_model=List[schemas.ProjectOut])
def get_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    status: Optional[str] = Query(None),
):
    query = db.query(models.Project).options(
        joinedload(models.Project.client),
        joinedload(models.Project.technician),
    )

    role = current_user.role.lower()
    if role == "admin":
        pass  # sees all
    elif role == "client":
        query = query.filter(models.Project.client_id == current_user.id)
    elif role == "technician":
        query = query.filter(models.Project.technician_id == current_user.id)
    else:
        return []

    if status:
        query = query.filter(models.Project.status == status)

    return query.order_by(models.Project.created_at.desc()).all()


@router.get("/projects/{project_id}", response_model=schemas.ProjectOut)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = get_project_or_404(project_id, db)
    role = current_user.role.lower()
    if role == "client" and project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if role == "technician" and project.technician_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return project


@router.put("/projects/{project_id}/assign", response_model=schemas.ProjectOut)
def assign_technician(
    project_id: int,
    body: schemas.AssignTechnician,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    project = get_project_or_404(project_id, db)

    tech = db.query(models.User).filter(
        models.User.id == body.technician_id,
        models.User.role == "technician",
    ).first()
    if not tech:
        raise HTTPException(status_code=400, detail="Invalid technician ID")

    project.technician_id = body.technician_id
    if project.status == "Requirement Submitted":
        project.status = "Technician Assigned"
    db.commit()
    return get_project_or_404(project_id, db)


@router.put("/projects/{project_id}/status", response_model=schemas.ProjectOut)
def update_status(
    project_id: int,
    body: schemas.StatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = get_project_or_404(project_id, db)
    new_status = body.new_status
    role = current_user.role.lower()

    if new_status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Valid: {VALID_STATUSES}")

    if role == "admin":
        project.status = new_status
    elif role == "technician":
        if project.technician_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your project")
        if new_status not in TECHNICIAN_ALLOWED_STATUSES:
            raise HTTPException(
                status_code=403,
                detail=f"Technicians can only set: {TECHNICIAN_ALLOWED_STATUSES}"
            )
        project.status = new_status
    else:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.commit()
    return get_project_or_404(project_id, db)


@router.delete("/projects/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    total = db.query(models.Project).count()
    completed = db.query(models.Project).filter(models.Project.status == "Completed").count()
    in_progress = db.query(models.Project).filter(
        models.Project.status == "Installation In Progress"
    ).count()
    pending = db.query(models.Project).filter(
        models.Project.status == "Requirement Submitted"
    ).count()
    clients = db.query(models.User).filter(models.User.role == "client").count()
    technicians = db.query(models.User).filter(models.User.role == "technician").count()

    return {
        "total_projects": total,
        "completed": completed,
        "in_progress": in_progress,
        "pending": pending,
        "total_clients": clients,
        "total_technicians": technicians,
    }
