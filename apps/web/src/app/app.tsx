import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Permission } from '@whosonsite/shared'

import { AuthProvider } from '../components/auth/AuthContext'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { PublicRoute } from '../components/auth/PublicRoute'
import { RequirePermission } from '../components/auth/RequirePermission'
import { Analytics } from '../pages/Analytics'
import { CustomerStatusPage } from '../pages/CustomerStatusPage'
import { Customers } from '../pages/Customers'
import { Dashboard } from '../pages/Dashboard'
import { Jobs } from '../pages/Jobs'
import { LandingPage } from '../pages/LandingPage'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { ForgotPassword } from '../pages/ForgotPassword'
import { ResetPassword } from '../pages/ResetPassword'
import { Settings } from '../pages/Settings'
import { AgentJobs } from '../pages/AgentJobs'
import { Agents } from '../pages/Agents'
import { RoutePlans } from '../pages/RoutePlans'
import { People } from '../pages/People'
import { Subscription } from '../pages/Subscription'
import { Checkout } from '../pages/Checkout'
import { store } from '../store'
import { queryClient } from './query/client'
import { ThemeProvider } from './theme/ThemeContext'

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider initialCompanyColor="teal">
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Homepage (marketing) */}
                <Route path="/" element={<LandingPage />} />

                {/* Public Customer Status Link */}
                <Route path="/status/:token" element={<CustomerStatusPage />} />

                {/* Public Unauthenticated Routes */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                {/* Protected Authenticated Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />

                  <Route
                    path="/my-jobs"
                    element={
                      <RequirePermission permission={Permission.JOBS_VIEW_OWN}>
                        <AgentJobs />
                      </RequirePermission>
                    }
                  />

                  <Route
                    path="/route-plans"
                    element={
                      <RequirePermission permission={Permission.ROUTE_PLANS_VIEW_OWN}>
                        <RoutePlans />
                      </RequirePermission>
                    }
                  />

                  <Route
                    path="/jobs"
                    element={
                      <RequirePermission permission={Permission.JOBS_VIEW_ALL}>
                        <Jobs />
                      </RequirePermission>
                    }
                  />

                  <Route
                    path="/analytics"
                    element={
                      <RequirePermission permission={Permission.ANALYTICS_VIEW}>
                        <Analytics />
                      </RequirePermission>
                    }
                  />

                  <Route
                    path="/agents"
                    element={
                      <RequirePermission permission={Permission.AGENTS_VIEW}>
                        <Agents />
                      </RequirePermission>
                    }
                  />

                  <Route
                    path="/customers"
                    element={
                      <RequirePermission permission={Permission.CUSTOMERS_VIEW}>
                        <Customers />
                      </RequirePermission>
                    }
                  />

                  <Route
                    path="/people"
                    element={
                      <RequirePermission permission={Permission.USERS_VIEW}>
                        <People />
                      </RequirePermission>
                    }
                  />

                  <Route
                    path="/subscription"
                    element={
                      <RequirePermission permission={Permission.BILLING_VIEW}>
                        <Subscription />
                      </RequirePermission>
                    }
                  />

                  <Route path="/checkout" element={<Checkout />} />

                  <Route path="/settings" element={<Settings />} />
                </Route>

                {/* Catch-all redirect to the public homepage */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}
