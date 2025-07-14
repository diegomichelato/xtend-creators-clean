import React, { useState } from 'react';
import { Mail, Key, Settings, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ConnectEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountConnected: (account: string) => void;
}

export function ConnectEmailModal({ isOpen, onClose, onAccountConnected }: ConnectEmailModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [customConfig, setCustomConfig] = useState({
    email: '',
    password: '',
    imapHost: '',
    imapPort: '993',
    smtpHost: '',
    smtpPort: '587'
  });

  const providers = [
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Connect your Gmail account with OAuth2',
      icon: '📧',
      authType: 'oauth2',
      popular: true
    },
    {
      id: 'outlook',
      name: 'Outlook',
      description: 'Connect your Microsoft Outlook account',
      icon: '📮',
      authType: 'oauth2',
      popular: true
    },
    {
      id: 'custom',
      name: 'Custom IMAP',
      description: 'Connect any email provider with IMAP/SMTP',
      icon: '⚙️',
      authType: 'manual',
      popular: false
    }
  ];

  const handleOAuth2Connect = async (provider: string) => {
    setIsConnecting(true);
    try {
      console.log(`Initiating OAuth2 flow for ${provider}`);
      // This would integrate with your backend OAuth2 endpoints
      // window.location.href = `/api/auth/${provider}`;
      
      // For demo purposes, simulate successful connection
      setTimeout(() => {
        onAccountConnected(`user@${provider}.com`);
        setIsConnecting(false);
      }, 2000);
    } catch (error) {
      console.error('OAuth2 connection failed:', error);
      setIsConnecting(false);
    }
  };

  const handleCustomConnect = async () => {
    setIsConnecting(true);
    try {
      console.log('Connecting custom email account:', customConfig);
      
      // This would call your backend API to test and save the email account
      const response = await fetch('/api/email-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customConfig.email,
          provider: 'custom',
          smtpHost: customConfig.smtpHost,
          smtpPort: parseInt(customConfig.smtpPort),
          smtpUsername: customConfig.email,
          smtpPassword: customConfig.password,
          imapHost: customConfig.imapHost,
          imapPort: parseInt(customConfig.imapPort),
          imapUsername: customConfig.email,
          imapPassword: customConfig.password,
          name: customConfig.email.split('@')[0]
        })
      });

      if (response.ok) {
        onAccountConnected(customConfig.email);
      } else {
        console.error('Failed to connect custom email account');
      }
    } catch (error) {
      console.error('Custom email connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connect Email Account</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="providers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="providers">Email Providers</TabsTrigger>
            <TabsTrigger value="custom">Custom Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="space-y-4">
            <div className="grid gap-4">
              {providers.filter(p => p.authType === 'oauth2').map((provider) => (
                <Card 
                  key={provider.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{provider.icon}</span>
                        <div>
                          <CardTitle className="text-base">{provider.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {provider.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {provider.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                        {selectedProvider === provider.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {selectedProvider === provider.id && (
                    <CardContent className="pt-0">
                      <Button 
                        onClick={() => handleOAuth2Connect(provider.id)}
                        disabled={isConnecting}
                        className="w-full"
                      >
                        {isConnecting ? 'Connecting...' : `Connect ${provider.name}`}
                      </Button>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={customConfig.email}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your email password"
                    value={customConfig.password}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imapHost">IMAP Host</Label>
                  <Input
                    id="imapHost"
                    placeholder="imap.example.com"
                    value={customConfig.imapHost}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, imapHost: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="imapPort">IMAP Port</Label>
                  <Input
                    id="imapPort"
                    placeholder="993"
                    value={customConfig.imapPort}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, imapPort: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.example.com"
                    value={customConfig.smtpHost}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    placeholder="587"
                    value={customConfig.smtpPort}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                  />
                </div>
              </div>

              <Button 
                onClick={handleCustomConnect}
                disabled={isConnecting || !customConfig.email || !customConfig.password}
                className="w-full"
              >
                {isConnecting ? 'Testing Connection...' : 'Connect Email Account'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-xs text-muted-foreground mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="font-medium mb-1">🔒 Your data is secure</p>
          <p>
            Email credentials are encrypted and stored securely. OAuth2 connections don't share your password with our platform.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}