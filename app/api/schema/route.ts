import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

interface SchemaData {
    database: string;
    schema_json: Record<string, any>;
    collection_descriptions: Record<string, string>;
    field_descriptions: Record<string, Record<string, string>>;
    domain_notes: string;
    timezone: string;
    now_iso: string;
}

export async function POST(request: NextRequest) {
    try {
        const { connectionString, database } = await request.json();

        if (!connectionString || !database) {
            return NextResponse.json(
                { error: 'Connection string and database name are required' },
                { status: 400 }
            );
        }

        // For sample schema, return immediately
        if (connectionString === 'sample') {
            return NextResponse.json(getSampleSchema(database));
        }

        // Connect to the provided MongoDB instance
        const client = new MongoClient(connectionString);
        await client.connect();

        const db = client.db(database);
        const collections = await db.listCollections().toArray();

        // Get sample documents to infer schema
        const schemaData: SchemaData = {
            database,
            schema_json: {},
            collection_descriptions: {},
            field_descriptions: {},
            domain_notes: "Auto-generated schema from database inspection",
            timezone: "Asia/Kolkata",
            now_iso: new Date().toISOString()
        };

        // Analyze each collection
        for (const collection of collections) {
            const coll = db.collection(collection.name);
            const sampleDocs = await coll.find({}).limit(5).toArray();

            if (sampleDocs.length > 0) {
                // Infer field types from sample documents
                const fieldTypes: { [key: string]: string } = {};
                const fieldDescriptions: { [key: string]: string } = {};

                sampleDocs.forEach(doc => {
                    Object.entries(doc).forEach(([key, value]) => {
                        if (!fieldTypes[key]) {
                            fieldTypes[key] = getFieldType(value);
                            fieldDescriptions[key] = `Field: ${key}`;
                        }
                    });
                });

                schemaData.schema_json[collection.name] = fieldTypes;
                schemaData.collection_descriptions[collection.name] = `Collection: ${collection.name}`;
                schemaData.field_descriptions[collection.name] = fieldDescriptions;
            }
        }

        await client.close();
        return NextResponse.json(schemaData);

    } catch (error) {
        console.error('Schema API error:', error);
        return NextResponse.json(
            { error: `Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}

function getFieldType(value: any): string {
    if (value === null || value === undefined) return 'any';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'Date';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') {
        // Check if it looks like an ObjectId
        if (/^[0-9a-fA-F]{24}$/.test(value)) return 'ObjectId';
        return 'string';
    }
    if (typeof value === 'object') return 'object';
    return 'any';
}

function getSampleSchema(database: string) {
    return {
        database,
        schema_json: {
            drivers: {
                _id: "ObjectId",
                name: "string",
                city_id: "ObjectId",
                email: "string",
                phone: "string",
                created_at: "Date"
            },
            cities: {
                _id: "ObjectId",
                name: "string",
                state: "string",
                country: "string"
            },
            invoices: {
                _id: "ObjectId",
                driver_id: "ObjectId",
                amount: "number",
                status: "string",
                created_at: "Date"
            }
        },
        collection_descriptions: {
            drivers: "Driver information including contact details and city location",
            cities: "City information with location details",
            invoices: "Financial transactions and payments for drivers"
        },
        field_descriptions: {
            drivers: {
                name: "Full name of the driver",
                city_id: "Reference to cities collection",
                email: "Driver's email address",
                phone: "Driver's phone number"
            },
            cities: {
                name: "City name",
                state: "State or province",
                country: "Country name"
            },
            invoices: {
                amount: "Payment amount in local currency",
                status: "Payment status (paid, pending, cancelled)",
                driver_id: "Reference to drivers collection"
            }
        },
        domain_notes: "Revenue = invoices.amount, drivers join cities via city_id",
        timezone: "Asia/Kolkata",
        now_iso: new Date().toISOString()
    };
}

export async function GET() {
    // Return sample schema for demo purposes
    const sampleSchema = {
        database: "sample_db",
        schema_json: {
            drivers: {
                _id: "ObjectId",
                name: "string",
                city_id: "ObjectId",
                email: "string",
                phone: "string",
                created_at: "Date"
            },
            cities: {
                _id: "ObjectId",
                name: "string",
                state: "string",
                country: "string"
            },
            invoices: {
                _id: "ObjectId",
                driver_id: "ObjectId",
                amount: "number",
                status: "string",
                created_at: "Date"
            }
        },
        collection_descriptions: {
            drivers: "Driver information including contact details and city location",
            cities: "City information with location details",
            invoices: "Financial transactions and payments for drivers"
        },
        field_descriptions: {
            drivers: {
                name: "Full name of the driver",
                city_id: "Reference to cities collection",
                email: "Driver's email address",
                phone: "Driver's phone number"
            },
            cities: {
                name: "City name",
                state: "State or province",
                country: "Country name"
            },
            invoices: {
                amount: "Payment amount in local currency",
                status: "Payment status (paid, pending, cancelled)",
                driver_id: "Reference to drivers collection"
            }
        },
        domain_notes: "Revenue = invoices.amount, drivers join cities via city_id",
        timezone: "Asia/Kolkata",
        now_iso: new Date().toISOString()
    };

    return NextResponse.json(sampleSchema);
}
