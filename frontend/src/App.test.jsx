import { render, screen } from '@testing-library/react'
import App from './App'

describe('TaskFlow app', () => {
  it('renders the login screen by default', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /taskflow/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /sign in/i })[0]).toBeInTheDocument()
  })
})
