import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase(dbName: string): Promise<Db> {
    const client = await clientPromise;
    return client.db(dbName);
}

export interface MongoAggregationParams {
    database: string;
    collection: string;
    pipeline: any[];
    sample_limit?: number;
    connectionString?: string;
}

export interface MongoFindParams {
    database: string;
    collection: string;
    filter: any;
    projection?: any;
    limit?: number;
    connectionString?: string;
}

export async function runMongoAggregation(params: MongoAggregationParams) {
    const { database, collection, pipeline, sample_limit = 200, connectionString } = params;

    try {
        let db;
        let client;

        if (connectionString && connectionString !== 'sample') {
            // Use provided connection string
            client = new MongoClient(connectionString);
            await client.connect();
            db = client.db(database);
        } else {
            // Use default connection
            db = await getDatabase(database);
        }

        const coll = db.collection(collection);

        // Add limit if not already present
        const hasLimit = pipeline.some(stage => stage.$limit);
        if (!hasLimit && sample_limit) {
            pipeline.push({ $limit: sample_limit });
        }

        const results = await coll.aggregate(pipeline).toArray();

        // Close client if we created it
        if (client) {
            await client.close();
        }

        return {
            success: true,
            data: results,
            count: results.length
        };
    } catch (error) {
        console.error('MongoDB aggregation error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: []
        };
    }
}

export async function runMongoFind(params: MongoFindParams) {
    const { database, collection, filter, projection, limit = 100, connectionString } = params;

    try {
        let db;
        let client;

        if (connectionString && connectionString !== 'sample') {
            // Use provided connection string
            client = new MongoClient(connectionString);
            await client.connect();
            db = client.db(database);
        } else {
            // Use default connection
            db = await getDatabase(database);
        }

        const coll = db.collection(collection);

        const results = await coll.find(filter, { projection }).limit(limit).toArray();

        // Close client if we created it
        if (client) {
            await client.close();
        }

        return {
            success: true,
            data: results,
            count: results.length
        };
    } catch (error) {
        console.error('MongoDB find error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: []
        };
    }
}
