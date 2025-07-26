import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { validateAgentData } from '@/lib/utils';

type AgentStatus = 'ACTIVE' | 'INACTIVE' | 'RUNNING' | 'PAUSED';

export async function GET(request: NextRequest) {
  try {
    await db.initialize();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as AgentStatus | null;
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const filters: any = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (search) filters.search = search;

    const agents = await db.getAgents(filters);
    
    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await db.initialize();
    
    const body = await request.json();
    
    const validation = validateAgentData(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const agent = await db.createAgent({
      name: body.name,
      description: body.description,
      status: body.status as AgentStatus,
      category: body.category,
      configuration: body.configuration,
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
