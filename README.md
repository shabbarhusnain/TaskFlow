# TaskFlow

TaskFlow is a full-stack project and task management application designed around the architecture described in the project documentation. It includes a Django REST Framework backend with JWT authentication and a React frontend for workspaces, projects, tasks, and comments.

## Stack

- Backend: Python, Django, DRF
- Frontend: React + Vite
- Database: PostgreSQL (configured as default when `DATABASE_URL` is set; SQLite is used locally by default)

## Features

- User registration and sign-in using JWT tokens
- Workspace creation and membership tracking
- Project management scoped to workspaces
- Task creation, assignment, status updates, and due dates
- Task comments
- Dashboard summary for workspace metrics
- Automated API tests and frontend smoke tests

## Repository layout

```text
backend/          Django project and REST API
frontend/         React frontend
README.md         Project overview and local setup
.dockerignore     Docker-related exclusions
.env.example      Sample environment variables

docker-compose.yml  Local container orchestration outline
```

## Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py test
python manage.py runserver 0.0.0.0:8000
```

For PostgreSQL, export the following before starting the app:

```bash
export DATABASE_URL=postgresql://taskflow:taskflow@localhost:5432/taskflow
export POSTGRES_DB=taskflow
export POSTGRES_USER=taskflow
export POSTGRES_PASSWORD=taskflow
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

The frontend expects the backend at `http://localhost:8000/api/v1` by default.

## Running tests

```bash
cd backend && python manage.py test
cd frontend && npm test
```

## Docker / Compose

A Compose outline is included at the repository root for local multi-container development:

```bash
docker compose up --build
```

## Notes

- Authentication and authorization are enforced by Django/DRF.
- Frontend-only checks are not treated as security controls.
- The project is intentionally built as a modular monolith suitable for a portfolio deployment.
