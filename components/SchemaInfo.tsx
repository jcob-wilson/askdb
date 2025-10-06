'use client';

import { useState } from 'react';
import { Database, ChevronDown, ChevronRight, Info } from 'lucide-react';

interface SchemaInfoProps {
  schemaMetadata: any;
  onLoadSchema: () => void;
}

export function SchemaInfo({ schemaMetadata, onLoadSchema }: SchemaInfoProps) {
  const [expanded, setExpanded] = useState(false);

  if (!schemaMetadata) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Database Schema</h3>
              <p className="text-sm text-gray-600">Load schema to enable querying</p>
            </div>
          </div>
          <button
            onClick={onLoadSchema}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load Schema
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Database: {schemaMetadata.database}
              </h3>
              <p className="text-sm text-gray-600">
                {Object.keys(schemaMetadata.schema_json || {}).length} collections available
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="ml-1">{expanded ? 'Hide' : 'Show'} Details</span>
          </button>
        </div>

        {expanded && (
          <div className="mt-6 space-y-6">
            {/* Collections */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3">Collections</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(schemaMetadata.schema_json || {}).map(([collectionName, fields]: [string, any]) => (
                  <div key={collectionName} className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">{collectionName}</h5>
                    <p className="text-sm text-gray-600 mb-3">
                      {schemaMetadata.collection_descriptions?.[collectionName] || 'No description available'}
                    </p>
                    <div className="space-y-1">
                      {Object.entries(fields).slice(0, 5).map(([fieldName, fieldType]: [string, any]) => (
                        <div key={fieldName} className="flex justify-between text-xs">
                          <span className="text-gray-700">{fieldName}</span>
                          <span className="text-gray-500 font-mono">{fieldType}</span>
                        </div>
                      ))}
                      {Object.keys(fields).length > 5 && (
                        <div className="text-xs text-gray-500">
                          +{Object.keys(fields).length - 5} more fields
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Domain Notes */}
            {schemaMetadata.domain_notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">Domain Notes</h4>
                    <p className="text-sm text-blue-700">{schemaMetadata.domain_notes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timezone Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Configuration</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Timezone:</span>
                  <span className="ml-2 font-mono">{schemaMetadata.timezone}</span>
                </div>
                <div>
                  <span className="text-gray-600">Current Time:</span>
                  <span className="ml-2 font-mono">
                    {new Date(schemaMetadata.now_iso).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
