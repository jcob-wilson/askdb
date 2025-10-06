'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, ArrowRight, Sparkles, BarChart3, Code } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    // Show landing page for 3 seconds, then redirect
    const timer = setTimeout(() => {
      setShowLanding(true);
    }, 1000);

    const redirectTimer = setTimeout(() => {
      router.replace('/askdb');
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  if (!showLanding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-100/50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary-500 rounded-3xl blur-2xl opacity-30"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AskDB</h2>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-100/50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-success-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-warning-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="floating-card p-8 mb-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl blur-2xl opacity-30"></div>
                <div className="relative bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                  <Database className="h-16 w-16 text-primary-600" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-6xl font-bold gradient-text mb-4">
                AskDB
              </h1>
              <div className="h-2 w-32 bg-gradient-to-r from-primary-500 to-primary-600 mx-auto rounded-full mb-6"></div>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
                Transform your natural language questions into powerful MongoDB aggregation pipelines with AI-powered intelligence
              </p>
              <button
                onClick={() => router.push('/askdb')}
                className="btn-primary px-8 py-4 text-lg inline-flex items-center"
              >
                Launch AskDB
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card p-6 text-center animate-slide-up">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-primary-100 rounded-xl blur-lg opacity-50"></div>
              <Sparkles className="relative h-12 w-12 text-primary-600 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered</h3>
            <p className="text-gray-600">Advanced AI converts your natural language into precise MongoDB queries</p>
          </div>

          <div className="card p-6 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-success-100 rounded-xl blur-lg opacity-50"></div>
              <BarChart3 className="relative h-12 w-12 text-success-600 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Visual Analytics</h3>
            <p className="text-gray-600">Interactive charts and visualizations for your data insights</p>
          </div>

          <div className="card p-6 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-warning-100 rounded-xl blur-lg opacity-50"></div>
              <Code className="relative h-12 w-12 text-warning-600 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">MongoDB Native</h3>
            <p className="text-gray-600">Direct integration with MongoDB using aggregation pipelines</p>
          </div>
        </div>

        {/* Auto-redirect notice */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Automatically redirecting to the application in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
}