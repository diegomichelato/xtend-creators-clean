import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface OrgGmailSettings {
  has_credentials: boolean;
  status: 'active' | 'inactive' | 'not_configured' | 'error';
  redirect_uri?: string;
  last_updated?: string;
  user_role: 'admin' | 'member' | 'viewer';
}

export default function OrgSettings() {
  const [credentials, setCredentials] = useState({
    google_client_id: '',
    google_client_secret: '',
    redirect_uri: ''
  });
  const [orgId] = useState('xtend-default'); // For demo - would come from user context
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current Gmail settings
  const { data: settings, isLoading } = useQuery<OrgGmailSettings>({
    queryKey: [`/api/org/${orgId}/gmail/settings`],
    retry: false
  });

  // Save credentials mutation
  const saveCredentialsMutation = useMutation({
    mutationFn: async (data: typeof credentials) => {
      return apiRequest(`/api/org/${orgId}/gmail/credentials`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-admin-user' // Would come from auth context
        }
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Gmail Integration Updated",
        description: "Your organization's Gmail API credentials have been saved successfully."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/org/${orgId}/gmail/settings`] });
      
      // Update redirect URI with the auto-generated one
      if (data.redirect_uri) {
        setCredentials(prev => ({ ...prev, redirect_uri: data.redirect_uri }));
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save Gmail credentials",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (!credentials.google_client_id || !credentials.google_client_secret) {
      toast({
        title: "Missing Information",
        description: "Please provide both Google Client ID and Client Secret",
        variant: "destructive"
      });
      return;
    }

    saveCredentialsMutation.mutate(credentials);
  };

  useEffect(() => {
    if (settings?.redirect_uri && !credentials.redirect_uri) {
      setCredentials(prev => ({ ...prev, redirect_uri: settings.redirect_uri }));
    }
  }, [settings]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800">Inactive</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Not Configured</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
          <p className="text-gray-600 mt-2">Configure your organization's Gmail API integration</p>
        </div>
        {getStatusBadge(settings?.status || 'not_configured')}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Gmail API Integration
            {settings?.user_role !== 'admin' && (
              <Badge variant="outline">View Only</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Configure your organization's own Gmail API credentials to enable personalized email sending
            and avoid shared quota limits. Users in your organization will use these credentials when
            connecting their Gmail accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {settings?.user_role !== 'admin' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Admin Access Required</h3>
              <p className="text-blue-700">
                Only organization administrators can configure Gmail API credentials. 
                Contact your admin to set up or modify these settings.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-medium text-amber-900 mb-2">Before You Begin</h3>
                <p className="text-amber-700 mb-2">
                  You'll need to create a Google Cloud Console project and enable the Gmail API:
                </p>
                <ol className="list-decimal list-inside text-amber-700 space-y-1 text-sm">
                  <li>Go to <code>console.cloud.google.com</code></li>
                  <li>Create a new project or select existing</li>
                  <li>Enable the Gmail API</li>
                  <li>Create OAuth 2.0 credentials (Web application)</li>
                  <li>Add your redirect URI to authorized redirect URIs</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="client_id">Google Client ID *</Label>
                  <Input
                    id="client_id"
                    placeholder="123456789-abcdefg.apps.googleusercontent.com"
                    value={credentials.google_client_id}
                    onChange={(e) => setCredentials(prev => ({ 
                      ...prev, 
                      google_client_id: e.target.value 
                    }))}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Found in your Google Cloud Console OAuth 2.0 credentials
                  </p>
                </div>

                <div>
                  <Label htmlFor="client_secret">Google Client Secret *</Label>
                  <Input
                    id="client_secret"
                    type="password"
                    placeholder="GOCSPX-..."
                    value={credentials.google_client_secret}
                    onChange={(e) => setCredentials(prev => ({ 
                      ...prev, 
                      google_client_secret: e.target.value 
                    }))}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your OAuth 2.0 client secret from Google Cloud Console
                  </p>
                </div>

                <div>
                  <Label htmlFor="redirect_uri">Authorized Redirect URI</Label>
                  <Textarea
                    id="redirect_uri"
                    value={credentials.redirect_uri || 'Will be auto-generated after saving'}
                    readOnly
                    className="font-mono text-sm bg-gray-50"
                    rows={2}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Add this URI to your Google OAuth 2.0 credentials' authorized redirect URIs
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSave}
                  disabled={saveCredentialsMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saveCredentialsMutation.isPending ? 'Saving...' : 'Save Configuration'}
                </Button>
                
                {settings?.has_credentials && (
                  <Button variant="outline">
                    Test Connection
                  </Button>
                )}
              </div>

              {settings?.last_updated && (
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(settings.last_updated).toLocaleString()}
                </p>
              )}
            </>
          )}

          <div className="border-t pt-6">
            <h3 className="font-medium mb-3">How This Works</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• When users in your organization connect Gmail, they'll use your API credentials</p>
              <p>• This prevents hitting Google's default quota limits for shared applications</p>
              <p>• Your organization maintains full control over API usage and monitoring</p>
              <p>• Each user still authenticates with their own Gmail account</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}