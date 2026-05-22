require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function initialize() {
  try {
    // Migrations already ran at build time on Vercel
    // Just seed if empty
    const count = await prisma.students.count();
    if (count === 0) {
      console.log('🌱 Seeding initial data...');
      const { execSync } = require('child_process');
      execSync('node prisma/seed.js', { stdio: 'inherit' });
    }
    console.log('✅ Database ready');
  } catch (err) {
    console.error('❌ Database setup failed:', err);
    process.exit(1);
  }
}

module.exports = { prisma, initialize };