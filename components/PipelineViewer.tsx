'use client';

import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

interface PipelineViewerProps {
  pipeline: any[];
  baseCollection: string;
}

export function PipelineViewer({ pipeline, baseCollection }: PipelineViewerProps) {
  const [copied, setCopied] = useState(false);
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set());

  const toggleStage = (index: number) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedStages(newExpanded);
  };

  const copyToClipboard = async () => {
    const pipelineString = JSON.stringify(pipeline, null, 2);
    await navigator.clipboard.writeText(pipelineString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!pipeline || pipeline.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pipeline available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-medium text-gray-800">Collection: {baseCollection}</h4>
          <p className="text-sm text-gray-600">{pipeline.length} aggregation stages</p>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Pipeline
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <div className="space-y-2">
          {pipeline.map((stage, index) => {
            const stageName = Object.keys(stage)[0];
            const isExpanded = expandedStages.has(index);
            
            return (
              <div key={index} className="bg-gray-800 rounded p-3">
                <button
                  onClick={() => toggleStage(index)}
                  className="flex items-center w-full text-left text-green-400 hover:text-green-300"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  <span className="font-mono font-semibold">
                    {index + 1}. ${stageName}
                  </span>
                </button>
                
                {isExpanded && (
                  <div className="mt-2 ml-6">
                    <pre className="text-gray-300 text-sm overflow-x-auto">
                      {JSON.stringify(stage[stageName], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-800 mb-2">Pipeline Summary</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          {pipeline.map((stage, index) => {
            const stageName = Object.keys(stage)[0];
            return (
              <li key={index} className="flex items-center">
                <span className="font-mono bg-blue-100 px-2 py-1 rounded text-xs mr-2">
                  ${stageName}
                </span>
                <span>{getStageDescription(stageName)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function getStageDescription(stageName: string): string {
  const descriptions: { [key: string]: string } = {
    $match: 'Filter documents',
    $lookup: 'Join with another collection',
    $unwind: 'Deconstruct array fields',
    $group: 'Group documents and compute aggregations',
    $sort: 'Sort documents',
    $limit: 'Limit number of documents',
    $project: 'Reshape document structure',
    $addFields: 'Add new fields',
    $count: 'Count documents',
    $facet: 'Process multiple aggregation pipelines',
    $bucket: 'Group documents into buckets',
    $sample: 'Randomly sample documents',
    $skip: 'Skip documents',
    $replaceRoot: 'Replace root document',
    $out: 'Write results to collection',
    $merge: 'Merge results into collection'
  };
  
  return descriptions[stageName] || 'Process documents';
}
