import { eq } from 'drizzle-orm'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { db } from '../../src/infrastructure/database/client'
import { companies } from '../../src/infrastructure/database/schema'
import { seedDatabase } from '../../src/infrastructure/database/seed'

describe('Billing & Subscription Integration Tests', () => {
  let ownerToken: string
  let staffToken: string

  beforeAll(async () => {
    await seedDatabase()

    const ownerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@acmehvac.com', password: 'password123' })
    ownerToken = ownerRes.body.data.accessToken

    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff@acmehvac.com', password: 'password123' })
    staffToken = staffRes.body.data.accessToken
  })

  it('reports an active trial status for a freshly seeded company', async () => {
    const res = await request(app)
      .get('/api/subscription/status')
      .set('Authorization', `Bearer ${ownerToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('trial')
    expect(res.body.data.plan).toBe('professional')
    expect(res.body.data.requiresCheckout).toBe(false)
    expect(res.body.data.daysRemaining).toBeGreaterThan(0)
    expect(res.body.data.isTrialExpired).toBe(false)
  })

  it('keeps protected business routes reachable during an active trial', async () => {
    const res = await request(app)
      .get('/api/jobs')
      .set('Authorization', `Bearer ${ownerToken}`)

    expect(res.status).toBe(200)
  })

  it('blocks expired trials from protected routes with TRIAL_EXPIRED', async () => {
    const companyA = (
      await db.select({ id: companies.id }).from(companies).where(eq(companies.name, 'Acme HVAC Services'))
    )[0]
    await db
      .update(companies)
      .set({
        trialStartedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        trialEndsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      })
      .where(eq(companies.id, companyA.id))

    const statusRes = await request(app)
      .get('/api/subscription/status')
      .set('Authorization', `Bearer ${ownerToken}`)

    expect(statusRes.status).toBe(200)
    expect(statusRes.body.data.requiresCheckout).toBe(true)

    const blockedRes = await request(app)
      .get('/api/jobs')
      .set('Authorization', `Bearer ${ownerToken}`)

    expect(blockedRes.status).toBe(403)
    expect(blockedRes.body.error.code).toBe('TRIAL_EXPIRED')
  })

  it('returns a sandbox checkout session without charging a payment', async () => {
    const res = await request(app)
      .post('/api/subscription/checkout')
      .set('Authorization', `Bearer ${ownerToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.sandbox).toBe(true)
    expect(res.body.data.provider).toBe('sandbox')
    expect(res.body.data.plan.id).toBe('professional')
  })

  it('confirming the sandbox checkout activates the subscription and restores access', async () => {
    const confirmRes = await request(app)
      .post('/api/subscription/checkout/confirm')
      .set('Authorization', `Bearer ${ownerToken}`)

    expect(confirmRes.status).toBe(200)
    expect(confirmRes.body.data.status).toBe('active')
    expect(confirmRes.body.data.requiresCheckout).toBe(false)

    const restoredRes = await request(app)
      .get('/api/jobs')
      .set('Authorization', `Bearer ${ownerToken}`)

    expect(restoredRes.status).toBe(200)
  })

  it('cancelling the subscription locks the company out until it subscribes again', async () => {
    const cancelRes = await request(app)
      .put('/api/subscription/cancel')
      .set('Authorization', `Bearer ${ownerToken}`)

    expect(cancelRes.status).toBe(200)
    expect(cancelRes.body.data.status).toBe('cancelled')
    expect(cancelRes.body.data.requiresCheckout).toBe(true)

    const statusRes = await request(app)
      .get('/api/subscription/status')
      .set('Authorization', `Bearer ${ownerToken}`)

    expect(statusRes.status).toBe(200)
    expect(statusRes.body.data.requiresCheckout).toBe(true)

    const blockedRes = await request(app)
      .get('/api/jobs')
      .set('Authorization', `Bearer ${ownerToken}`)

    expect(blockedRes.status).toBe(403)
    expect(blockedRes.body.error.code).toBe('SUBSCRIPTION_REQUIRED')
  })

  it('restricts billing management to the owner role', async () => {
    const res = await request(app)
      .post('/api/subscription/checkout')
      .set('Authorization', `Bearer ${staffToken}`)

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })

  it('acknowledges provider webhooks without authentication', async () => {
    const res = await request(app)
      .post('/api/subscription/webhook')
      .send({ type: 'checkout.session.completed' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})