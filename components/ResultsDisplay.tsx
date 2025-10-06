'use client';

import { useState } from 'react';
import { BarChart3, Table, Code, AlertCircle, CheckCircle } from 'lucide-react';
import { DataTable } from './DataTable';
import { PipelineViewer } from './PipelineViewer';
import { ChartViewer } from './ChartViewer';
import { ExportButton } from './ExportButton';

interface ResultsDisplayProps {
  results: any;
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState('answer');

  const tabs = [
    { id: 'answer', label: 'Answer', icon: CheckCircle },
    { id: 'data', label: 'Data', icon: Table },
    { id: 'pipeline', label: 'Pipeline', icon: Code },
    { id: 'charts', label: 'Charts', icon: BarChart3 },
  ];

  return (
    <div className="card animate-slide-up">
      {/* Header */}
      <div className="border-b border-gray-200 p-8 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative mr-4">
              <div className="absolute inset-0 bg-success-100 rounded-xl blur-lg opacity-50"></div>
              <CheckCircle className="relative h-8 w-8 text-success-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Query Results</h2>
              <p className="text-gray-600 mt-1">Your MongoDB query has been executed successfully</p>
            </div>
          </div>
          <div className="flex items-center text-sm text-success-600 bg-success-50 px-4 py-2 rounded-lg">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="font-medium">Query executed successfully</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50/50">
        <nav className="flex space-x-1 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 bg-white rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-100/50'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-8">
        {activeTab === 'answer' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-success-50 to-success-100 border border-success-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-8 h-8 bg-success-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-success-800 mb-3">Answer</h3>
                  <p className="text-success-700 leading-relaxed text-base">{results.final_answer}</p>
                </div>
              </div>
            </div>
            
            {results.assumptions && results.assumptions.length > 0 && (
              <div className="bg-gradient-to-r from-warning-50 to-warning-100 border border-warning-200 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 bg-warning-500 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-warning-800 mb-3">Assumptions</h3>
                    <ul className="space-y-2 text-warning-700">
                  {results.assumptions.map((assumption: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-warning-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="leading-relaxed">{assumption}</span>
                        </li>
                  ))}
                </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="relative mr-4">
                  <div className="absolute inset-0 bg-primary-100 rounded-xl blur-lg opacity-50"></div>
                  <Table className="relative h-8 w-8 text-primary-600" />
                </div>
          <div>
                  <h3 className="text-2xl font-bold text-gray-900">Data Results</h3>
                  <p className="text-gray-600 mt-1">Query results displayed in a structured table format</p>
                </div>
              </div>
              {results.query_result?.success && (
                <ExportButton 
                  data={results.query_result.data} 
                  columns={results.columns}
                  filename="query-results"
                />
              )}
            </div>
            {results.query_result?.success ? (
              <DataTable 
                data={results.query_result.data} 
                columns={results.columns}
              />
            ) : (
              <div className="bg-gradient-to-r from-error-50 to-error-100 border border-error-200 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 bg-error-500 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-error-800 mb-2">Query Execution Error</h4>
                    <p className="text-error-700 leading-relaxed">
                      {results.query_result?.error || 'Unknown error occurred while executing the query'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="animate-fade-in">
            <div className="flex items-center mb-6">
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-primary-100 rounded-xl blur-lg opacity-50"></div>
                <Code className="relative h-8 w-8 text-primary-600" />
              </div>
          <div>
                <h3 className="text-2xl font-bold text-gray-900">MongoDB Aggregation Pipeline</h3>
                <p className="text-gray-600 mt-1">Generated MongoDB pipeline for your query</p>
              </div>
            </div>
            <PipelineViewer 
              pipeline={results.pipeline}
              baseCollection={results.base_collection}
            />
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="animate-fade-in">
            <div className="flex items-center mb-6">
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-primary-100 rounded-xl blur-lg opacity-50"></div>
                <BarChart3 className="relative h-8 w-8 text-primary-600" />
              </div>
          <div>
                <h3 className="text-2xl font-bold text-gray-900">Interactive Charts</h3>
                <p className="text-gray-600 mt-1">Interactive visualizations powered by Recharts</p>
              </div>
            </div>
            {results.chart_suggestions && results.chart_suggestions.length > 0 && results.query_result?.success ? (
              <>
                {/* Debug info */}
                <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
                  <p><strong>Chart Suggestions:</strong> {JSON.stringify(results.chart_suggestions, null, 2)}</p>
                  <p><strong>Data Length:</strong> {results.query_result.data?.length || 0}</p>
                  <p><strong>Sample Data:</strong> {JSON.stringify(results.query_result.data?.slice(0, 2), null, 2)}</p>
                </div>
                <ChartViewer 
                  data={results.query_result.data} 
                  chartSuggestions={results.chart_suggestions}
                />
              </>
            ) : (
              <div className="card-glass p-12 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gray-200 rounded-3xl blur-2xl opacity-30"></div>
                  <BarChart3 className="relative h-20 w-20 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Charts Available</h3>
                <p className="text-gray-500">
                  {!results.query_result?.success 
                    ? 'Charts will appear when your query executes successfully'
                    : 'No chart suggestions available for this data'
                  }
                    </p>
                  </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
