import { describe, expect, it, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/app'
import { seedDatabase } from '../../src/infrastructure/database/seed'

describe('Analytics & Personal Performance Integration Tests', () => {
  let adminToken: string
  let agentToken: string
  let staffToken: string

  beforeAll(async () => {
    await seedDatabase()

    // Login as Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@acmehvac.com', password: 'password123' })
    adminToken = adminRes.body.data.accessToken

    // Login as Agent
    const agentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tech1@acmehvac.com', password: 'password123' })
    agentToken = agentRes.body.data.accessToken

    // Login as Staff
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff@acmehvac.com', password: 'password123' })
    staffToken = staffRes.body.data.accessToken
  })

  it('retrieves company summary analytics including totalUsersCount and topAgents', async () => {
    const res = await request(app)
      .get('/api/analytics/summary')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.totalUsersCount).toBeGreaterThan(0)
    expect(Array.isArray(res.body.data.topAgents)).toBe(true)
    expect(res.body.data.topAgents.length).toBeGreaterThan(0)
    expect(res.body.data.topAgents[0]).toHaveProperty('completionPct')
  })

  it('blocks field agent from viewing company summary analytics (returns 403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/analytics/summary')
      .set('Authorization', `Bearer ${agentToken}`)

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })

  it('retrieves personal technician analytics via GET /api/analytics/me', async () => {
    const res = await request(app)
      .get('/api/analytics/me')
      .set('Authorization', `Bearer ${agentToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('jobsByStatus')
    expect(res.body.data).toHaveProperty('completionRate')
    expect(res.body.data).toHaveProperty('avgCompletionTimeMinutes')
    expect(res.body.data).toHaveProperty('todayJobsCount')
    expect(res.body.data).toHaveProperty('completedTodayCount')
  })

  it('blocks staff from accessing personal agent analytics (returns 403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/analytics/me')
      .set('Authorization', `Bearer ${staffToken}`)

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })
})
