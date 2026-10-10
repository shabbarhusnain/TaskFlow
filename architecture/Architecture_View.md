# TaskFlow Architecture View

```plantuml
@startuml
left to right direction
actor User
package "React Frontend" {
  component "Auth screen" as Auth
  component "Dashboard" as Dashboard
  component "Workspaces / Projects / Tasks UI" as Workflows
}
package "Django Backend" {
  component "Authentication API" as AuthApi
  component "Workspace API" as WorkspaceApi
  component "Project API" as ProjectApi
  component "Task API" as TaskApi
  component "Comment API" as CommentApi
  component "Dashboard Summary" as SummaryApi
  database "SQLite/PostgreSQL" as DB
}

User --> Auth
User --> Dashboard
Auth --> AuthApi
Dashboard --> WorkspaceApi
Dashboard --> ProjectApi
Dashboard --> TaskApi
Dashboard --> CommentApi
Dashboard --> SummaryApi
AuthApi --> DB
WorkspaceApi --> DB
ProjectApi --> DB
TaskApi --> DB
CommentApi --> DB
SummaryApi --> DB
@enduml
```

The architecture follows the documented modular monolith design: a React SPA talks to a DRF API layer, which persists state in PostgreSQL (or SQLite for local development), with workspace-scoped authorization enforced on the backend.
