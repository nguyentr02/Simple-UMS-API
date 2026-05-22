require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seed() {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const seedPath = path.join(__dirname, '../prisma/seed.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');

  await pool.query(sql);
  await pool.end();
  console.log('🌱 Seed complete');
}

async function initialize() {
  try {
    const count = await prisma.students.count();
    if (count === 0) {
      console.log('🌱 Seeding initial data...');
      await seed();
    }
    console.log('✅ Database ready');
  } catch (err) {
    console.error('❌ Database setup failed:', err);
    process.exit(1);
  }
}

module.exports = { prisma, initialize };