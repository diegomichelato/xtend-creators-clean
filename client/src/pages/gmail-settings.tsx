import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GmailToken {
  id: number;
  user_id: number;
  email: string;
  status: 'active' | 'invalid' | 'expired';
  expires_at: string;
  created_at: string;
}

export default function GmailSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle OAuth callback results
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'connected') {
      toast({
        title: "Gmail Connected Successfully",
        description: "Your Gmail account has been connected and is ready for use.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/tokens'] });
      // Clean up URL
      window.history.replaceState({}, '', '/gmail-settings');
    } else if (error) {
      let errorMessage = "Failed to connect Gmail account.";
      switch (error) {
        case 'missing_parameters':
          errorMessage = "Missing authorization parameters from Google.";
          break;
        case 'exchange_failed':
          errorMessage = "Failed to exchange authorization code for tokens.";
          break;
        case 'callback_failed':
          errorMessage = "OAuth callback processing failed.";
          break;
      }
      toast({
        title: "Gmail Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, '', '/gmail-settings');
    }
  }, [toast, queryClient]);

  // Fetch Gmail connection status
  const { data: gmailTokens, isLoading, error } = useQuery({
    queryKey: ['/api/gmail/tokens'],
    queryFn: async () => {
      const response = await fetch('/api/gmail/tokens', {
        headers: {
          'x-user-id': '1' // Get from auth context in real implementation
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tokens: ${response.status}`);
      }
      
      return response.json();
    },
    retry: false,
  });

  // Connect Gmail mutation
  const connectGmailMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/gmail/auth-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '1' // Get from auth context in real implementation
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate Gmail auth URL');
      }

      const data = await response.json();
      return data.auth_url;
    },
    onSuccess: (authUrl) => {
      setIsConnecting(true);
      // Redirect to Gmail OAuth (full page redirect)
      window.location.href = authUrl;
    },
    onError: (error) => {
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Sync emails mutation
  const syncEmailsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/gmail/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '1'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to sync emails');
      }

      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: 'Email Sync Complete',
        description: `Synced ${result.new_emails || 0} new emails`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Sync Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/gmail/refresh-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to refresh tokens');
      }

      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: 'Token Refresh Complete',
        description: `${result.success || 0} tokens refreshed successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/tokens'] });
    },
    onError: (error) => {
      toast({
        title: 'Refresh Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (isExpired || status === 'expired') {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (status === 'active') {
      return <Badge variant="default">Active</Badge>;
    }
    
    if (status === 'invalid') {
      return <Badge variant="secondary">Invalid</Badge>;
    }
    
    return <Badge variant="outline">{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Gmail Integration</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Connect your Gmail account to send personalized emails at scale
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load Gmail connections: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Connected Accounts
          </CardTitle>
          <CardDescription>
            Gmail accounts connected to your platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(!gmailTokens || gmailTokens.length === 0) ? (
            <div className="text-center py-12">
              <div className="bg-blue-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect Your Gmail Account</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Authorize your Gmail account to send personalized emails directly through the platform. 
                Your credentials are securely stored and encrypted.
              </p>
              <div className="space-y-4">
                <Button
                  onClick={() => connectGmailMutation.mutate()}
                  disabled={connectGmailMutation.isPending || isConnecting}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {connectGmailMutation.isPending || isConnecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Connect Gmail Account
                    </>
                  )}
                </Button>
                <div className="text-sm text-muted-foreground">
                  You'll be redirected to Google to authorize the connection
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    Gmail OAuth Required
                  </p>
                  <p className="text-sm text-blue-700">
                    This platform requires Gmail OAuth2 authorization for secure email sending and inbox synchronization. 
                    All email operations use the Gmail API with your authorized tokens.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {gmailTokens.map((token: GmailToken) => (
                <div key={token.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{token.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Connected on {formatDate(token.created_at)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {formatDate(token.expires_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(token.status, token.expires_at)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncEmailsMutation.mutate()}
                      disabled={syncEmailsMutation.isPending}
                    >
                      {syncEmailsMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Sync Emails'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How Gmail Integration Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium mb-2">1. Connect Gmail</h3>
              <p className="text-sm text-muted-foreground">
                Authorize the platform to access your Gmail account through secure OAuth
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium mb-2">2. Send Emails</h3>
              <p className="text-sm text-muted-foreground">
                All campaign emails are sent through your personal Gmail account
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <RefreshCw className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium mb-2">3. Sync Replies</h3>
              <p className="text-sm text-muted-foreground">
                Replies are automatically synced back to your platform inbox
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}