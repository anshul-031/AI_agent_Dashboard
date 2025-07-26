import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

type ExecutionStatus = 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING';

export async function GET(request: NextRequest) {
  try {
    await db.initialize();
    
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const executions = await db.getExecutions(agentId || undefined, limit);
    
    return NextResponse.json({ executions });
  } catch (error) {
    console.error('Error fetching executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await db.initialize();
    
    const body = await request.json();
    
    if (!body.agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Verify agent exists
    const agent = await db.getAgentById(body.agentId);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const execution = await db.createExecution({
      agentId: body.agentId,
      status: body.status as ExecutionStatus || 'PENDING',
      result: body.result,
      error: body.error,
      logs: body.logs,
    });

    return NextResponse.json({ execution }, { status: 201 });
  } catch (error) {
    console.error('Error creating execution:', error);
    return NextResponse.json(
      { error: 'Failed to create execution' },
      { status: 500 }
    );
  }
}
