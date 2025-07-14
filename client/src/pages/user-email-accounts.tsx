import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, TestTube, Plus, Mail, Shield, Settings } from "lucide-react";

// Mock user ID for demo - in real app, get from auth context
const DEMO_USER_ID = "1";

interface EmailAccount {
  id: number;
  email: string;
  name: string;
  provider: string;
  status: string;
  dailyLimit: number;
  warmupEnabled: boolean;
  createdAt: string;
}

export default function UserEmailAccountsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    email: "",
    name: "",
    provider: "smtp",
    smtpHost: "",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    smtpSecure: true,
    dailyLimit: 100,
    warmupEnabled: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's email accounts
  const { data: emailAccounts = [], isLoading } = useQuery({
    queryKey: [`/api/users/${DEMO_USER_ID}/email_accounts`],
  });

  // Add email account mutation
  const addAccountMutation = useMutation({
    mutationFn: async (accountData: any) => {
      const response = await fetch(`/api/users/${DEMO_USER_ID}/email_accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add email account");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${DEMO_USER_ID}/email_accounts`] });
      setIsAddDialogOpen(false);
      setNewAccount({
        email: "",
        name: "",
        provider: "smtp",
        smtpHost: "",
        smtpPort: 587,
        smtpUsername: "",
        smtpPassword: "",
        smtpSecure: true,
        dailyLimit: 100,
        warmupEnabled: false
      });
      toast({
        title: "Email account added",
        description: "Your email account has been successfully configured and validated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add email account",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete email account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (emailId: number) => {
      const response = await fetch(`/api/users/${DEMO_USER_ID}/email_accounts/${emailId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete email account");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${DEMO_USER_ID}/email_accounts`] });
      toast({
        title: "Email account deleted",
        description: "The email account has been removed from your account.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete email account",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test email account mutation
  const testAccountMutation = useMutation({
    mutationFn: async (emailId: number) => {
      const response = await fetch(`/api/users/${DEMO_USER_ID}/email_accounts/${emailId}/test`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Test email failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test email sent",
        description: "Check your inbox to confirm the email account is working correctly.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddAccount = () => {
    addAccountMutation.mutate(newAccount);
  };

  const handleDeleteAccount = (emailId: number) => {
    deleteAccountMutation.mutate(emailId);
  };

  const handleTestAccount = (emailId: number) => {
    testAccountMutation.mutate(emailId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading email accounts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Email Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your email accounts for sending outreach campaigns.
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Email Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Email Account</DialogTitle>
              <DialogDescription>
                Connect your email account to send outreach campaigns. We'll validate the connection before saving.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAccount.email}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={newAccount.provider} onValueChange={(value) => setNewAccount(prev => ({ ...prev, provider: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smtp">SMTP</SelectItem>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="outlook">Outlook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newAccount.provider === "smtp" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={newAccount.smtpHost}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, smtpHost: e.target.value }))}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={newAccount.smtpPort}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || 587 }))}
                        placeholder="587"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUsername">Username</Label>
                      <Input
                        id="smtpUsername"
                        value={newAccount.smtpUsername}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, smtpUsername: e.target.value }))}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={newAccount.smtpPassword}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, smtpPassword: e.target.value }))}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyLimit">Daily Email Limit</Label>
                  <Input
                    id="dailyLimit"
                    type="number"
                    value={newAccount.dailyLimit}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, dailyLimit: parseInt(e.target.value) || 100 }))}
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddAccount} 
                disabled={addAccountMutation.isPending}
              >
                {addAccountMutation.isPending ? "Validating..." : "Add Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {emailAccounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No email accounts configured</h3>
            <p className="text-muted-foreground text-center mb-6">
              Add your first email account to start sending outreach campaigns.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Email Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {emailAccounts.map((account: EmailAccount) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      {account.email}
                    </CardTitle>
                    <CardDescription>
                      {account.name} • {account.provider.toUpperCase()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                      {account.status}
                    </Badge>
                    {account.warmupEnabled && (
                      <Badge variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        Warmup
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Daily Limit: {account.dailyLimit}</span>
                    <span>Added: {new Date(account.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestAccount(account.id)}
                      disabled={testAccountMutation.isPending}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAccount(account.id)}
                      disabled={deleteAccountMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}