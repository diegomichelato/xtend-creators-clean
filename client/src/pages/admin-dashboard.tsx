import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, 
  Shield, 
  Activity, 
  Settings, 
  Crown, 
  User,
  UserCheck,
  Eye,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'user' | 'creator' | 'admin';
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive';
}

interface UserPermissions {
  userId: string;
  canAccessCampaigns: boolean;
  canAccessInbox: boolean;
  canAccessCreators: boolean;
  canAccessContacts: boolean;
  canAccessAnalytics: boolean;
}

interface ActivityLog {
  id: number;
  userId: string;
  actionType: string;
  timestamp: string;
  metadata: string | null;
  ipAddress: string | null;
  userName?: string;
}

export default function AdminDashboard() {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  // Fetch user permissions
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery<UserPermissions[]>({
    queryKey: ['/api/admin/permissions'],
  });

  // Activity log filters
  const [activityFilters, setActivityFilters] = useState({
    userId: '',
    actionType: '',
    startDate: '',
    endDate: '',
    limit: 50,
  });

  // Fetch recent activity with filters
  const { data: recentActivity = [], isLoading: activityLoading } = useQuery<ActivityLog[]>({
    queryKey: ['/api/admin/activity-logs', activityFilters],
  });

  // Role update mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${userId}/role`, { role: newRole });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Role Updated",
        description: "User role has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Permission update mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ userId, permissions }: { userId: string; permissions: Partial<UserPermissions> }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${userId}/permissions`, permissions);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/permissions'] });
      toast({
        title: "Permissions Updated",
        description: "User permissions have been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update user permissions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'creator':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'creator':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, newRole });
  };

  const handlePermissionToggle = (userId: string, permission: keyof UserPermissions, value: boolean) => {
    updatePermissionsMutation.mutate({ 
      userId, 
      permissions: { [permission]: value } 
    });
  };

  const selectedUserPermissions = permissions.find(p => p.userId === selectedUser);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, roles, and permissions across the platform</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Creators</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'creator').length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                  <p className="text-3xl font-bold text-gray-900">{recentActivity.length}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  View and manage user roles across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getRoleIcon(user.role)}
                              <div>
                                <p className="font-medium">{user.fullName || user.username}</p>
                                <p className="text-sm text-gray-500">@{user.username}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(value) => handleRoleChange(user.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="creator">Creator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    User Selection
                  </CardTitle>
                  <CardDescription>
                    Select a user to manage their permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.fullName || user.username} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {selectedUser && selectedUserPermissions && (
                <Card>
                  <CardHeader>
                    <CardTitle>Module Permissions</CardTitle>
                    <CardDescription>
                      Toggle access to different platform modules
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: 'canAccessCampaigns', label: 'Campaigns', icon: '📧' },
                      { key: 'canAccessInbox', label: 'Inbox', icon: '📥' },
                      { key: 'canAccessCreators', label: 'Creators', icon: '👥' },
                      { key: 'canAccessContacts', label: 'Contacts', icon: '📋' },
                      { key: 'canAccessAnalytics', label: 'Analytics', icon: '📊' },
                    ].map((permission) => (
                      <div key={permission.key} className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <span>{permission.icon}</span>
                          {permission.label}
                        </Label>
                        <Switch
                          checked={selectedUserPermissions[permission.key as keyof UserPermissions] as boolean}
                          onCheckedChange={(checked) => 
                            handlePermissionToggle(selectedUser, permission.key as keyof UserPermissions, checked)
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="activity">
            <div className="space-y-6">
              {/* Activity Log Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activity Log Filters
                  </CardTitle>
                  <CardDescription>
                    Filter and search user activities across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="user-filter">User</Label>
                      <Select 
                        value={activityFilters.userId} 
                        onValueChange={(value) => setActivityFilters(prev => ({ ...prev, userId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All users" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All users</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.fullName || user.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="action-filter">Action Type</Label>
                      <Select 
                        value={activityFilters.actionType} 
                        onValueChange={(value) => setActivityFilters(prev => ({ ...prev, actionType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All actions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All actions</SelectItem>
                          <SelectItem value="login">Login</SelectItem>
                          <SelectItem value="logout">Logout</SelectItem>
                          <SelectItem value="create_campaign">Create Campaign</SelectItem>
                          <SelectItem value="send_email">Send Email</SelectItem>
                          <SelectItem value="add_contact">Add Contact</SelectItem>
                          <SelectItem value="role_change">Role Change</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input 
                        type="date" 
                        value={activityFilters.startDate}
                        onChange={(e) => setActivityFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <Input 
                        type="date" 
                        value={activityFilters.endDate}
                        onChange={(e) => setActivityFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>

                    <div className="flex items-end">
                      <Button 
                        onClick={() => setActivityFilters({ userId: '', actionType: '', startDate: '', endDate: '', limit: 50 })}
                        variant="outline" 
                        className="w-full"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>
                    Showing {recentActivity.length} activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="text-center py-8">Loading activity...</div>
                  ) : recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No activities found for the selected filters.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={activity.id} className="relative">
                          {/* Timeline connector */}
                          {index !== recentActivity.length - 1 && (
                            <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-200"></div>
                          )}
                          
                          <div className="flex items-start gap-4 p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {activity.actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    by {activity.userName || 'Unknown User'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">
                                    {format(new Date(activity.timestamp), 'MMM dd, yyyy')}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {format(new Date(activity.timestamp), 'HH:mm:ss')}
                                  </p>
                                </div>
                              </div>
                              
                              {activity.metadata && (
                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                                  <strong>Details:</strong> {activity.metadata}
                                </div>
                              )}
                              
                              {activity.ipAddress && (
                                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                                  <span>IP:</span>
                                  <code className="bg-gray-100 px-1 rounded">{activity.ipAddress}</code>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}