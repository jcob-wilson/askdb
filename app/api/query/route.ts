import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { generateMongoQuery } from '@/lib/openai';
import clientPromise, { runMongoAggregation, runMongoFind } from '@/lib/mongodb';
import { getPlanForUser, getTodayKey } from '@/lib/plans';
import { rateLimit } from '@/lib/rateLimiter';
import { getTenantIdFromRequest } from '@/lib/tenant';

interface ChartSuggestion {
    type: string;
    title: string;
    x?: string;
    y?: string;
}

function generateFallbackChartSuggestions(data: any[]): ChartSuggestion[] {
    if (!data || data.length === 0) {
        return [{ type: 'table', title: 'No data available' }];
    }

    const suggestions: ChartSuggestion[] = [{ type: 'table', title: 'Tabular Results' }];
    const sampleDoc = data[0];
    const keys = Object.keys(sampleDoc);

    // Look for numeric fields for charts
    const numericFields = keys.filter(key => {
        const value = sampleDoc[key];
        return typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)));
    });

    const stringFields = keys.filter(key => {
        const value = sampleDoc[key];
        return typeof value === 'string' && isNaN(Number(value));
    });

    // Generate chart suggestions based on available fields
    if (numericFields.length > 0 && stringFields.length > 0) {
        suggestions.push({
            type: 'bar',
            title: `${stringFields[0]} vs ${numericFields[0]}`,
            x: stringFields[0],
            y: numericFields[0]
        });
    }

    if (numericFields.length >= 2) {
        suggestions.push({
            type: 'line',
            title: `${numericFields[0]} over ${numericFields[1]}`,
            x: numericFields[1],
            y: numericFields[0]
        });
    }

    if (stringFields.length > 0) {
        suggestions.push({
            type: 'pie',
            title: `Distribution by ${stringFields[0]}`,
            x: stringFields[0],
            y: 'count'
        });
    }

    return suggestions;
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { query, schemaMetadata, connectionString } = await request.json();

        // Apply per-IP/user rate limit
        const tenantId = getTenantIdFromRequest(request);
        const rlKey = `query:${tenantId}:${session.user?.email || 'anon'}`;
        const rl = await rateLimit(rlKey, { windowSeconds: 60, max: 30 });
        if (!rl.allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

        const client = await clientPromise;
        const db = client.db();
        const users = db.collection('users');
        const user = await users.findOne({ email: session.user?.email?.toLowerCase() });
        const plan = getPlanForUser(user);

        // const isSample = connectionString === 'sample';
        // if (!isSample && !plan.allowExternalConnections) {
        //     return NextResponse.json({ error: 'Your plan does not allow external connections' }, { status: 403 });
        // }

        // Enforce per-day query limits
        const usageColl = db.collection('user_usage');
        const todayKey = getTodayKey();
        const usageDocId = `${tenantId}:${session.user?.email?.toLowerCase()}:${todayKey}`;
        const usageDoc = await usageColl.findOne({ _id: usageDocId });
        const used = usageDoc?.count || 0;
        if (used >= plan.queryLimitPerDay) {
            return NextResponse.json({ error: 'Daily query limit reached' }, { status: 429 });
        }

        if (!query || !schemaMetadata) {
            return NextResponse.json(
                { error: 'Query and schema metadata are required' },
                { status: 400 }
            );
        }

        // Generate MongoDB query using OpenAI
        const assistantResponse = await generateMongoQuery(query, schemaMetadata);

        // Execute the MongoDB query
        let queryResult;
        if (assistantResponse.pipeline && assistantResponse.pipeline.length > 0) {
            queryResult = await runMongoAggregation({
                database: schemaMetadata.database,
                collection: assistantResponse.base_collection,
                pipeline: assistantResponse.pipeline,
                sample_limit: 200,
                connectionString: connectionString
            });
        } else {
            // Fallback to simple find if no pipeline
            queryResult = await runMongoFind({
                database: schemaMetadata.database,
                collection: assistantResponse.base_collection,
                filter: {},
                limit: 100,
                connectionString: connectionString
            });
        }

        // Add fallback chart suggestions if none provided
        const chartSuggestions = assistantResponse.chart_suggestions && assistantResponse.chart_suggestions.length > 0
            ? assistantResponse.chart_suggestions
            : generateFallbackChartSuggestions(queryResult.data);

        // Record query history server-side
        try {
            const resultCount = Array.isArray(queryResult?.data) ? queryResult.data.length : 0;
            await db.collection('user_queries').insertOne({
                tenantId,
                userEmail: session.user?.email?.toLowerCase(),
                query,
                timestamp: new Date(),
                connectionType: isSample ? 'sample' : 'external',
                resultCount,
                plan: plan.id,
            });
        } catch { }

        // Increment usage count after successful query execution attempt
        await db.collection('user_usage').updateOne(
            { _id: usageDocId },
            { $set: { date: todayKey }, $inc: { count: 1 } },
            { upsert: true }
        );

        return NextResponse.json({
            ...assistantResponse,
            chart_suggestions: chartSuggestions,
            query_result: queryResult
        });

    } catch (error) {
        console.error('Query API error:', error);
        return NextResponse.json(
            { error: 'Failed to process query' },
            { status: 500 }
        );
    }
}
