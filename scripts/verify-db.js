#!/usr/bin/env node

/**
 * Database Connection Verification Script
 * Use this to test your database connections before deployment
 */

const { PrismaClient } = require('@prisma/client');
const { MongoClient } = require('mongodb');

async function verifyPostgreSQL() {
  console.log('🔍 Testing PostgreSQL connection...');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not set');
    return false;
  }

  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ PostgreSQL connection successful');
    
    // Test a simple query
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ PostgreSQL query test successful');
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL connection failed:', error.message);
    return false;
  }
}

async function verifyMongoDB() {
  console.log('🔍 Testing MongoDB connection...');
  
  if (!process.env.MONGODB_URI) {
    console.log('❌ MONGODB_URI not set');
    return false;
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB connection successful');
    
    // Test a simple operation
    const db = client.db();
    await db.admin().ping();
    console.log('✅ MongoDB ping test successful');
    
    await client.close();
    return true;
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

async function verifyEnvironment() {
  console.log('🔍 Checking environment variables...');
  
  const requiredVars = [
    'DATABASE_URL',
    'MONGODB_URI',
    'JWT_SECRET',
    'NEXTAUTH_SECRET'
  ];
  
  let allSet = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set`);
    } else {
      console.log(`❌ ${varName} is missing`);
      allSet = false;
    }
  });
  
  return allSet;
}

async function main() {
  console.log('🚀 AI Agent Dashboard - Database Connection Verification\n');
  
  // Load environment variables if in development
  if (process.env.NODE_ENV !== 'production') {
    try {
      require('dotenv').config({ path: '.env.local' });
    } catch (e) {
      // dotenv not available or .env.local not found
    }
  }
  
  const results = {
    environment: await verifyEnvironment(),
    postgresql: await verifyPostgreSQL(),
    mongodb: await verifyMongoDB()
  };
  
  console.log('\n📊 Verification Results:');
  console.log('------------------------');
  console.log(`Environment Variables: ${results.environment ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`PostgreSQL Connection: ${results.postgresql ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`MongoDB Connection: ${results.mongodb ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All checks passed! Your database setup is ready for deployment.');
  } else {
    console.log('\n⚠️  Some checks failed. Please review the issues above before deploying.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Verification script failed:', error);
  process.exit(1);
});
