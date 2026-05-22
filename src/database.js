require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function initialize() {
  try {
    console.log('⏳ Running migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    const count = await prisma.students.count();
    if (count === 0) {
      console.log('🌱 Seeding initial data...');
      execSync('node prisma/seed.js', { stdio: 'inherit' });
    }

    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ Database setup failed:', err);
    process.exit(1);
  }
}

module.exports = { prisma, initialize };