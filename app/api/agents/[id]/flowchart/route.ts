import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.initialize();
    
    const flowchart = await db.getFlowchartByAgentId(params.id);
    
    if (!flowchart) {
      return NextResponse.json(
        { error: 'Flowchart not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ flowchart });
  } catch (error) {
    console.error('Error fetching flowchart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flowchart' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.initialize();
    
    const body = await request.json();
    
    // Check if agent exists
    const agent = await db.getAgentById(params.id);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const flowchart = await db.createFlowchart({
      agentId: params.id,
      version: body.version || '1.0.0',
      nodes: body.nodes || [],
      connections: body.connections || [],
      metadata: body.metadata || {
        title: `${agent.name} Flowchart`,
        description: 'Agent execution flowchart',
        layout: 'default'
      }
    });

    return NextResponse.json({ flowchart }, { status: 201 });
  } catch (error) {
    console.error('Error creating flowchart:', error);
    return NextResponse.json(
      { error: 'Failed to create flowchart' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.initialize();
    
    const body = await request.json();
    
    const flowchart = await db.getFlowchartByAgentId(params.id);
    if (!flowchart) {
      return NextResponse.json(
        { error: 'Flowchart not found' },
        { status: 404 }
      );
    }

    const updated = await db.updateFlowchart(flowchart.id, body);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update flowchart' },
        { status: 500 }
      );
    }

    const updatedFlowchart = await db.getFlowchartByAgentId(params.id);
    return NextResponse.json({ flowchart: updatedFlowchart });
  } catch (error) {
    console.error('Error updating flowchart:', error);
    return NextResponse.json(
      { error: 'Failed to update flowchart' },
      { status: 500 }
    );
  }
}
