# TaskFlow Architecture Documentation

This project implements a modular Django monolith backend and a React single-page frontend for a team task management application.

## Overview

- Users can register and sign in with JWT authentication.
- Workspaces define collaboration boundaries.
- Projects belong to a workspace.
- Tasks belong to a project and may be assigned to a member.
- Comments belong to tasks and track discussion threads.
- Dashboard APIs aggregate counts and status summaries.

## Backend architecture

- `accounts`: custom user model, registration, profile APIs.
- `workspaces`: workspace and membership models.
- `projects`: project model and project API endpoints.
- `tasks`: task lifecycle and assignment logic.
- `comments`: task comment creation and listing.
- `core`: dashboard summary logic.

## Frontend architecture

- `App.jsx` provides the authenticated dashboard and auth screens.
- Workspaces, projects, and tasks are managed through form-based UI and API requests.
- API calls are made to `/api/v1` with bearer token authentication.

## Security

- Server-side permission checks enforce workspace access.
- JWT tokens are required for protected endpoints.
- Users can only manage resources inside their accessible workspaces.
