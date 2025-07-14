import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Shield, Users, FileText, Settings2, Edit, Trash2, Mail, Upload, Link } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { ConnectEmailDialog } from "@/components/user-management";

// Email Accounts Section Component
function EmailAccountsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [connectingGmail, setConnectingGmail] = useState(false);

  // Fetch current user data for platform-managed account
  const { data: currentUser } = useQuery({
    queryKey: ['/api/users/me'],
  });

  // Fetch current user's email accounts
  const { data: emailAccounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ['/api/email-accounts'],
    refetchInterval: 5000, // Refresh every 5 seconds to catch status changes
    queryFn: async () => {
      const response = await fetch('/api/email-accounts', {
        headers: {
          'x-user-id': (currentUser as any)?.id || ''
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch email accounts');
      }
      return response.json();
    },
    enabled: !!(currentUser as any)?.id,
  });

  // Connect Gmail mutation
  const connectGmailMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/gmail/auth-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': (currentUser as any)?.id || ''
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate Gmail auth URL');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setConnectingGmail(true);
      // Redirect to Gmail OAuth
      window.location.href = data.auth_url;
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set primary account mutation
  const setPrimaryMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const response = await fetch(`/api/email-accounts/${accountId}/set-primary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': (currentUser as any)?.id || ''
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to set primary account');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-accounts'] });
      toast({
        title: "Primary Account Updated",
        description: "Your primary sending account has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Disconnect account mutation
  const disconnectMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const response = await fetch(`/api/email-accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': (currentUser as any)?.id || ''
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect account');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-accounts'] });
      toast({
        title: "Account Disconnected",
        description: "Email account has been disconnected successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Disconnect Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create platform-managed account mutation
  const createPlatformAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/email-accounts/platform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': (currentUser as any)?.id || ''
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to create platform account');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-accounts'] });
      toast({
        title: "Platform Account Created",
        description: "Your platform-managed sending address has been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (account: any) => {
    if (account.provider === 'platform') {
      return <Badge variant="default">Active</Badge>;
    }
    
    switch (account.status) {
      case 'connected':
        return <Badge variant="default">Connected</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loadingAccounts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Accounts</CardTitle>
          <CardDescription>Loading your email accounts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Connected Email Accounts
          </CardTitle>
          <CardDescription>
            Manage your email sending accounts. You can send emails from Gmail (your personal account) or from a platform-managed address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailAccounts && emailAccounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailAccounts.map((account: any) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      {account.email}
                      {account.provider === 'platform' && (
                        <div className="text-xs text-gray-500 mt-1">
                          Platform-managed address
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {account.provider === 'gmail' ? 'Gmail' : 'Platform'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(account)}
                    </TableCell>
                    <TableCell>
                      {account.is_primary ? (
                        <Badge variant="default">Primary</Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPrimaryMutation.mutate(account.id)}
                          disabled={setPrimaryMutation.isPending}
                        >
                          Set Primary
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <Settings2 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!account.is_primary && (
                            <DropdownMenuItem
                              onClick={() => setPrimaryMutation.mutate(account.id)}
                            >
                              Set as Primary
                            </DropdownMenuItem>
                          )}
                          {account.provider === 'gmail' && account.status === 'expired' && (
                            <DropdownMenuItem
                              onClick={() => connectGmailMutation.mutate()}
                            >
                              Reconnect Gmail
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => disconnectMutation.mutate(account.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Disconnect
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Accounts Connected</h3>
              <p className="text-gray-500 mb-6">
                Connect an email account to start sending campaigns and outreach emails.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Account */}
      <Card>
        <CardHeader>
          <CardTitle>Add Email Account</CardTitle>
          <CardDescription>
            Connect a new email account for sending campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Connect Gmail */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-6 w-6 text-red-500" />
                <div>
                  <h4 className="font-medium">Connect Gmail</h4>
                  <p className="text-sm text-gray-500">Use your personal Gmail account</p>
                </div>
              </div>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>• Send from your personal email address</li>
                <li>• Full Gmail integration and tracking</li>
                <li>• Respects your Gmail sending limits</li>
              </ul>
              <Button
                onClick={() => connectGmailMutation.mutate()}
                disabled={connectGmailMutation.isPending || connectingGmail}
                className="w-full"
              >
                {connectGmailMutation.isPending || connectingGmail ? (
                  "Connecting..."
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Connect Gmail
                  </>
                )}
              </Button>
            </div>

            {/* Platform-managed Account */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-6 w-6 text-blue-500" />
                <div>
                  <h4 className="font-medium">Platform Account</h4>
                  <p className="text-sm text-gray-500">Get a @xtendcreator.com address</p>
                </div>
              </div>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>• Professional outreach address</li>
                <li>• High-volume sending capability</li>
                <li>• Built-in authentication and tracking</li>
              </ul>
              <Button
                onClick={() => createPlatformAccountMutation.mutate()}
                disabled={createPlatformAccountMutation.isPending}
                variant="outline"
                className="w-full"
              >
                {createPlatformAccountMutation.isPending ? (
                  "Creating..."
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Create Platform Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Sending Info */}
      <Card>
        <CardHeader>
          <CardTitle>Email Sending Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Gmail Accounts</h4>
              <p className="text-gray-600">
                When you connect Gmail, emails are sent through your personal Gmail account using OAuth2. 
                Your Gmail credentials are securely stored and refreshed automatically.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Platform-Managed Accounts</h4>
              <p className="text-gray-600">
                Platform accounts use the authenticated domain em5483.xtendcreator.com for high-volume outreach. 
                These emails include professional branding and advanced tracking capabilities.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Primary Account</h4>
              <p className="text-gray-600">
                Your primary account is used by default for campaigns and outreach. You can change this at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for user edit dialog
  const [editingUser, setEditingUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // State for connect email dialog
  const [connectEmailDialogOpen, setConnectEmailDialogOpen] = useState(false);
  const [userToConnectEmail, setUserToConnectEmail] = useState(null);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    role: '',
    isActive: true
  });

  // User mutations
  const updateUserMutation = useMutation({
    mutationFn: (userData: any) => 
      fetch(`/api/admin/users/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setEditDialogOpen(false);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => 
      fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  });

  const resendInviteMutation = useMutation({
    mutationFn: (userId: string) => 
      fetch(`/api/admin/users/${userId}/resend-invite`, {
        method: 'POST'
      }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Welcome email sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send welcome email",
        variant: "destructive",
      });
    }
  });

  // Helper functions
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      role: user.role || '',
      isActive: user.isActive !== false
    });
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConnectEmail = (user: any) => {
    setUserToConnectEmail({
      id: user.id,
      fullName: user.first_name || user.last_name ? 
        `${user.first_name || ''} ${user.last_name || ''}`.trim() : 
        user.email || user.id,
      email: user.email
    });
    setConnectEmailDialogOpen(true);
  };

  const handleResendInvite = (user: any) => {
    resendInviteMutation.mutate(user.id);
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        ...editForm
      });
    }
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  // Mock current user for demonstration
  const currentUser = {
    id: 1,
    fullName: "Admin User",
    username: "admin",
    email: "admin@xtendcreators.com",
    role: "admin"
  };

  const isAdmin = currentUser?.role === 'admin';

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: {
      fullName: string;
      username: string;
      email: string;
      role: string;
      password: string;
    }) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to create user';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          // If response isn't JSON, use default message
        }
        throw new Error(errorMessage);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      } else {
        // If HTML response but status is OK, treat as success
        return { success: true };
      }
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Created",
        description: "New user has been created successfully and will receive a welcome email.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: apiKeys } = useQuery({
    queryKey: ['/api/settings/api-keys'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isAdmin,
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['/api/admin/audit-logs'],
    enabled: isAdmin,
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      // Mock API call
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const userData = {
      fullName: formData.get('newFullName') as string,
      username: formData.get('newUsername') as string,
      email: formData.get('newEmail') as string,
      role: formData.get('newRole') as string,
      password: formData.get('newPassword') as string,
    };

    try {
      await createUserMutation.mutateAsync(userData);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      // Mock API call
      toast({
        title: "API Keys Saved",
        description: "Your API keys have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API keys. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">Manage your account and system settings</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="email-accounts" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Accounts
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="user-management" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="audit-logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
          )}
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="space-y-6">
            {/* Current Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        name="fullName"
                        defaultValue={currentUser?.fullName}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        name="username"
                        defaultValue={currentUser?.username}
                        placeholder="Enter your username"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email"
                      defaultValue={currentUser?.email}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select name="role" defaultValue={currentUser?.role}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="creator">Creator</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit">Update Profile</Button>
                </form>
              </CardContent>
            </Card>

            {/* Create New User Section - Only for Admins */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Create New User
                  </CardTitle>
                  <CardDescription>
                    Add a new user account to the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newFullName">Full Name</Label>
                        <Input 
                          id="newFullName" 
                          name="newFullName"
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newUsername">Username</Label>
                        <Input 
                          id="newUsername" 
                          name="newUsername"
                          placeholder="Enter username"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newEmail">Email</Label>
                      <Input 
                        id="newEmail" 
                        name="newEmail"
                        type="email"
                        placeholder="Enter email address"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Password</Label>
                      <Input 
                        id="newPassword" 
                        name="newPassword"
                        type="password"
                        placeholder="Enter password"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newRole">Role</Label>
                      <Select name="newRole" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="creator">Creator</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" disabled={createUserMutation.isPending}>
                      {createUserMutation.isPending ? "Creating..." : "Create User"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Email Accounts Tab */}
        <TabsContent value="email-accounts">
          <EmailAccountsSection />
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Manage your API keys for external services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleApiKeySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openaiKey">OpenAI API Key</Label>
                  <Input 
                    id="openaiKey" 
                    type="password"
                    defaultValue={apiKeys?.openaiApiKey || ""}
                    placeholder="sk-proj-..."
                  />
                  <p className="text-sm text-gray-500">Used for AI-powered features and content generation</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleKey">Google Drive API Key (Optional)</Label>
                  <Input 
                    id="googleKey" 
                    type="password"
                    defaultValue={apiKeys?.googleApiKey || ""}
                    placeholder="AIza... (Leave blank if not using Google Drive integration)"
                  />
                  <p className="text-sm text-gray-500">Only needed if you want to integrate with Google Drive for creator file access</p>
                </div>

                <Button type="submit">Save API Keys</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        {isAdmin && (
          <TabsContent value="user-management">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map && users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name || user.last_name ? 
                            `${user.first_name || ''} ${user.last_name || ''}`.trim() : 
                            user.email || user.id}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'destructive'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.lastLogin || 'Never'}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Upload className="h-4 w-4 mr-2" />
                                Update Information
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleConnectEmail(user)}>
                                <Link className="h-4 w-4 mr-2" />
                                Connect Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResendInvite(user)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Resend Welcome Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Audit Logs Tab */}
        {isAdmin && (
          <TabsContent value="audit-logs">
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>
                  View system activity and security events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs?.map && auditLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.timestamp}</TableCell>
                        <TableCell>{log.userEmail}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.resource}</TableCell>
                        <TableCell>{log.ipAddress}</TableCell>
                        <TableCell>
                          <Badge variant={log.success ? 'default' : 'destructive'}>
                            {log.success ? 'Success' : 'Failed'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update User Information</DialogTitle>
            <DialogDescription>
              Make changes to the user's profile information here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={editForm.fullName}
                onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select 
                value={editForm.role} 
                onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="creator">Creator</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Active
              </Label>
              <Switch
                id="isActive"
                checked={editForm.isActive}
                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              for {userToDelete?.fullName || userToDelete?.email} and remove all their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Connect Email Dialog */}
      <ConnectEmailDialog
        isOpen={connectEmailDialogOpen}
        onClose={() => setConnectEmailDialogOpen(false)}
        user={userToConnectEmail}
      />
    </div>
  );
}