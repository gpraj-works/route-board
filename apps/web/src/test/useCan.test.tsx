import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Permission, UserRole } from '@whosonsite/shared'
import { describe, expect, it, vi } from 'vitest'

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: {
    isAuthenticated: false,
    isLoading: false,
    user: null as null | { role: UserRole }
  }
}))

vi.mock('../components/auth/AuthContext', () => ({
  useAuth: () => mockAuth
}))

import { Can, RequirePermission, useCan } from '../components/auth/RequirePermission'

const TestHookComponent: React.FC<{ permission: Permission | readonly Permission[] }> = ({
  permission
}) => {
  const allowed = useCan(permission)
  return <div data-testid="can-result">{allowed ? 'ALLOWED' : 'DENIED'}</div>
}

describe('useCan hook', () => {
  it('returns false when user is not authenticated', () => {
    mockAuth.user = null
    mockAuth.isAuthenticated = false

    render(<TestHookComponent permission={Permission.JOBS_VIEW_ALL} />)
    expect(screen.getByTestId('can-result')).toHaveTextContent('DENIED')
  })

  it('evaluates OWNER permissions correctly', () => {
    mockAuth.isAuthenticated = true
    mockAuth.user = { role: UserRole.OWNER }

    render(<TestHookComponent permission={Permission.BILLING_MANAGE} />)
    expect(screen.getByTestId('can-result')).toHaveTextContent('ALLOWED')
  })

  it('denies ADMIN from billing manage permission', () => {
    mockAuth.isAuthenticated = true
    mockAuth.user = { role: UserRole.ADMIN }

    render(<TestHookComponent permission={Permission.BILLING_MANAGE} />)
    expect(screen.getByTestId('can-result')).toHaveTextContent('DENIED')
  })

  it('allows STAFF read-only jobs view and denies job deletion', () => {
    mockAuth.isAuthenticated = true
    mockAuth.user = { role: UserRole.STAFF }

    const { unmount } = render(<TestHookComponent permission={Permission.JOBS_VIEW_ALL} />)
    expect(screen.getByTestId('can-result')).toHaveTextContent('ALLOWED')
    unmount()

    render(<TestHookComponent permission={Permission.JOBS_DELETE} />)
    expect(screen.getByTestId('can-result')).toHaveTextContent('DENIED')
  })

  it('allows AGENT route plans view and denies company-wide jobs view', () => {
    mockAuth.isAuthenticated = true
    mockAuth.user = { role: UserRole.AGENT }

    const { unmount } = render(<TestHookComponent permission={Permission.ROUTE_PLANS_VIEW_OWN} />)
    expect(screen.getByTestId('can-result')).toHaveTextContent('ALLOWED')
    unmount()

    render(<TestHookComponent permission={Permission.JOBS_VIEW_ALL} />)
    expect(screen.getByTestId('can-result')).toHaveTextContent('DENIED')
  })

  it('evaluates anyOf permission array correctly', () => {
    mockAuth.isAuthenticated = true
    mockAuth.user = { role: UserRole.AGENT }

    render(<TestHookComponent permission={[Permission.JOBS_VIEW_ALL, Permission.JOBS_VIEW_OWN]} />)
    expect(screen.getByTestId('can-result')).toHaveTextContent('ALLOWED')
  })
})

describe('Can component', () => {
  it('renders children when user has permission', () => {
    mockAuth.isAuthenticated = true
    mockAuth.user = { role: UserRole.ADMIN }

    render(
      <Can do={Permission.USERS_CREATE}>
        <div>Create Member Button</div>
      </Can>
    )

    expect(screen.getByText('Create Member Button')).toBeInTheDocument()
  })

  it('renders fallback when user lacks permission', () => {
    mockAuth.isAuthenticated = true
    mockAuth.user = { role: UserRole.STAFF }

    render(
      <Can do={Permission.USERS_CREATE} fallback={<div>No Permission</div>}>
        <div>Create Member Button</div>
      </Can>
    )

    expect(screen.queryByText('Create Member Button')).not.toBeInTheDocument()
    expect(screen.getByText('No Permission')).toBeInTheDocument()
  })
})

describe('RequirePermission component', () => {
  it('renders children when permission check passes', () => {
    mockAuth.isAuthenticated = true
    mockAuth.user = { role: UserRole.OWNER }

    render(
      <MemoryRouter>
        <RequirePermission permission={Permission.BILLING_VIEW}>
          <div>Protected Content</div>
        </RequirePermission>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /dashboard when user lacks permission', () => {
    mockAuth.isAuthenticated = true
    mockAuth.user = { role: UserRole.AGENT }

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RequirePermission permission={Permission.USERS_VIEW}>
                <div>Protected People Page</div>
              </RequirePermission>
            }
          />
          <Route path="/dashboard" element={<div>Dashboard Redirected</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Dashboard Redirected')).toBeInTheDocument()
    expect(screen.queryByText('Protected People Page')).not.toBeInTheDocument()
  })
})
