#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Initializing AI Agent Dashboard Database...');

// Determine environment and check for appropriate env file
const isDevelopment = process.env.NODE_ENV !== 'production';
const envFile = isDevelopment ? '.env.local' : '.env.production';
const envPath = path.join(process.cwd(), envFile);

// Check for required environment variables
function checkEnvironmentVariables() {
  const requiredVars = ['DATABASE_URL', 'MONGODB_URI', 'JWT_SECRET'];
  const missingVars = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.log(`⚠️  Missing required environment variables: ${missingVars.join(', ')}`);
    console.log('');
    console.log('Please ensure these are set in your environment or .env file:');
    console.log('DATABASE_URL="postgresql://username:password@host:5432/database_name"');
    console.log('MONGODB_URI="mongodb://username:password@host:27017/database_name"');
    console.log('JWT_SECRET="your-secret-key-minimum-32-characters"');
    return false;
  }
  return true;
}

// Check if environment file exists (only for development)
if (isDevelopment && !fs.existsSync(envPath)) {
  console.log(`⚠️  ${envFile} file not found. Please create it with your database URLs.`);
  console.log('Example:');
  console.log('DATABASE_URL="postgresql://username:password@localhost:5432/ai_agent_dashboard"');
  console.log('MONGODB_URI="mongodb://localhost:27017/ai_agent_flowcharts"');
  console.log('JWT_SECRET="your-development-secret-key"');
  process.exit(1);
}

// Load environment variables
if (isDevelopment && fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

if (!checkEnvironmentVariables()) {
  process.exit(1);
}

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Check if we should migrate (production) or push (development)
  const args = process.argv.slice(2);
  const shouldMigrate = args.includes('--migrate') || args.includes('-m') || !isDevelopment;
  const shouldPush = args.includes('--push') || args.includes('-p') || isDevelopment;

  if (shouldMigrate && !isDevelopment) {
    console.log('🔄 Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  } else if (shouldPush && isDevelopment) {
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
  console.log('Environment:', isDevelopment ? 'Development' : 'Production');
  console.log('Database URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@') : 'Not set');
  console.log('');
  
  if (isDevelopment) {
    console.log('Next steps for development:');
    console.log('1. Make sure PostgreSQL and MongoDB are running');
    console.log('2. Run: npm run dev (to start the development server)');
  } else {
    console.log('Next steps for production:');
    console.log('1. Run: npm start (to start the production server)');
    console.log('2. Monitor logs for any issues');
  }

} catch (error) {
  console.error('❌ Database initialization failed:', error.message);
  console.error('');
  console.error('Troubleshooting:');
  console.error('1. Check your DATABASE_URL is correct and accessible');
  console.error('2. Ensure your database server is running');
  console.error('3. Verify network connectivity to the database');
  console.error('4. Check database permissions for the provided user');
  process.exit(1);
}
