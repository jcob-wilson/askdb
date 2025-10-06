'use client';

import { useState } from 'react';
import { Search, Send, Loader2 } from 'lucide-react';

interface QueryInterfaceProps {
  onQuery: (query: string) => void;
  loading: boolean;
}

export function QueryInterface({ onQuery, loading }: QueryInterfaceProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onQuery(query.trim());
    }
  };

  const exampleQueries = [
    "Show me the top 10 drivers by revenue",
    "What are the total sales for each city?",
    "Find drivers in Mumbai with pending payments",
    "Which month had the highest revenue?",
    "Show me the average invoice amount by driver"
  ];

  return (
    <div className="card p-8 animate-slide-up">
      <div className="flex items-center mb-6">
        <div className="relative mr-4">
          <div className="absolute inset-0 bg-primary-100 rounded-xl blur-lg opacity-50"></div>
          <Search className="relative h-8 w-8 text-primary-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Ask Your Question</h2>
          <p className="text-gray-600 mt-1">Transform your thoughts into powerful MongoDB queries</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Show me the top 10 drivers by revenue"
            className="input text-lg py-4 pr-16"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        {loading && (
          <div className="mt-4 flex items-center text-primary-600 animate-pulse-soft">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span className="text-sm">Generating MongoDB query...</span>
          </div>
        )}
      </form>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Example Queries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => setQuery(example)}
              className="text-left p-4 bg-gray-50 hover:bg-primary-50 hover:border-primary-200 border border-transparent rounded-xl text-sm text-gray-700 hover:text-primary-700 transition-all duration-200 group"
              disabled={loading}
            >
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 group-hover:bg-primary-500 transition-colors"></div>
                <span className="leading-relaxed">{example}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
