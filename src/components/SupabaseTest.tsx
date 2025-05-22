import { useEffect, useState } from 'react';
import { testConnection } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const isConnected = await testConnection();
        setConnectionStatus(isConnected ? 'success' : 'error');
        if (!isConnected) {
          setErrorMessage('Failed to connect to Supabase');
        }
      } catch (error) {
        setConnectionStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    };

    verifyConnection();
  }, []);

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'testing' ? 'bg-yellow-500' :
              connectionStatus === 'success' ? 'bg-green-500' :
              'bg-red-500'
            }`} />
            <span className="font-medium">
              {connectionStatus === 'testing' ? 'Testing connection...' :
               connectionStatus === 'success' ? 'Connected successfully' :
               'Connection failed'}
            </span>
          </div>
          {connectionStatus === 'error' && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 