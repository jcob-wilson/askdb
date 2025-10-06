import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
    throw new Error('Please add your OpenAI API key to .env.local');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

console.log({ OPENAI_API_KEY: process.env.OPENAI_API_KEY });

export interface AssistantResponse {
    final_answer: string;
    assumptions: string[];
    base_collection: string;
    pipeline: any[];
    columns: string[];
    chart_suggestions: Array<{
        type: string;
        title: string;
        x?: string;
        y?: string;
    }>;
}

export interface SchemaMetadata {
    database: string;
    schema_json: any;
    collection_descriptions: any;
    field_descriptions: any;
    domain_notes?: string;
    timezone: string;
    now_iso: string;
}

export async function generateMongoQuery(
    userQuery: string,
    schemaMetadata: SchemaMetadata
): Promise<AssistantResponse> {
    const systemPrompt = `
You are a data analyst for a web app. Convert user questions into SAFE, read-only MongoDB aggregation pipelines using the provided schema metadata.

DATABASE: ${schemaMetadata.database}
SCHEMA_JSON: ${JSON.stringify(schemaMetadata.schema_json, null, 2)}
COLLECTION_DESCRIPTIONS: ${JSON.stringify(schemaMetadata.collection_descriptions, null, 2)}
FIELD_DESCRIPTIONS: ${JSON.stringify(schemaMetadata.field_descriptions, null, 2)}
DOMAIN_NOTES: ${schemaMetadata.domain_notes || 'None'}
TIMEZONE: ${schemaMetadata.timezone}
NOW: ${schemaMetadata.now_iso}

GENERAL RULES:
- SAFETY: Read-only only. Never generate stages that write or modify data.
- PRIVACY: Prefer aggregates over raw PII lists.
- SCHEMA FIRST: Use SCHEMA_JSON + descriptions to pick collections/fields.
- PIPELINE QUALITY: Put $match early, use $lookup/$unwind for relations only when needed.
- NUMBERS: Include units/currency if known from field descriptions.
- LIMITS: Default result limit 100 rows; for summaries/top-N, produce exactly N with explicit $limit.

OUTPUT CONTRACT:
Always return a JSON object with:
{
  "final_answer": "One or two sentences summarizing the result with headline numbers.",
  "assumptions": ["list of assumptions or defaults used"],
  "base_collection": "string",
  "pipeline": [ ... ],
  "columns": ["ordered", "column", "names"],
  "chart_suggestions": [
    { "type": "table", "title": "Tabular results" },
    { "type": "bar", "x": "field1", "y": "field2", "title": "Chart title" }
  ]
}

User Query: ${userQuery}

Respond with ONLY the JSON object, no additional text.`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userQuery
                }
            ],
            temperature: 0.1,
            max_tokens: 2000
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new Error('No response from OpenAI');
        }

        // Parse the JSON response
        const parsedResponse = JSON.parse(response);
        return parsedResponse as AssistantResponse;
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error('Failed to generate MongoDB query');
    }
}
