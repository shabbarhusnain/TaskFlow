import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1'

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('taskflow_token')
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = payload.detail || payload.non_field_errors?.[0] || 'Request failed.'
    throw new Error(message)
  }

  return payload
}

const emptyTaskForm = {
  project: '',
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignee: '',
  due_date: '',
}

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [token, setToken] = useState(localStorage.getItem('taskflow_token'))
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [workspaces, setWorkspaces] = useState([])
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [summary, setSummary] = useState({ workspaces: 0, projects: 0, tasks: 0, completed_tasks: 0, priority_breakdown: { low: 0, medium: 0, high: 0 } })
  const [workspaceForm, setWorkspaceForm] = useState({ name: '', description: '' })
  const [projectForm, setProjectForm] = useState({ workspace: '', name: '', description: '' })
  const [taskForm, setTaskForm] = useState(emptyTaskForm)
  const [commentForm, setCommentForm] = useState({})

  const userName = useMemo(() => user?.username || user?.email || 'Team Member', [user])

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    const loadProfile = async () => {
      try {
        const profile = await apiRequest('/auth/me/')
        setUser(profile)
      } catch (err) {
        setError(err.message)
        handleLogout()
      }
    }

    loadProfile()
  }, [token])

  useEffect(() => {
    if (!token) return
    const loadData = async () => {
      try {
        const [workspaceData, projectData, taskData, summaryData] = await Promise.all([
          apiRequest('/workspaces/'),
          apiRequest('/projects/'),
          apiRequest('/tasks/'),
          apiRequest('/dashboard/summary/'),
        ])

        setWorkspaces(workspaceData.results || workspaceData)
        setProjects(projectData.results || projectData)
        setTasks(taskData.results || taskData)
        setSummary(summaryData)
      } catch (err) {
        setError(err.message)
      }
    }

    loadData()
  }, [token])

  useEffect(() => {
    if (projects.length && !projectForm.workspace) {
      setProjectForm((current) => ({ ...current, workspace: String(projects[0].workspace) }))
    }
  }, [projects, projectForm.workspace])

  useEffect(() => {
    if (projects.length && !taskForm.project) {
      setTaskForm((current) => ({ ...current, project: String(projects[0].id) }))
    }
  }, [projects, taskForm.project])

  const handleLogin = async (event) => {
    event.preventDefault()
    const form = event.target
    const email = form.email.value
    const password = form.password.value

    try {
      setError('')
      const response = await apiRequest('/auth/token/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      localStorage.setItem('taskflow_token', response.access)
      setToken(response.access)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    const form = event.target

    try {
      setError('')
      const payload = {
        username: form.username.value,
        email: form.email.value,
        password: form.password.value,
        first_name: form.first_name.value,
        last_name: form.last_name.value,
      }

      await apiRequest('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      setAuthMode('login')
      setError('Registration complete. You can sign in now.')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('taskflow_token')
    setToken(null)
    setUser(null)
    setError('')
  }

  const createWorkspace = async (event) => {
    event.preventDefault()
    try {
      const payload = await apiRequest('/workspaces/', {
        method: 'POST',
        body: JSON.stringify(workspaceForm),
      })
      setWorkspaces((current) => [payload, ...current])
      setWorkspaceForm({ name: '', description: '' })
    } catch (err) {
      setError(err.message)
    }
  }

  const createProject = async (event) => {
    event.preventDefault()
    try {
      const payload = await apiRequest('/projects/', {
        method: 'POST',
        body: JSON.stringify(projectForm),
      })
      setProjects((current) => [payload, ...current])
      setProjectForm({ workspace: projectForm.workspace, name: '', description: '' })
    } catch (err) {
      setError(err.message)
    }
  }

  const createTask = async (event) => {
    event.preventDefault()
    try {
      const payload = await apiRequest('/tasks/', {
        method: 'POST',
        body: JSON.stringify({ ...taskForm, assignee: taskForm.assignee || null }),
      })
      setTasks((current) => [payload, ...current])
      setTaskForm(emptyTaskForm)
    } catch (err) {
      setError(err.message)
    }
  }

  const addComment = async (taskId) => {
    const body = commentForm[taskId]
    if (!body) return

    try {
      const payload = await apiRequest(`/tasks/${taskId}/comments/`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      })
      setTasks((current) => current.map((task) =>
        task.id === taskId ? { ...task, comments: [...(task.comments || []), payload] } : task,
      ))
      setCommentForm((current) => ({ ...current, [taskId]: '' }))
    } catch (err) {
      setError(err.message)
    }
  }

  const updateTaskStatus = async (taskId, status) => {
    try {
      const payload = await apiRequest(`/tasks/${taskId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setTasks((current) => current.map((task) => (task.id === taskId ? payload : task)))
    } catch (err) {
      setError(err.message)
    }
  }

  if (!token) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-header">
            <p className="eyebrow">Portfolio project</p>
            <h1>TaskFlow</h1>
            <div className="tabs">
              <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>
                Sign in
              </button>
              <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>
                Register
              </button>
            </div>
          </div>

          {authMode === 'login' ? (
            <form className="stack" onSubmit={handleLogin}>
              <label>
                Email
                <input type="email" name="email" required />
              </label>
              <label>
                Password
                <input type="password" name="password" required />
              </label>
              <button type="submit" className="primary">Sign in</button>
            </form>
          ) : (
            <form className="stack" onSubmit={handleRegister}>
              <label>
                Username
                <input type="text" name="username" required />
              </label>
              <label>
                Email
                <input type="email" name="email" required />
              </label>
              <div className="split">
                <label>
                  First name
                  <input type="text" name="first_name" />
                </label>
                <label>
                  Last name
                  <input type="text" name="last_name" />
                </label>
              </div>
              <label>
                Password
                <input type="password" name="password" minLength="8" required />
              </label>
              <button type="submit" className="primary">Create account</button>
            </form>
          )}

          {error ? <p className="message error">{error}</p> : null}
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Workspace overview</p>
          <h2>TaskFlow</h2>
        </div>
        <div className="topbar-actions">
          <span>Signed in as {userName}</span>
          <button type="button" className="secondary" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      {error ? <p className="message error">{error}</p> : null}

      <section className="summary-grid">
        <article className="summary-card">
          <span>Workspaces</span>
          <strong>{summary.workspaces}</strong>
        </article>
        <article className="summary-card">
          <span>Projects</span>
          <strong>{summary.projects}</strong>
        </article>
        <article className="summary-card">
          <span>Tasks</span>
          <strong>{summary.tasks}</strong>
        </article>
        <article className="summary-card">
          <span>Completed</span>
          <strong>{summary.completed_tasks}</strong>
        </article>
      </section>

      <div className="content-grid">
        <section className="panel">
          <h3>Create workspace</h3>
          <form className="stack" onSubmit={createWorkspace}>
            <label>
              Name
              <input value={workspaceForm.name} onChange={(event) => setWorkspaceForm((current) => ({ ...current, name: event.target.value }))} required />
            </label>
            <label>
              Description
              <textarea value={workspaceForm.description} onChange={(event) => setWorkspaceForm((current) => ({ ...current, description: event.target.value }))} rows="3" />
            </label>
            <button type="submit" className="primary">Create workspace</button>
          </form>
        </section>

        <section className="panel">
          <h3>Create project</h3>
          <form className="stack" onSubmit={createProject}>
            <label>
              Workspace
              <select value={projectForm.workspace} onChange={(event) => setProjectForm((current) => ({ ...current, workspace: event.target.value }))} required>
                <option value="">Select workspace</option>
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
                ))}
              </select>
            </label>
            <label>
              Project name
              <input value={projectForm.name} onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))} required />
            </label>
            <label>
              Description
              <textarea value={projectForm.description} onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))} rows="3" />
            </label>
            <button type="submit" className="primary">Create project</button>
          </form>
        </section>

        <section className="panel full-width">
          <h3>Create task</h3>
          <form className="task-form" onSubmit={createTask}>
            <label>
              Project
              <select value={taskForm.project} onChange={(event) => setTaskForm((current) => ({ ...current, project: event.target.value }))} required>
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </label>
            <label>
              Title
              <input value={taskForm.title} onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))} required />
            </label>
            <label className="wide">
              Description
              <textarea value={taskForm.description} onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))} rows="3" />
            </label>
            <label>
              Status
              <select value={taskForm.status} onChange={(event) => setTaskForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label>
              Priority
              <select value={taskForm.priority} onChange={(event) => setTaskForm((current) => ({ ...current, priority: event.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              Due date
              <input type="date" value={taskForm.due_date} onChange={(event) => setTaskForm((current) => ({ ...current, due_date: event.target.value }))} />
            </label>
            <label>
              Assignee ID
              <input type="number" value={taskForm.assignee} onChange={(event) => setTaskForm((current) => ({ ...current, assignee: event.target.value }))} />
            </label>
            <button type="submit" className="primary">Add task</button>
          </form>
        </section>
      </div>

      <div className="lists-grid">
        <section className="panel">
          <h3>Workspaces</h3>
          <ul className="list-block">
            {workspaces.map((workspace) => (
              <li key={workspace.id}>
                <strong>{workspace.name}</strong>
                <span>{workspace.description || 'No description yet'}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h3>Projects</h3>
          <ul className="list-block">
            {projects.map((project) => (
              <li key={project.id}>
                <strong>{project.name}</strong>
                <span>{project.description || 'No description yet'}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel task-panel">
        <h3>Tasks</h3>
        <div className="task-list">
          {tasks.map((task) => (
            <article key={task.id} className="task-card">
              <div className="task-row">
                <strong>{task.title}</strong>
                <span className={`status-badge ${task.status}`}>{task.status.replace('_', ' ')}</span>
              </div>
              <p>{task.description || 'No extra details provided.'}</p>
              <div className="task-meta">
                <span>Priority: {task.priority}</span>
                <span>Project: {task.project}</span>
                <span>Due: {task.due_date || 'Not set'}</span>
              </div>
              <div className="task-actions">
                <select value={task.status} onChange={(event) => updateTaskStatus(task.id, event.target.value)}>
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="comments-block">
                {(task.comments || []).map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <strong>{comment.author ? 'Member' : 'Comment'}</strong>
                    <span>{comment.body}</span>
                  </div>
                ))}
              </div>
              <div className="comment-compose">
                <input
                  type="text"
                  value={commentForm[task.id] || ''}
                  placeholder="Add a comment"
                  onChange={(event) => setCommentForm((current) => ({ ...current, [task.id]: event.target.value }))}
                />
                <button type="button" className="secondary" onClick={() => addComment(task.id)}>Comment</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App
