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
        status: 'Running',
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
        status: 'Idle',
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
        status: 'Error',
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
    // Recent successful execution for agent 0
    prisma.execution.create({
      data: {
        agentId: agents[0].id,
        status: 'SUCCESS',
        startTime: new Date('2024-01-20T14:30:00Z'),
        endTime: new Date('2024-01-20T14:32:15Z'),
        result: 'Processed 45 customer inquiries, escalated 3 to human agents',
        triggeredById: users[1].id,
        logs: [
          { timestamp: '2024-01-20T14:30:05Z', level: 'info', message: 'Started processing customer inquiries queue' },
          { timestamp: '2024-01-20T14:31:20Z', level: 'info', message: 'Processed inquiry #12345 - routing issue resolved' },
          { timestamp: '2024-01-20T14:32:10Z', level: 'warn', message: 'Escalating complex technical inquiry #12367 to human agent' }
        ]
      }
    }),
    // Earlier successful execution for agent 0
    prisma.execution.create({
      data: {
        agentId: agents[0].id,
        status: 'SUCCESS',
        startTime: new Date('2024-01-20T13:30:00Z'),
        endTime: new Date('2024-01-20T13:31:45Z'),
        result: 'Processed 32 customer inquiries, escalated 1 to human agents',
        triggeredById: users[1].id,
        logs: [
          { timestamp: '2024-01-20T13:30:05Z', level: 'info', message: 'Started processing customer inquiries queue' },
          { timestamp: '2024-01-20T13:31:40Z', level: 'info', message: 'Successfully resolved all standard inquiries' }
        ]
      }
    }),
    // Failed execution for agent 0
    prisma.execution.create({
      data: {
        agentId: agents[0].id,
        status: 'FAILED',
        startTime: new Date('2024-01-20T12:30:00Z'),
        endTime: new Date('2024-01-20T12:31:20Z'),
        error: 'Connection timeout to customer database',
        triggeredById: users[1].id,
        logs: [
          { timestamp: '2024-01-20T12:30:05Z', level: 'info', message: 'Started processing customer inquiries queue' },
          { timestamp: '2024-01-20T12:31:15Z', level: 'error', message: 'Failed to connect to customer database after 3 retries' }
        ]
      }
    }),
    // Running execution for agent 1
    prisma.execution.create({
      data: {
        agentId: agents[1].id,
        status: 'RUNNING',
        startTime: new Date('2024-01-20T16:00:00Z'),
        triggeredById: users[0].id,
        logs: [
          { timestamp: '2024-01-20T16:00:05Z', level: 'info', message: 'Starting data analysis pipeline for dataset batch #2024-01-20-001' },
          { timestamp: '2024-01-20T16:05:30Z', level: 'info', message: 'Preprocessing completed - 15,000 records processed' },
          { timestamp: '2024-01-20T16:10:45Z', level: 'info', message: 'Analysis phase 1/3 completed - feature extraction done' }
        ]
      }
    }),
    // Successful execution for agent 1
    prisma.execution.create({
      data: {
        agentId: agents[1].id,
        status: 'SUCCESS',
        startTime: new Date('2024-01-20T14:00:00Z'),
        endTime: new Date('2024-01-20T15:45:30Z'),
        result: 'Generated insights report for Q4 sales data - identified 3 key trends',
        triggeredById: users[0].id,
        logs: [
          { timestamp: '2024-01-20T14:00:05Z', level: 'info', message: 'Starting analysis of Q4 sales data' },
          { timestamp: '2024-01-20T15:30:00Z', level: 'info', message: 'Pattern analysis completed - generating report' },
          { timestamp: '2024-01-20T15:45:25Z', level: 'info', message: 'Report generated successfully and saved to output directory' }
        ]
      }
    }),
    // Failed execution for agent 1
    prisma.execution.create({
      data: {
        agentId: agents[1].id,
        status: 'FAILED',
        startTime: new Date('2024-01-19T10:00:00Z'),
        endTime: new Date('2024-01-19T10:15:45Z'),
        error: 'Insufficient memory to process large dataset',
        triggeredById: users[0].id,
        logs: [
          { timestamp: '2024-01-19T10:00:05Z', level: 'info', message: 'Starting analysis of customer behavior dataset' },
          { timestamp: '2024-01-19T10:12:30Z', level: 'warn', message: 'Memory usage approaching 95% threshold' },
          { timestamp: '2024-01-19T10:15:40Z', level: 'error', message: 'OutOfMemoryError: Unable to process dataset of size 2.3GB' }
        ]
      }
    }),
    // Execution for agent 2 (Content Moderator)
    prisma.execution.create({
      data: {
        agentId: agents[2].id,
        status: 'SUCCESS',
        startTime: new Date('2024-01-20T12:00:00Z'),
        endTime: new Date('2024-01-20T12:05:20Z'),
        result: 'Moderated 127 content items, flagged 8 for review',
        triggeredById: users[2].id,
        logs: [
          { timestamp: '2024-01-20T12:00:05Z', level: 'info', message: 'Starting content moderation batch process' },
          { timestamp: '2024-01-20T12:03:15Z', level: 'warn', message: 'Flagged potentially inappropriate content item #CN-789123' },
          { timestamp: '2024-01-20T12:05:15Z', level: 'info', message: 'Batch moderation completed successfully' }
        ]
      }
    }),
    // Running execution for agent 2
    prisma.execution.create({
      data: {
        agentId: agents[2].id,
        status: 'RUNNING',
        startTime: new Date('2024-01-20T18:00:00Z'),
        triggeredById: users[2].id,
        logs: [
          { timestamp: '2024-01-20T18:00:05Z', level: 'info', message: 'Starting evening content moderation batch' },
          { timestamp: '2024-01-20T18:05:30Z', level: 'info', message: 'Processing user-generated content from last 4 hours' },
          { timestamp: '2024-01-20T18:10:45Z', level: 'info', message: 'Phase 1/3 completed - text content analysis done' }
        ]
      }
    }),
    // Pending execution for agent 3 (if exists)
    ...(agents.length > 3 ? [
      prisma.execution.create({
        data: {
          agentId: agents[3].id,
          status: 'RUNNING',
          startTime: new Date('2024-01-20T17:00:00Z'),
          triggeredById: users[1].id,
          logs: [
            { timestamp: '2024-01-20T17:00:00Z', level: 'info', message: 'Lead qualification job queued for execution' }
          ]
        }
      })
    ] : [])
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
