const request = require('supertest');
const app = require('../app');
const Category = require('../models/category.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const EmailVerificationToken = require('../models/emailVerificationToken.model');

const registerAndActivateUser = async ({ name, email, password }) => {
  const registration = await request(app).post('/api/auth/register').send({ name, email, password });
  const userId = registration.body.data.user.id;
  const tokenDoc = await EmailVerificationToken.findOne({ userId });
  if (!tokenDoc) {
    throw new Error('Missing verification token');
  }
  await request(app).post('/api/auth/verify-email').send({ token: tokenDoc.token });
  await User.findByIdAndUpdate(userId, {
    approvalStatus: 'approved',
    status: 'active',
    approvedBy: userId,
    approvedAt: new Date()
  });
  const login = await request(app).post('/api/auth/login').send({ email, password });
  return {
    userId,
    cookies: login.headers['set-cookie']
  };
};

describe('Authenticated post submissions', () => {
  let category;
  let userSession;

  beforeEach(async () => {
    category = await Category.create({
      name: 'Guest Stories',
      type: 'post'
    });
    userSession = await registerAndActivateUser({
      name: 'Story Teller',
      email: 'writer@example.com',
      password: 'password123'
    });
  });

  it('stores submissions from authenticated users for review', async () => {
    const response = await request(app)
      .post('/api/posts/user-submissions')
      .set('Cookie', userSession.cookies)
      .send({
        title: 'My first user submission',
        content: '<p>This is a user submission.</p>',
        categoryId: category.id,
        coverImage: { url: 'https://example.com/cover.jpg' }
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    const createdPost = response.body.data.post;
    expect(createdPost).toBeDefined();
    expect(createdPost.status).toBe('review');
    expect(createdPost.authorId).toBeTruthy();

    const stored = await Post.findById(createdPost.id);
    expect(stored).not.toBeNull();
    expect(stored.status).toBe('review');
    expect(String(stored.authorId)).toBe(String(createdPost.authorId));
  });

  it('rejects unauthenticated submissions', async () => {
    const response = await request(app).post('/api/posts/user-submissions').send({
      title: 'No auth',
      content: '<p>Unauthenticated submission.</p>',
      categoryId: category.id,
      coverImage: { url: 'https://example.com/cover.jpg' }
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
