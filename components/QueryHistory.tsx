'use client';

import { useState, useEffect } from 'react';
import { 
  History, 
  Star, 
  StarOff, 
  Trash2, 
  Search, 
  Clock, 
  Database,
  BarChart3,
  Copy,
  Check
} from 'lucide-react';

interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  isFavorite: boolean;
  resultCount?: number;
  chartType?: string;
}

interface QueryHistoryProps {
  onQuerySelect: (query: string) => void;
  onClearHistory: () => void;
  loading?: boolean;
}

export function QueryHistory({ onQuerySelect, onClearHistory, loading = false }: QueryHistoryProps) {
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('queryHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.error('Error loading query history:', error);
      }
    }
  }, []);

  const saveHistory = (newHistory: QueryHistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('queryHistory', JSON.stringify(newHistory));
  };

  const addToHistory = (query: string, resultCount?: number, chartType?: string) => {
    const newItem: QueryHistoryItem = {
      id: Date.now().toString(),
      query,
      timestamp: new Date(),
      isFavorite: false,
      resultCount,
      chartType
    };

    const updatedHistory = [newItem, ...history].slice(0, 50); // Keep only last 50 queries
    saveHistory(updatedHistory);
  };

  const toggleFavorite = (id: string) => {
    const updatedHistory = history.map(item =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    saveHistory(updatedHistory);
  };

  const removeFromHistory = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    saveHistory(updatedHistory);
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all query history?')) {
      saveHistory([]);
      onClearHistory();
    }
  };

  const copyQuery = async (query: string, id: string) => {
    try {
      await navigator.clipboard.writeText(query);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy query:', error);
    }
  };

  const filteredHistory = history.filter(item => 
    filter === 'all' || item.isFavorite
  );

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getChartIcon = (chartType?: string) => {
    if (!chartType) return null;
    return <BarChart3 className="h-4 w-4 text-primary-500" />;
  };

  return (
    <div className="card animate-slide-up">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50/50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative mr-4">
              <div className="absolute inset-0 bg-primary-100 rounded-xl blur-lg opacity-50"></div>
              <History className="relative h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Query History</h3>
              <p className="text-sm text-gray-600">{history.length} queries saved</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter(filter === 'all' ? 'favorites' : 'all')}
              className={`btn-secondary px-4 py-2 text-sm ${
                filter === 'favorites' ? 'bg-primary-100 text-primary-700 border-primary-200' : ''
              }`}
            >
              <Star className="h-4 w-4 mr-2" />
              {filter === 'favorites' ? 'All' : 'Favorites'}
            </button>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="btn-error px-4 py-2 text-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gray-200 rounded-3xl blur-2xl opacity-30"></div>
              <History className="relative h-16 w-16 text-gray-400 mx-auto" />
            </div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">
              {filter === 'favorites' ? 'No Favorite Queries' : 'No Query History'}
            </h4>
            <p className="text-gray-500">
              {filter === 'favorites' 
                ? 'Star queries to add them to your favorites'
                : 'Your recent queries will appear here'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredHistory.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50/50 transition-colors group">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => onQuerySelect(item.query)}
                        disabled={loading}
                        className="text-left flex-1 min-w-0 group/query disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 group-hover/query:text-primary-600 transition-colors">
                          {item.query}
                        </p>
                        <p className="text-xs text-gray-500 group-hover/query:text-primary-500 transition-colors">
                          {loading ? 'Executing query...' : 'Click to execute this query'}
                        </p>
                      </button>
                      <div className="flex items-center gap-1">
                        {getChartIcon(item.chartType)}
                        {item.resultCount && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {item.resultCount} results
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(item.timestamp)}
                      </div>
                      {item.chartType && (
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          {item.chartType}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => copyQuery(item.query, item.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Copy query"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.isFavorite
                          ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50'
                          : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                      }`}
                      title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {item.isFavorite ? (
                        <Star className="h-4 w-4 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => removeFromHistory(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove from history"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
