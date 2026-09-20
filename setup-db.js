#!/usr/bin/env node

/**
 * Build script that switches Prisma schema between SQLite (local) and PostgreSQL (Vercel)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Read original schema
let schema = fs.readFileSync(schemaPath, 'utf-8');

if (isProduction) {
  console.log('🔧 Production mode: Switching to PostgreSQL...');
  schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
} else {
  console.log('🔧 Development mode: Using SQLite...');
  // Schema already uses SQLite
}

fs.writeFileSync(schemaPath, schema);

// Generate Prisma client
console.log('📦 Generating Prisma client...');
execSync('npx prisma generate', { stdio: 'inherit' });

// Push schema to database
if (isProduction) {
  console.log('🗄️ Pushing schema to PostgreSQL...');
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
} else {
  console.log('🗄️ Pushing schema to SQLite...');
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
}

console.log('✅ Database setup complete!');
