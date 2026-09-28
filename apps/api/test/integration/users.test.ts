import { describe, expect, it, beforeAll } from 'vitest'
import request from 'supertest'
import { UserRole, UserStatus } from '@whosonsite/shared'
import { app } from '../../src/app'
import { seedDatabase } from '../../src/infrastructure/database/seed'

describe('Users / People Management Integration Tests', () => {
  let ownerTokenA: string
  let adminTokenA: string
  let staffTokenA: string
  let ownerTokenB: string
  let createdUserId: string
  let ownerUserAId: string

  beforeAll(async () => {
    await seedDatabase()

    // Login as Owner (Company A)
    const ownerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@acmehvac.com', password: 'password123' })
    ownerTokenA = ownerRes.body.data.accessToken
    ownerUserAId = ownerRes.body.data.user.id

    // Login as Admin (Company A)
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@acmehvac.com', password: 'password123' })
    adminTokenA = adminRes.body.data.accessToken

    // Login as Staff (Company A)
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff@acmehvac.com', password: 'password123' })
    staffTokenA = staffRes.body.data.accessToken

    // Login as Owner (Company B)
    const ownerBRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@apexplumbing.com', password: 'password123' })
    ownerTokenB = ownerBRes.body.data.accessToken
  })

  it('lists users in company scope with linked agent status', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${ownerTokenA}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)

    const techUser = res.body.data.find((u: { email: string }) => u.email === 'tech1@acmehvac.com')
    expect(techUser).toBeDefined()
    expect(techUser.agentLinked).toBe(true)
    expect(techUser.agentId).toBeTruthy()
  })

  it('blocks staff from viewing or managing users (returns 403 Forbidden)', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${staffTokenA}`)

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })

  it('creates a new staff user as admin', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        email: 'newoffice@acmehvac.com',
        name: 'New Office Staff',
        password: 'password123',
        role: UserRole.STAFF
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.role).toBe(UserRole.STAFF)
    expect(res.body.data.status).toBe(UserStatus.ACTIVE)
    createdUserId = res.body.data.id
  })

  it('blocks admin from creating an owner account (returns 403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        email: 'illegalowner@acmehvac.com',
        name: 'Illegal Owner',
        password: 'password123',
        role: UserRole.OWNER
      })

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })

  it('blocks admin from modifying owner user (returns 403 Forbidden)', async () => {
    const res = await request(app)
      .patch(`/api/users/${ownerUserAId}`)
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({ name: 'Tampered Owner Name' })

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })

  it('blocks user from deactivating their own account (returns 400 Bad Request)', async () => {
    const res = await request(app)
      .patch(`/api/users/${ownerUserAId}`)
      .set('Authorization', `Bearer ${ownerTokenA}`)
      .send({ status: UserStatus.DEACTIVATED })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('updates a member name and status', async () => {
    const res = await request(app)
      .patch(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${ownerTokenA}`)
      .send({ name: 'Updated Staff Name', status: UserStatus.DEACTIVATED })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.name).toBe('Updated Staff Name')
    expect(res.body.data.status).toBe(UserStatus.DEACTIVATED)
  })

  it('executes ownership transfer: demotes current owner to admin and elevates target', async () => {
    // Re-activate user first
    await request(app)
      .patch(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${ownerTokenA}`)
      .send({ status: UserStatus.ACTIVE })

    // Transfer ownership to createdUser
    const transferRes = await request(app)
      .patch(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${ownerTokenA}`)
      .send({ role: UserRole.OWNER })

    expect(transferRes.status).toBe(200)
    expect(transferRes.body.success).toBe(true)
    expect(transferRes.body.data.role).toBe(UserRole.OWNER)

    // Verify previous owner was demoted to admin
    const prevOwnerRes = await request(app)
      .get(`/api/users/${ownerUserAId}`)
      .set('Authorization', `Bearer ${ownerTokenA}`)

    expect(prevOwnerRes.status).toBe(200)
    expect(prevOwnerRes.body.data.role).toBe(UserRole.ADMIN)
  })

  it('enforces multi-tenant isolation: company B cannot view or modify company A user', async () => {
    const res = await request(app)
      .get(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${ownerTokenB}`)

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })
})
