import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GmailOAuthButtonProps {
  userId: string;
  onConnected?: (email: string) => void;
}

export function GmailOAuthButton({ userId, onConnected }: GmailOAuthButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const handleConnectGmail = async () => {
    try {
      setIsConnecting(true);
      
      // Get OAuth URL from backend
      const response = await fetch(`/api/auth/gmail?user_id=${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get OAuth URL');
      }

      // Open OAuth flow in popup
      const popup = window.open(
        data.auth_url,
        'gmail-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for popup close or redirect
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
          
          // Check URL params for success/error
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('gmail_connected') === 'true') {
            const email = urlParams.get('email');
            setIsConnected(true);
            toast({
              title: "Gmail Connected!",
              description: `Successfully connected ${email}`,
            });
            onConnected?.(email || '');
            
            // Clean up URL params
            window.history.replaceState({}, '', window.location.pathname);
          } else if (urlParams.get('gmail_error') === 'true') {
            toast({
              title: "Connection Failed",
              description: "Failed to connect Gmail account. Please try again.",
              variant: "destructive",
            });
            
            // Clean up URL params
            window.history.replaceState({}, '', window.location.pathname);
          }
        }
      }, 1000);

    } catch (error) {
      console.error('Gmail OAuth error:', error);
      toast({
        title: "Connection Error",
        description: error.message,
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const handleSyncEmails = async () => {
    try {
      setIsConnecting(true);
      
      const response = await fetch('/api/sync-gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Emails Synced!",
          description: `Synced ${result.synced_count} new emails`,
        });
      } else {
        throw new Error(result.message || 'Sync failed');
      }
      
    } catch (error) {
      console.error('Gmail sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={handleSyncEmails}
          disabled={isConnecting}
          variant="outline"
          size="sm"
        >
          {isConnecting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Mail className="h-4 w-4 mr-2" />
          )}
          Sync Gmail
        </Button>
        <div className="flex items-center text-sm text-green-600">
          <CheckCircle className="h-4 w-4 mr-1" />
          Gmail Connected
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnectGmail}
      disabled={isConnecting}
      className="bg-blue-600 hover:bg-blue-700"
    >
      {isConnecting ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Mail className="h-4 w-4 mr-2" />
      )}
      Connect Gmail
    </Button>
  );
}