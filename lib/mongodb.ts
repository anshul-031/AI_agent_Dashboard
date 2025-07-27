import { MongoClient, Db, Collection, Document } from 'mongodb';
import { Flowchart } from '@/types/agent';

class MongoDBConnection {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(): Promise<void> {
    if (this.client) {
      return;
    }

    try {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('MongoDB URI is not defined in environment variables');
      }

      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  getCollection<T extends Document = Document>(name: string): Collection<T> {
    const db = this.getDb();
    return db.collection<T>(name);
  }
}

// Create a singleton instance
const mongodb = new MongoDBConnection();

export default mongodb;

// Helper functions for flowchart operations
export class FlowchartService {
  private collection: Collection<Flowchart> | null = null;

  private async getCollection(): Promise<Collection<Flowchart>> {
    if (!this.collection) {
      await mongodb.connect();
      this.collection = mongodb.getCollection<Flowchart>('flowcharts');
    }
    return this.collection;
  }

  async createFlowchart(flowchart: Omit<Flowchart, 'id' | 'chronology'>): Promise<Flowchart> {
    const collection = await this.getCollection();
    const now = new Date().toISOString();
    const newFlowchart: Flowchart = {
      ...flowchart,
      id: new Date().getTime().toString(), // Simple ID generation
      chronology: {
        createdAt: now,
        lastModified: now,
        version: flowchart.version || '1.0.0',
        changeLog: [{
          timestamp: now,
          action: 'created',
          details: 'Flowchart created'
        }]
      }
    };

    await collection.insertOne(newFlowchart);
    return newFlowchart;
  }

  async getFlowchartByAgentId(agentId: string): Promise<Flowchart | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ agentId });
  }

  async updateFlowchart(id: string, updates: Partial<Flowchart>, userId?: string, action?: string): Promise<boolean> {
    const collection = await this.getCollection();
    const now = new Date().toISOString();
    
    // Get current flowchart to preserve change log
    const current = await collection.findOne({ id });
    if (!current) return false;

    const changeLogEntry = {
      timestamp: now,
      userId,
      action: action || 'updated',
      details: Object.keys(updates).join(', ') + ' modified'
    };

    const result = await collection.updateOne(
      { id },
      { 
        $set: { 
          ...updates,
          chronology: {
            ...current.chronology,
            lastModified: now,
            changeLog: [
              ...(current.chronology?.changeLog || []),
              changeLogEntry
            ].slice(-50) // Keep last 50 changes
          }
        } 
      }
    );
    return result.modifiedCount > 0;
  }

  async deleteFlowchart(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async getAllFlowcharts(): Promise<Flowchart[]> {
    const collection = await this.getCollection();
    return await collection.find({}).toArray();
  }

  async getFlowchartsByAgentIds(agentIds: string[]): Promise<Flowchart[]> {
    const collection = await this.getCollection();
    return await collection.find({ agentId: { $in: agentIds } }).toArray();
  }

  // Utility methods for flowchart validation and operations
  async validateFlowchart(flowchart: Partial<Flowchart>): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check for required nodes
    if (!flowchart.nodes || flowchart.nodes.length === 0) {
      errors.push('Flowchart must have at least one node');
    } else {
      const startNodes = flowchart.nodes.filter(n => n.type === 'start');
      const endNodes = flowchart.nodes.filter(n => n.type === 'end');
      
      if (startNodes.length === 0) {
        errors.push('Flowchart must have at least one start node');
      }
      if (endNodes.length === 0) {
        errors.push('Flowchart must have at least one end node');
      }

      // Validate node positions
      flowchart.nodes.forEach((node, index) => {
        if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
          errors.push(`Node ${index + 1} has invalid position coordinates`);
        }
        if (!node.title || node.title.trim() === '') {
          errors.push(`Node ${index + 1} must have a title`);
        }
      });
    }

    // Validate connections
    if (flowchart.connections && flowchart.connections.length > 0) {
      const nodeIds = new Set(flowchart.nodes?.map(n => n.id) || []);
      
      flowchart.connections.forEach((conn, index) => {
        if (!nodeIds.has(conn.from)) {
          errors.push(`Connection ${index + 1} references non-existent 'from' node: ${conn.from}`);
        }
        if (!nodeIds.has(conn.to)) {
          errors.push(`Connection ${index + 1} references non-existent 'to' node: ${conn.to}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async exportFlowchart(id: string): Promise<{
    flowchart: Flowchart;
    exportData: {
      version: string;
      exportedAt: string;
      format: string;
    }
  } | null> {
    const collection = await this.getCollection();
    const flowchart = await collection.findOne({ id });
    
    if (!flowchart) return null;

    return {
      flowchart,
      exportData: {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        format: 'json'
      }
    };
  }

  async duplicateFlowchart(id: string, newAgentId: string, userId?: string): Promise<Flowchart | null> {
    const collection = await this.getCollection();
    const original = await collection.findOne({ id });
    
    if (!original) return null;

    const now = new Date().toISOString();
    const duplicated: Flowchart = {
      ...original,
      id: new Date().getTime().toString(),
      agentId: newAgentId,
      metadata: {
        ...original.metadata,
        title: `${original.metadata.title} (Copy)`
      },
      chronology: {
        createdAt: now,
        lastModified: now,
        version: '1.0.0',
        changeLog: [{
          timestamp: now,
          userId,
          action: 'duplicated',
          details: `Duplicated from flowchart ${id}`
        }]
      }
    };

    await collection.insertOne(duplicated);
    return duplicated;
  }
}

export { mongodb };
