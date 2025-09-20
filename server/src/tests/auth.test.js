process.env.ADMIN_BOOTSTRAP_TOKEN = 'test-bootstrap-token';
const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const EmailVerificationToken = require('../models/emailVerificationToken.model');
const { ROLES } = require('../config/rbac');

const register = async (user) => {
  return request(app).post('/api/auth/register').send(user);
};

const verifyUserByEmail = async (userId) => {
  const tokenDoc = await EmailVerificationToken.findOne({ userId });
  if (!tokenDoc) {
    throw new Error('Verification token not found');
  }
  return request(app).post('/api/auth/verify-email').send({ token: tokenDoc.token });
};

describe('Authentication and RBAC', () => {
  it('allows creating an admin with a valid bootstrap token', async () => {
    const response = await request(app).post('/api/auth/bootstrap-admin').send({
      bootstrapToken: 'test-bootstrap-token',
      name: 'Bootstrap Admin',
      email: 'bootstrap-admin@example.com',
      password: 'password123'
    });
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.role).toBe('Admin');
    expect(Array.isArray(response.headers['set-cookie'])).toBe(true);
  });

  it('rejects admin bootstrap with an invalid token', async () => {
    const response = await request(app).post('/api/auth/bootstrap-admin').send({
      bootstrapToken: 'wrong-token',
      name: 'Bad Actor',
      email: 'bad-admin@example.com',
      password: 'password123'
    });
    expect(response.status).toBe(403);
  });

  it('requires email verification and admin approval before login', async () => {
    const email = 'awaiting@example.com';
    const registerResponse = await register({
      name: 'Awaiting User',
      email,
      password: 'password123'
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.data.requiresEmailVerification).toBe(true);
    const userId = registerResponse.body.data.user.id;

    const loginBeforeVerify = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
    expect(loginBeforeVerify.status).toBe(403);
    expect(loginBeforeVerify.body.message).toMatch(/email not verified/i);

    const verifyResponse = await verifyUserByEmail(userId);
    expect(verifyResponse.status).toBe(200);

    const loginBeforeApproval = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
    expect(loginBeforeApproval.status).toBe(403);
    expect(loginBeforeApproval.body.message).toMatch(/awaiting approval/i);

    await User.findByIdAndUpdate(userId, {
      approvalStatus: 'approved',
      status: 'active',
      approvedBy: userId,
      approvedAt: new Date()
    });

    const loginAfterApproval = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
    expect(loginAfterApproval.status).toBe(200);
    expect(Array.isArray(loginAfterApproval.headers['set-cookie'])).toBe(true);
  });

  it('enforces RBAC for user listing', async () => {
    const adminEmail = 'admin@example.com';
    const adminRegister = await register({
      name: 'Admin User',
      email: adminEmail,
      password: 'password123'
    });
    const adminId = adminRegister.body.data.user.id;
    await verifyUserByEmail(adminId);
    await User.findByIdAndUpdate(adminId, {
      role: ROLES.ADMIN,
      approvalStatus: 'approved',
      status: 'active',
      approvedBy: adminId,
      approvedAt: new Date()
    });

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: adminEmail,
      password: 'password123'
    });
    const adminCookies = adminLogin.headers['set-cookie'];

    const adminRes = await request(app).get('/api/users').set('Cookie', adminCookies);
    expect(adminRes.status).toBe(200);

    const regularEmail = 'regular@example.com';
    const regularRegister = await register({
      name: 'Regular User',
      email: regularEmail,
      password: 'password123'
    });
    const regularId = regularRegister.body.data.user.id;
    await verifyUserByEmail(regularId);
    await User.findByIdAndUpdate(regularId, {
      approvalStatus: 'approved',
      status: 'active',
      approvedBy: adminId,
      approvedAt: new Date()
    });

    const regularLogin = await request(app).post('/api/auth/login').send({
      email: regularEmail,
      password: 'password123'
    });
    const regularCookies = regularLogin.headers['set-cookie'];

    const regularRes = await request(app).get('/api/users').set('Cookie', regularCookies);
    expect(regularRes.status).toBe(403);
  });
});
