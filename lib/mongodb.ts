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

  async createFlowchart(flowchart: Omit<Flowchart, 'id' | 'lastModified'>): Promise<Flowchart> {
    const collection = await this.getCollection();
    const newFlowchart: Flowchart = {
      ...flowchart,
      id: new Date().getTime().toString(), // Simple ID generation
      lastModified: new Date().toISOString(),
    };

    await collection.insertOne(newFlowchart);
    return newFlowchart;
  }

  async getFlowchartByAgentId(agentId: string): Promise<Flowchart | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ agentId });
  }

  async updateFlowchart(id: string, updates: Partial<Flowchart>): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { id },
      { 
        $set: { 
          ...updates, 
          lastModified: new Date().toISOString() 
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
}

export { mongodb };
