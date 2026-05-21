-- HVAC DevOps System - Database Initialization
-- Tables are created by SQLAlchemy on startup.
-- This file seeds initial admin user and sample data.

-- Wait for tables to exist (created by FastAPI on first run)
-- This script runs only on first DB initialization.

-- Note: Password hashes below are bcrypt of "admin123", "tech123", "client123"
-- You can change these via the /users API endpoint after first login.

-- Seed data will be inserted via the API on first run.
-- To create the first admin user, call:
--   POST /users  {"name":"Admin","email":"admin@hvac.com","password":"admin123","role":"admin"}

SELECT 'Database initialized successfully' AS status;
