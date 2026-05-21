# HVAC DevOps System v2.0

A complete HVAC installation lifecycle management platform with role-based access control, real-time project tracking, and automated BTU cooling load calculation.

---

## 🏗️ Architecture

```
hvac-complete/
├── app/                        # FastAPI backend
│   ├── main.py                 # App entry point + CORS
│   ├── database.py             # SQLAlchemy engine + session
│   ├── models.py               # User & Project ORM models
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── auth.py                 # JWT auth + password hashing
│   ├── routers/
│   │   ├── users.py            # User CRUD + login endpoints
│   │   └── projects.py         # Project CRUD + lifecycle endpoints
│   └── services/
│       └── cooling_calculator.py  # BTU load calculation engine
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── api.js              # Centralized API service layer
│   │   ├── App.js              # Router + protected routes
│   │   ├── pages/
│   │   │   ├── Login.js/css    # Auth page
│   │   │   ├── Register.js     # Registration page
│   │   │   ├── Dashboard.js/css # Stats & overview
│   │   │   ├── Projects.js/css  # Full project management
│   │   │   └── Users.js/css     # User management (admin)
│   │   └── components/
│   │       ├── Layout.js/css    # Sidebar + topbar shell
│   ├── nginx.conf              # Production nginx config
│   └── Dockerfile              # Multi-stage build
├── Dockerfile                  # Backend Docker image
├── docker-compose.yml          # Full stack orchestration
├── requirements.txt            # Python dependencies
└── init.sql                    # DB initialization

```

---

## 🚀 Quick Start (Docker — Recommended)

```bash
# Clone or unzip the project
cd hvac-complete

# Start everything
docker compose up --build

# Access:
#   Frontend → http://localhost:3000
#   Backend API → http://localhost:8000
#   API Docs → http://localhost:8000/docs
```

### First-time setup

Create the admin user via the registration page at `http://localhost:3000/register` or via API:

```bash
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@hvac.com","password":"admin123","role":"admin"}'
```

---

## 💻 Local Development (without Docker)

### Backend

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variable (or use .env)
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hvac_db"

# Start PostgreSQL (or use docker just for DB)
docker run -d --name hvac_pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hvac_db -p 5432:5432 postgres:16-alpine

# Run backend
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```

---

## 👥 Roles & Permissions

| Action | Admin | Technician | Client |
|--------|-------|-----------|--------|
| Create users | ✅ | ❌ | ❌ |
| Delete users | ✅ | ❌ | ❌ |
| Create projects | ✅ | ❌ | ❌ |
| View all projects | ✅ | ❌ | ❌ |
| View own projects | ✅ | ✅ | ✅ |
| Assign technician | ✅ | ❌ | ❌ |
| Update any status | ✅ | ❌ | ❌ |
| Update work status | ✅ | ✅* | ❌ |
| View dashboard stats | ✅ | ❌ | ❌ |

*Technicians can only update status of projects assigned to them, and only to: Installation In Progress, Quality Check, Completed.

---

## 🔄 Project Lifecycle

```
Requirement Submitted
       ↓
   Site Inspection
       ↓
  Quotation Generated
       ↓
  Technician Assigned   ← Admin assigns tech
       ↓
Installation In Progress  ← Technician updates
       ↓
    Quality Check         ← Technician updates
       ↓
      Completed            ← Technician updates
```

---

## 🧮 Cooling Load Calculator

Formula used:
- Base load: `area × 120 BTU`
- Window load: `windows × 500 BTU`
- Top floor bonus: `+500 BTU`
- Occupancy load: `+400 BTU` (standard 2-person)

| Total BTU | Recommended Capacity |
|-----------|---------------------|
| ≤ 9,000   | 0.75 Ton |
| ≤ 12,000  | 1 Ton |
| ≤ 18,000  | 1.5 Ton |
| ≤ 24,000  | 2 Ton |
| > 24,000  | 2.5 Ton |

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/users` | Public | Register user |
| POST | `/login` | Public | Login → JWT token |
| GET | `/users/me` | Any | Current user profile |
| GET | `/users` | Admin | All users |
| GET | `/technicians` | Admin | All technicians |
| GET | `/clients` | Admin | All clients |
| DELETE | `/users/{id}` | Admin | Delete user |
| POST | `/projects` | Admin | Create project |
| GET | `/projects` | Any | Get projects (filtered by role) |
| GET | `/projects/{id}` | Any | Get single project |
| PUT | `/projects/{id}/assign` | Admin | Assign technician |
| PUT | `/projects/{id}/status` | Admin/Tech | Update status |
| DELETE | `/projects/{id}` | Admin | Delete project |
| GET | `/stats` | Admin | Dashboard statistics |

Full interactive docs: `http://localhost:8000/docs`

---

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@db:5432/hvac_db` | PostgreSQL connection string |
| `SECRET_KEY` | `hvac-change-this-...` | JWT signing secret — **change in production!** |
| `TOKEN_EXPIRE_MINUTES` | `480` | JWT token lifetime (8 hours) |
| `REACT_APP_API_URL` | `http://localhost:8000` | Backend URL for frontend |

---

## 🔐 Production Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Use strong PostgreSQL password
- [ ] Set `REACT_APP_API_URL` to your domain
- [ ] Add HTTPS (Let's Encrypt / reverse proxy)
- [ ] Restrict CORS `allow_origins` to your domain in `app/main.py`
- [ ] Set up database backups
- [ ] Monitor with health endpoint: `GET /health`
