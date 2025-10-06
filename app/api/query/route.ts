import { NextRequest, NextResponse } from 'next/server';
import { generateMongoQuery } from '@/lib/openai';
import { runMongoAggregation, runMongoFind } from '@/lib/mongodb';

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
        const { query, schemaMetadata, connectionString } = await request.json();

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
