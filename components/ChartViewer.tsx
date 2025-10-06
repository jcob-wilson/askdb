'use client';

import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon,
  Download,
  Maximize2,
  Minimize2,
  RotateCcw
} from 'lucide-react';

interface ChartViewerProps {
  data: any[];
  chartSuggestions: Array<{
    type: string;
    title: string;
    x?: string;
    y?: string;
  }>;
}

const COLORS = [
  '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

export function ChartViewer({ data, chartSuggestions }: ChartViewerProps) {
  const [selectedChart, setSelectedChart] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging
  console.log('ChartViewer props:', { data, chartSuggestions });

  if (!data || data.length === 0) {
    return (
      <div className="card-glass p-12 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gray-200 rounded-3xl blur-2xl opacity-30"></div>
          <BarChart3 className="relative h-20 w-20 text-gray-400 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Data Available</h3>
        <p className="text-gray-500">Charts will appear here when data is available</p>
      </div>
    );
  }

  const currentChart = chartSuggestions[selectedChart];
  if (!currentChart) return null;

  const renderChart = () => {
    const chartProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (currentChart.type) {
      case 'bar':
        if (!currentChart.x || !currentChart.y) return null;
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis 
              dataKey={currentChart.x} 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(229, 231, 235, 0.5)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)'
              }}
            />
            <Bar 
              dataKey={currentChart.y} 
              fill="url(#colorGradient)"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#0284c7" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
          </BarChart>
        );

      case 'line':
        if (!currentChart.x || !currentChart.y) return null;
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis 
              dataKey={currentChart.x} 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(229, 231, 235, 0.5)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey={currentChart.y} 
              stroke="#0ea5e9" 
              strokeWidth={3}
              dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#0ea5e9', strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'area':
        if (!currentChart.x || !currentChart.y) return null;
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis 
              dataKey={currentChart.x} 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(229, 231, 235, 0.5)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)'
              }}
            />
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey={currentChart.y} 
              stroke="#0ea5e9" 
              fill="url(#areaGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'pie':
        if (!currentChart.x || !currentChart.y) return null;
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey={currentChart.y}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(229, 231, 235, 0.5)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)'
              }}
            />
          </PieChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Unsupported chart type: {currentChart.type}</p>
          </div>
        );
    }
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'bar': return BarChart3;
      case 'line': return LineChartIcon;
      case 'pie': return PieChartIcon;
      default: return BarChart3;
    }
  };

  const handleExport = () => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      // Here you would implement actual export functionality
      console.log('Exporting chart...');
    }, 1000);
  };

  const chartContainer = (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4' : ''}`}>
      <div className={`${isFullscreen ? 'w-full h-full max-w-6xl max-h-[90vh]' : ''} card-glass animate-fade-in`}>
        {/* Chart Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-primary-100 rounded-xl blur-lg opacity-50"></div>
                {(() => {
                  const Icon = getChartIcon(currentChart.type);
                  return <Icon className="relative h-6 w-6 text-primary-600" />;
                })()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{currentChart.title}</h3>
                <p className="text-sm text-gray-600">
                  {currentChart.type.charAt(0).toUpperCase() + currentChart.type.slice(1)} Chart
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                disabled={isLoading}
                className="btn-secondary px-4 py-2 text-sm"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="btn-secondary px-4 py-2 text-sm"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4 mr-2" />
                ) : (
                  <Maximize2 className="h-4 w-4 mr-2" />
                )}
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </button>
            </div>
          </div>
        </div>

        {/* Chart Content */}
        <div className="p-6">
          <div className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'} w-full`}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart() || <div className="flex items-center justify-center h-full text-gray-500">No chart data available</div>}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart Navigation */}
        {chartSuggestions.length > 1 && (
          <div className="p-6 border-t border-white/20 bg-gradient-to-r from-gray-50/50 to-white/50">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {chartSuggestions.map((chart, index) => {
                  const Icon = getChartIcon(chart.type);
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedChart(index)}
                      className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        selectedChart === index
                          ? 'bg-primary-100 text-primary-700 border border-primary-200'
                          : 'bg-white/50 text-gray-600 hover:bg-white/80 hover:text-gray-800'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {chart.title}
                    </button>
                  );
                })}
              </div>
              <div className="text-sm text-gray-500">
                {selectedChart + 1} of {chartSuggestions.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return chartContainer;
}
