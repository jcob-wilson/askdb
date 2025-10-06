# Talk-to-Mongo Assistant

A Next.js application that converts natural language queries into MongoDB aggregation pipelines using OpenAI's GPT-4. This project was built for a Next.js hackathon and provides a safe, read-only interface for querying MongoDB databases.

## Features

- 🤖 **Natural Language Processing**: Ask questions in plain English
- 🔒 **Safe Queries**: All queries are read-only with built-in safety measures
- 📊 **Smart Analytics**: Automatic chart suggestions and data visualizations
- 🎯 **Schema-Aware**: Uses database schema to generate accurate queries
- 🚀 **Real-time Results**: Instant query execution and results display
- 📱 **Responsive UI**: Modern, mobile-friendly interface

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **AI**: OpenAI GPT-4 for query generation
- **Database**: MongoDB with aggregation pipelines

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or Atlas)
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd talk-to-mongo-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/your_database_name
OPENAI_API_KEY=your_openai_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Load Schema**: Click "Load Schema" to load your database schema
2. **Ask Questions**: Type natural language questions like:
   - "Show me the top 10 drivers by revenue"
   - "What are the total sales for each city?"
   - "Find drivers in Mumbai with pending payments"
3. **View Results**: See the generated MongoDB pipeline, data results, and chart suggestions

## API Endpoints

### POST /api/query
Processes natural language queries and returns MongoDB aggregation results.

**Request Body:**
```json
{
  "query": "Show me top 10 drivers by revenue",
  "schemaMetadata": {
    "database": "sample_db",
    "schema_json": { ... },
    "collection_descriptions": { ... },
    "field_descriptions": { ... },
    "domain_notes": "...",
    "timezone": "Asia/Kolkata",
    "now_iso": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/schema
Returns sample schema metadata for demo purposes.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── query/route.ts      # Main query processing endpoint
│   │   └── schema/route.ts     # Schema management endpoint
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main page component
├── components/
│   ├── DataTable.tsx           # Data display component
│   ├── PipelineViewer.tsx      # MongoDB pipeline visualization
│   ├── QueryInterface.tsx      # Query input interface
│   ├── ResultsDisplay.tsx      # Results display container
│   └── SchemaInfo.tsx          # Schema information display
├── lib/
│   ├── mongodb.ts              # MongoDB connection and utilities
│   └── openai.ts               # OpenAI integration
└── ...
```

## Safety Features

- **Read-Only Queries**: All generated queries are read-only
- **Input Validation**: Comprehensive validation of user inputs
- **Error Handling**: Graceful error handling and user feedback
- **Privacy Protection**: Aggregates sensitive data instead of raw PII
- **Query Limits**: Built-in limits to prevent resource exhaustion

## Customization

### Adding New Collections
Update the schema metadata in `/app/api/schema/route.ts` to include your collections and field descriptions.

### Modifying Query Generation
Customize the OpenAI prompt in `/lib/openai.ts` to better suit your domain.

### Styling
The app uses Tailwind CSS. Modify `tailwind.config.js` and component styles as needed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for Next.js Hackathon
- Uses OpenAI's GPT-4 for natural language processing
- MongoDB for data storage and aggregation
- Tailwind CSS for styling
