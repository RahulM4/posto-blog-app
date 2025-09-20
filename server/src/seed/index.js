/* eslint-disable no-console */
const readline = require('readline');
const config = require('../config/env');
const { connectDb, disconnectDb } = require('../config/database');
const User = require('../models/user.model');
const Category = require('../models/category.model');
const Tag = require('../models/tag.model');
const { hashPassword } = require('../utils/password');
const { ROLES } = require('../config/rbac');

const prompt = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });

const seed = async () => {
  await connectDb();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'password123';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await hashPassword(adminPassword);
    await User.create({
      name: 'Super Admin',
      email: adminEmail,
      passwordHash,
      role: ROLES.SUPER_ADMIN
    });
    console.log(`Created SuperAdmin user: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log('SuperAdmin already exists');
  }

  const defaultCategories = [
    { name: 'Announcements', type: 'post' },
    { name: 'Guides', type: 'post' },
    { name: 'Apparel', type: 'product' },
    { name: 'Accessories', type: 'product' }
  ];

  for (const cat of defaultCategories) {
    const exists = await Category.findOne({ name: cat.name, type: cat.type });
    if (!exists) {
      await Category.create(cat);
    }
  }

  const defaultTags = [
    { name: 'Featured', type: 'product' },
    { name: 'How-To', type: 'post' }
  ];

  for (const tag of defaultTags) {
    const exists = await Tag.findOne({ name: tag.name, type: tag.type });
    if (!exists) {
      await Tag.create(tag);
    }
  }

  console.log('Seed data ready');
  await disconnectDb();
};

if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch(async (error) => {
      console.error(error);
      await disconnectDb();
      process.exit(1);
    });
}

module.exports = {
  seed
};
