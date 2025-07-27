'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import 'swagger-ui-react/swagger-ui.css';
import './swagger-ui.css';

// Dynamically import swagger-ui-react to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

interface SwaggerSpec {
  info?: {
    version?: string;
  };
  servers?: Array<{
    url?: string;
  }>;
  paths?: Record<string, any>;
}

export default function DocsPage() {
  const [swaggerSpec, setSwaggerSpec] = useState<SwaggerSpec | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchSwaggerSpec = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/docs');
      if (!response.ok) {
        throw new Error('Failed to fetch API documentation');
      }
      const spec = await response.json();
      setSwaggerSpec(spec);
      setLastUpdated(new Date());
      toast.success('API documentation updated');
    } catch (error) {
      console.error('Error fetching swagger spec:', error);
      toast.error('Failed to load API documentation');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPostmanCollection = async () => {
    try {
      const response = await fetch('/api/docs/postman');
      if (!response.ok) {
        throw new Error('Failed to generate Postman collection');
      }
      
      const collection = await response.blob();
      const url = window.URL.createObjectURL(collection);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ai-agent-dashboard-api.postman_collection.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Postman collection downloaded successfully');
    } catch (error) {
      console.error('Error downloading Postman collection:', error);
      toast.error('Failed to download Postman collection');
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    if (!autoRefresh) {
      toast.success('Auto-refresh enabled (30s interval)');
    } else {
      toast.info('Auto-refresh disabled');
    }
  };

  useEffect(() => {
    fetchSwaggerSpec();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchSwaggerSpec();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground mt-2">
            Interactive documentation for the AI Agent Dashboard API
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadPostmanCollection}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Postman Collection
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoRefresh}
            className={`flex items-center gap-2 ${autoRefresh ? 'bg-green-50 border-green-200' : ''}`}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSwaggerSpec}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {lastUpdated && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Documentation Status</CardTitle>
                <CardDescription>
                  Last updated: {lastUpdated.toLocaleString()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Live Documentation
                </div>
                {autoRefresh && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Auto-updating
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading API documentation...</span>
            </div>
          ) : swaggerSpec ? (
            <div className="swagger-ui-container">
              <SwaggerUI 
                spec={swaggerSpec}
                docExpansion="none"
                defaultModelsExpandDepth={1}
                defaultModelExpandDepth={1}
                displayOperationId={false}
                displayRequestDuration={true}
                filter={true}
                showExtensions={true}
                showCommonExtensions={true}
                tryItOutEnabled={true}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Failed to load API documentation</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/api/docs" target="_blank" className="block text-sm text-blue-600 hover:underline">
              Raw OpenAPI Spec (JSON)
            </a>
            <a href="/api/docs/postman" target="_blank" className="block text-sm text-blue-600 hover:underline">
              Postman Collection (JSON)
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">API Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>Version:</strong> {swaggerSpec?.info?.version || 'N/A'}
            </div>
            <div>
              <strong>Base URL:</strong> {swaggerSpec?.servers?.[0]?.url || 'N/A'}
            </div>
            <div>
              <strong>Total Endpoints:</strong> {
                swaggerSpec?.paths ? Object.keys(swaggerSpec.paths).length : 'N/A'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Authentication</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>This API uses Bearer Token authentication.</p>
            <p className="mt-2 text-muted-foreground">
              Add your JWT token in the &ldquo;Authorize&rdquo; section above to test endpoints.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
