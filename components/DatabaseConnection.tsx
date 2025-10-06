'use client';

import { useState } from 'react';
import { Database, Key, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

interface DatabaseConnectionProps {
  onConnectionSuccess: (connectionString: string, databaseName: string) => void;
  onSchemaLoad: (schema: any) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  connectionString: string;
  databaseName: string;
}

export function DatabaseConnection({ onConnectionSuccess, onSchemaLoad, onDisconnect, isConnected, connectionString: propConnectionString, databaseName: propDatabaseName }: DatabaseConnectionProps) {
  const [connectionString, setConnectionString] = useState(propConnectionString);
  const [databaseName, setDatabaseName] = useState(propDatabaseName);
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleConnect = async () => {
    if (!connectionString.trim() || !databaseName.trim()) {
      setErrorMessage('Please provide both connection string and database name');
      setConnectionStatus('error');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('idle');
    setErrorMessage('');

    try {
      // Test connection by fetching schema
      const response = await fetch('/api/schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionString,
          database: databaseName
        }),
      });

      if (response.ok) {
        const schemaData = await response.json();
        setConnectionStatus('success');
        onConnectionSuccess(connectionString, databaseName);
        onSchemaLoad(schemaData);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to connect to database');
        setConnectionStatus('error');
      }
    } catch (error) {
      setErrorMessage('Network error: Unable to connect to database');
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLoadSampleSchema = () => {
    // Load sample schema for demo purposes
    const sampleSchema = {
      database: databaseName || 'sample_db',
      schema_json: {
        drivers: {
          _id: "ObjectId",
          name: "string",
          city_id: "ObjectId",
          email: "string",
          phone: "string",
          created_at: "Date"
        },
        cities: {
          _id: "ObjectId", 
          name: "string",
          state: "string",
          country: "string"
        },
        invoices: {
          _id: "ObjectId",
          driver_id: "ObjectId",
          amount: "number",
          status: "string",
          created_at: "Date"
        }
      },
      collection_descriptions: {
        drivers: "Driver information including contact details and city location",
        cities: "City information with location details",
        invoices: "Financial transactions and payments for drivers"
      },
      field_descriptions: {
        drivers: {
          name: "Full name of the driver",
          city_id: "Reference to cities collection",
          email: "Driver's email address",
          phone: "Driver's phone number"
        },
        cities: {
          name: "City name",
          state: "State or province",
          country: "Country name"
        },
        invoices: {
          amount: "Payment amount in local currency",
          status: "Payment status (paid, pending, cancelled)",
          driver_id: "Reference to drivers collection"
        }
      },
      domain_notes: "Revenue = invoices.amount, drivers join cities via city_id",
      timezone: "Asia/Kolkata",
      now_iso: new Date().toISOString()
    };

    setConnectionStatus('success');
    onConnectionSuccess('sample', databaseName || 'sample_db');
    onSchemaLoad(sampleSchema);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Database className="h-8 w-8 text-blue-600 mr-3" />
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Database Connection</h2>
          <p className="text-gray-600">Connect to your MongoDB database to start querying</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Connection String Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            MongoDB Connection String
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              placeholder="mongodb://localhost:27017 or mongodb+srv://user:pass@cluster.mongodb.net"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your connection string is stored locally and never sent to our servers
          </p>
        </div>

        {/* Database Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Database Name
          </label>
          <input
            type="text"
            value={databaseName}
            onChange={(e) => setDatabaseName(e.target.value)}
            placeholder="my_database"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <span className="text-green-700 font-medium">Successfully connected to database!</span>
                <p className="text-sm text-green-600 mt-1">
                  Database: {propDatabaseName} | Connection: {propConnectionString.substring(0, 30)}...
                </p>
              </div>
            </div>
            <button
              onClick={onDisconnect}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              Disconnect
            </button>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {!isConnected ? (
            <>
              <button
                onClick={handleConnect}
                disabled={isConnecting || !connectionString.trim() || !databaseName.trim()}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Connect to Database
                  </>
                )}
              </button>

              <button
                onClick={handleLoadSampleSchema}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Use Sample Schema
              </button>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center px-6 py-3 bg-green-100 text-green-700 rounded-lg">
              <CheckCircle className="h-4 w-4 mr-2" />
              Connected Successfully
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Connection Examples:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Local MongoDB:</strong> mongodb://localhost:27017</p>
            <p><strong>MongoDB Atlas:</strong> mongodb+srv://username:password@cluster.mongodb.net</p>
            <p><strong>With Database:</strong> mongodb://localhost:27017/my_database</p>
          </div>
        </div>
      </div>
    </div>
  );
}
