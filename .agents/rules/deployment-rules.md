# Strict Rule: Docker and Render Platform Readiness

## Core Requirement
The PharmaHealth project MUST ALWAYS remain **Docker-ready** and **Render platform-ready** at all times. Every modification to code, configuration, ports, dependencies, or environment variables must maintain full compatibility with both deployment targets.

## Strict Directives:

1. **Docker Readiness**:
   - `Dockerfile` at the root and any component Dockerfiles (`backend/Dockerfile`, `frontend/Dockerfile`) must remain strictly valid and buildable.
   - `docker-compose.yml` must orchestrate the entire stack seamlessly:
     - MySQL 8 service with healthcheck and database initialization (`database.sql`).
     - Spring Boot backend service with environment variables for database connection and JWT security.
     - React frontend service served cleanly.
     - Static showcase page service.
   - All environment variables used in code must have matching defaults or configurations in Dockerfiles and `docker-compose.yml`.

2. **Render Platform Readiness**:
   - `render.yaml` must always be kept synchronized with the project services.
   - Health check endpoints (e.g., `/api/public/health`) must be maintained and responding.
   - Build commands and static publish paths (`./frontend/dist`, `./static-page`) must match actual project output directories.
   - Database connection string mappings and production environment variables must remain aligned with backend expectations.

3. **Continuous Git Synchronization**:
   - Every feature, update, or bugfix must be committed and pushed to the remote repository `https://github.com/ayushpalg46/PharmaHealth.git` on branch `main`.
   - Never break container builds or Render deployment configurations when introducing changes.
