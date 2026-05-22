require('dotenv').config();
const mysql = require('mysql2/promise');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const adapter = new PrismaMariaDb({
  host:            process.env.DB_HOST,
  port:            Number(process.env.DB_PORT),
  user:            process.env.DB_USER,
  password:        process.env.DB_PASSWORD,
  database:        process.env.DB_NAME,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function createDatabaseIfNotExists() {
  const connection = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT),
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await connection.execute(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
  );

  console.log(`✅ Database "${process.env.DB_NAME}" ready`);
  await connection.end();
}

async function initialize() {
  try {
    await createDatabaseIfNotExists();

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