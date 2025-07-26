#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedPostgreSQL() {
  console.log('🌱 Seeding PostgreSQL...');

  // Create users first
  const hashedPassword = await bcrypt.hash('password', 12);
  
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@company.com' },
      update: {},
      create: {
        email: 'admin@company.com',
        name: 'Admin User',
        role: 'ADMIN',
        passwordHash: hashedPassword,
      }
    }),
    prisma.user.upsert({
      where: { email: 'operator@company.com' },
      update: {},
      create: {
        email: 'operator@company.com',
        name: 'Operator User',
        role: 'OPERATOR',
        passwordHash: hashedPassword,
      }
    }),
    prisma.user.upsert({
      where: { email: 'viewer@company.com' },
      update: {},
      create: {
        email: 'viewer@company.com',
        name: 'Viewer User',
        role: 'VIEWER',
        passwordHash: hashedPassword,
      }
    })
  ]);

  // Create sample agents
  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        name: 'Data Processing Agent',
        description: 'Processes and analyzes incoming data streams',
        status: 'ACTIVE',
        category: 'Data Processing',
        enabled: true,
        createdById: users[0].id,
        configuration: {
          inputSource: 'api',
          outputFormat: 'json',
          processingRules: ['validate', 'transform', 'store']
        }
      }
    }),
    prisma.agent.create({
      data: {
        name: 'Email Automation Agent',
        description: 'Automates email responses and routing',
        status: 'ACTIVE',
        category: 'Communication',
        enabled: true,
        createdById: users[1].id,
        configuration: {
          emailTemplates: ['welcome', 'support', 'notification'],
          triggerRules: ['new_user', 'support_ticket', 'system_alert']
        }
      }
    }),
    prisma.agent.create({
      data: {
        name: 'Report Generation Agent',
        description: 'Generates periodic business reports',
        status: 'INACTIVE',
        category: 'Analytics',
        enabled: false,
        createdById: users[0].id,
        configuration: {
          schedule: 'daily',
          reportTypes: ['sales', 'performance', 'errors'],
          recipients: ['admin@company.com']
        }
      }
    })
  ]);

  // Create sample executions
  const executions = await Promise.all([
    prisma.execution.create({
      data: {
        agentId: agents[0].id,
        status: 'SUCCESS',
        startTime: new Date(Date.now() - 3600000), // 1 hour ago
        endTime: new Date(Date.now() - 3540000), // 59 minutes ago
        result: 'Processed 1,250 records successfully',
        triggeredById: users[1].id,
        logs: [
          { timestamp: new Date().toISOString(), level: 'info', message: 'Starting data processing' },
          { timestamp: new Date().toISOString(), level: 'info', message: 'Processing completed' }
        ]
      }
    }),
    prisma.execution.create({
      data: {
        agentId: agents[1].id,
        status: 'SUCCESS',
        startTime: new Date(Date.now() - 1800000), // 30 minutes ago
        endTime: new Date(Date.now() - 1740000), // 29 minutes ago
        result: 'Sent 45 automated emails',
        triggeredById: users[0].id,
        logs: [
          { timestamp: new Date().toISOString(), level: 'info', message: 'Email automation started' },
          { timestamp: new Date().toISOString(), level: 'info', message: 'All emails sent successfully' }
        ]
      }
    }),
    prisma.execution.create({
      data: {
        agentId: agents[0].id,
        status: 'FAILED',
        startTime: new Date(Date.now() - 900000), // 15 minutes ago
        endTime: new Date(Date.now() - 840000), // 14 minutes ago
        error: 'Database connection timeout',
        triggeredById: users[1].id,
        logs: [
          { timestamp: new Date().toISOString(), level: 'info', message: 'Starting data processing' },
          { timestamp: new Date().toISOString(), level: 'error', message: 'Database connection failed' }
        ]
      }
    })
  ]);

  console.log(`✅ Created ${users.length} users, ${agents.length} agents and ${executions.length} executions`);
  return agents;
}

async function seedMongoDB(agents) {
  console.log('🌱 Seeding MongoDB...');

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('⚠️  MongoDB URI not found, skipping MongoDB seeding');
    return;
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db();
  const flowchartsCollection = db.collection('flowcharts');

  // Create sample flowcharts
  const flowcharts = [
    {
      id: Date.now().toString(),
      agentId: agents[0].id,
      version: '1.0.0',
      nodes: [
        {
          id: 'start',
          type: 'start',
          title: 'Start',
          position: { x: 100, y: 50 }
        },
        {
          id: 'validate',
          type: 'process',
          title: 'Validate Data',
          description: 'Check data format and integrity',
          position: { x: 100, y: 150 }
        },
        {
          id: 'process',
          type: 'process',
          title: 'Process Data',
          description: 'Transform and analyze data',
          position: { x: 100, y: 250 }
        },
        {
          id: 'store',
          type: 'process',
          title: 'Store Results',
          description: 'Save processed data to database',
          position: { x: 100, y: 350 }
        },
        {
          id: 'end',
          type: 'end',
          title: 'End',
          position: { x: 100, y: 450 }
        }
      ],
      connections: [
        { id: 'c1', from: 'start', to: 'validate' },
        { id: 'c2', from: 'validate', to: 'process' },
        { id: 'c3', from: 'process', to: 'store' },
        { id: 'c4', from: 'store', to: 'end' }
      ],
      metadata: {
        title: 'Data Processing Flow',
        description: 'Standard data processing workflow',
        layout: 'vertical'
      },
      lastModified: new Date().toISOString()
    },
    {
      id: (Date.now() + 1).toString(),
      agentId: agents[1].id,
      version: '1.0.0',
      nodes: [
        {
          id: 'start',
          type: 'start',
          title: 'Start',
          position: { x: 100, y: 50 }
        },
        {
          id: 'check_trigger',
          type: 'decision',
          title: 'Check Trigger',
          description: 'Determine email type needed',
          position: { x: 100, y: 150 }
        },
        {
          id: 'send_welcome',
          type: 'process',
          title: 'Send Welcome Email',
          position: { x: 50, y: 250 }
        },
        {
          id: 'send_support',
          type: 'process',
          title: 'Send Support Email',
          position: { x: 150, y: 250 }
        },
        {
          id: 'end',
          type: 'end',
          title: 'End',
          position: { x: 100, y: 350 }
        }
      ],
      connections: [
        { id: 'c1', from: 'start', to: 'check_trigger' },
        { id: 'c2', from: 'check_trigger', to: 'send_welcome', label: 'New User' },
        { id: 'c3', from: 'check_trigger', to: 'send_support', label: 'Support Ticket' },
        { id: 'c4', from: 'send_welcome', to: 'end' },
        { id: 'c5', from: 'send_support', to: 'end' }
      ],
      metadata: {
        title: 'Email Automation Flow',
        description: 'Automated email response workflow',
        layout: 'branched'
      },
      lastModified: new Date().toISOString()
    }
  ];

  await flowchartsCollection.insertMany(flowcharts);
  console.log(`✅ Created ${flowcharts.length} flowcharts in MongoDB`);

  await client.close();
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...');

    const agents = await seedPostgreSQL();
    await seedMongoDB(agents);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
