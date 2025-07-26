#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Initializing AI Agent Dashboard Database...');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env.local file not found. Please create it with your database URLs.');
  console.log('Example:');
  console.log('DATABASE_URL="postgresql://username:password@localhost:5432/ai_agent_dashboard"');
  console.log('MONGODB_URI="mongodb://localhost:27017/ai_agent_flowcharts"');
  process.exit(1);
}

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Check if we should push the database schema
  const args = process.argv.slice(2);
  if (args.includes('--push') || args.includes('-p')) {
    console.log('🔄 Pushing database schema...');
    execSync('npx prisma db push', { stdio: 'inherit' });
  }

  // Seed database if flag is provided
  if (args.includes('--seed') || args.includes('-s')) {
    console.log('🌱 Seeding database...');
    execSync('node scripts/seed.js', { stdio: 'inherit' });
  }

  console.log('✅ Database initialization completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Make sure PostgreSQL and MongoDB are running');
  console.log('2. Update your .env.local with correct database URLs');
  console.log('3. Run: npm run db:push (to create database tables)');
  console.log('4. Run: npm run db:seed (to add sample data)');
  console.log('5. Run: npm run dev (to start the development server)');

} catch (error) {
  console.error('❌ Database initialization failed:', error.message);
  process.exit(1);
}
