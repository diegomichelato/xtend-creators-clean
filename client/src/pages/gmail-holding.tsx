import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Shield, Mail, AlertCircle } from 'lucide-react';

export default function GmailHolding() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-semibold">Gmail Authorization Required</CardTitle>
          <CardDescription>
            This platform requires Gmail OAuth2 authorization to send emails and sync your inbox securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="text-sm font-medium text-amber-800">Action Required</p>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              All email operations are blocked until you connect your Gmail account via OAuth2.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Secure Gmail API integration</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Real-time inbox synchronization</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Personalized email campaigns</span>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <Button 
              onClick={() => setLocation('/gmail-settings')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Connect Gmail Account
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setLocation('/')}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            Your Gmail credentials are encrypted and never stored on our servers.
            We only access the specific permissions you authorize.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}