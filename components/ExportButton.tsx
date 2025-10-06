'use client';

import { useState } from 'react';
import { Download, FileText, Table, BarChart3, Loader2, Check } from 'lucide-react';

interface ExportButtonProps {
  data: any[];
  columns?: string[];
  chartData?: any;
  chartType?: string;
  filename?: string;
}

export function ExportButton({ data, columns, chartData, chartType, filename }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);

  const exportToCSV = (data: any[], columns?: string[]) => {
    if (!data || data.length === 0) return '';

    const headers = columns || Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  };

  const exportToJSON = (data: any[]) => {
    return JSON.stringify(data, null, 2);
  };

  const exportToExcel = async (data: any[], columns?: string[]) => {
    // For a real implementation, you'd use a library like xlsx
    // This is a simplified version that creates a CSV with .xlsx extension
    const csvContent = exportToCSV(data, columns);
    return csvContent;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: 'csv' | 'json' | 'excel') => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    setIsExporting(true);
    setExportedFormat(null);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const baseFilename = filename || 'query-results';
      
      let content: string;
      let fileExtension: string;
      let mimeType: string;

      switch (format) {
        case 'csv':
          content = exportToCSV(data, columns);
          fileExtension = 'csv';
          mimeType = 'text/csv';
          break;
        case 'json':
          content = exportToJSON(data);
          fileExtension = 'json';
          mimeType = 'application/json';
          break;
        case 'excel':
          content = await exportToExcel(data, columns);
          fileExtension = 'xlsx';
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      const filenameWithTimestamp = `${baseFilename}-${timestamp}.${fileExtension}`;
      downloadFile(content, filenameWithTimestamp, mimeType);
      
      setExportedFormat(format);
      setTimeout(() => setExportedFormat(null), 2000);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
      case 'excel':
        return <Table className="h-4 w-4" />;
      case 'json':
        return <FileText className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'csv': return 'CSV';
      case 'json': return 'JSON';
      case 'excel': return 'Excel';
      default: return format.toUpperCase();
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Download className="h-4 w-4" />
        <span className="text-sm">No data to export</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative group">
        <button
          disabled={isExporting}
          className="btn-primary px-4 py-2 text-sm"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export Data
        </button>
        
        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-large border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-2">
            {['csv', 'json', 'excel'].map((format) => (
              <button
                key={format}
                onClick={() => handleExport(format as 'csv' | 'json' | 'excel')}
                disabled={isExporting}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                {exportedFormat === format ? (
                  <Check className="h-4 w-4 mr-3 text-green-500" />
                ) : (
                  getFormatIcon(format)
                )}
                <span className="mr-3">
                  {getFormatLabel(format)}
                </span>
                {exportedFormat === format && (
                  <span className="text-xs text-green-600 ml-auto">Exported!</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Data Info */}
      <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
        {data.length} rows
      </div>
    </div>
  );
}
