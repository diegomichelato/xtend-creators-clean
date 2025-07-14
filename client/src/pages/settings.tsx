import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Users, Mail, FileText, Settings2, TestTube } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const profileFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  role: z.enum(["admin", "creator", "user"]).optional(),
});

const apiKeyFormSchema = z.object({
  openaiApiKey: z.string().optional(),
  googleApiKey: z.string().optional(),
});

const smtpConfigSchema = z.object({
  smtpHost: z.string().min(1, "SMTP host is required"),
  smtpPort: z.number().min(1, "Port must be a positive number"),
  smtpUsername: z.string().min(1, "Username is required"),
  smtpPassword: z.string().min(1, "Password is required"),
  useTls: z.boolean().default(true),
  fromName: z.string().min(1, "From name is required"),
  fromEmail: z.string().email("Valid email is required"),
});

const userManagementSchema = z.object({
  userId: z.number(),
  role: z.enum(["admin", "creator", "user"]),
  allowedTabs: z.array(z.string()),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>;
type SmtpConfigValues = z.infer<typeof smtpConfigSchema>;
type UserManagementValues = z.infer<typeof userManagementSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/users/me'],
  });

  const { data: apiKeys, isLoading: isLoadingApiKeys } = useQuery({
    queryKey: ['/api/settings/api-keys'],
  });

  const { data: smtpConfig, isLoading: isLoadingSmtp } = useQuery({
    queryKey: ['/api/settings/smtp'],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const { data: auditLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['/api/admin/audit-logs'],
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      role: "user" as const,
    },
    values: profile ? {
      fullName: profile.fullName || "",
      email: profile.email || "",
      username: profile.username || "",
      role: profile.role || "user" as const,
    } : undefined,
  });

  const apiKeyForm = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      openaiApiKey: "",
      googleApiKey: "",
    },
    values: apiKeys,
  });

  const smtpForm = useForm<SmtpConfigValues>({
    resolver: zodResolver(smtpConfigSchema),
    defaultValues: {
      smtpHost: "",
      smtpPort: 587,
      smtpUsername: "",
      smtpPassword: "",
      useTls: true,
      fromName: "",
      fromEmail: "",
    },
    values: smtpConfig ? {
      smtpHost: smtpConfig.smtpHost || "",
      smtpPort: smtpConfig.smtpPort || 587,
      smtpUsername: smtpConfig.smtpUsername || "",
      smtpPassword: smtpConfig.smtpPassword || "",
      useTls: smtpConfig.useTls !== undefined ? smtpConfig.useTls : true,
      fromName: smtpConfig.fromName || "",
      fromEmail: smtpConfig.fromEmail || "",
    } : undefined,
  });

  async function onProfileSubmit(values: ProfileFormValues) {
    try {
      await apiRequest("PATCH", "/api/users/me", values);
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      toast({
        title: "Profile updated",
        description: "Your profile was successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function onApiKeySubmit(values: ApiKeyFormValues) {
    try {
      await apiRequest("PATCH", "/api/settings/api-keys", values);
      queryClient.invalidateQueries({ queryKey: ['/api/settings/api-keys'] });
      toast({
        title: "API keys updated",
        description: "Your API keys were successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update API keys. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function onSmtpSubmit(values: SmtpConfigValues) {
    try {
      await apiRequest("PATCH", "/api/settings/smtp", values);
      queryClient.invalidateQueries({ queryKey: ['/api/settings/smtp'] });
      toast({
        title: "SMTP configuration updated",
        description: "Your SMTP settings were successfully saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update SMTP configuration. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function testSmtpConnection() {
    setIsTestingSmtp(true);
    try {
      const values = smtpForm.getValues();
      const response = await apiRequest("POST", "/api/settings/smtp/test", values);
      toast({
        title: "SMTP test successful",
        description: "Connection to SMTP server was successful.",
      });
    } catch (error) {
      toast({
        title: "SMTP test failed",
        description: "Could not connect to SMTP server. Please check your settings.",
        variant: "destructive",
      });
    } finally {
      setIsTestingSmtp(false);
    }
  }

  async function updateUserRole(userId: number, newRole: string) {
    try {
      await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role: newRole });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User role updated",
        description: "User role was successfully changed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Check if user is admin
  const isAdmin = profile?.role === 'admin';

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">Manage your account and API settings</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="smtp" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            SMTP Config
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
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProfile ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="mt-4">Save Changes</Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage API keys for external services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingApiKeys ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Form {...apiKeyForm}>
                  <form onSubmit={apiKeyForm.handleSubmit(onApiKeySubmit)} className="space-y-4">
                    <FormField
                      control={apiKeyForm.control}
                      name="openaiApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OpenAI API Key</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="sk-..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Required for generating AI emails with ChatGPT
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={apiKeyForm.control}
                      name="googleApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Drive API Key</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="AIza..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Required for accessing creator files on Google Drive
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="mt-4">Save API Keys</Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>
                Configure SMTP settings for sending emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSmtp ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Form {...smtpForm}>
                  <form onSubmit={smtpForm.handleSubmit(onSmtpSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={smtpForm.control}
                        name="smtpHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Host</FormLabel>
                            <FormControl>
                              <Input placeholder="smtp.gmail.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={smtpForm.control}
                        name="smtpPort"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Port</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="587" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={smtpForm.control}
                        name="smtpUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="your-email@gmail.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={smtpForm.control}
                        name="smtpPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password/App Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={smtpForm.control}
                        name="fromName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Company Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={smtpForm.control}
                        name="fromEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Email</FormLabel>
                            <FormControl>
                              <Input placeholder="noreply@yourcompany.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={smtpForm.control}
                      name="useTls"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Use TLS/SSL</FormLabel>
                            <FormDescription>
                              Enable secure connection to SMTP server
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 pt-4">
                      <Button type="submit">Save SMTP Configuration</Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={testSmtpConnection}
                        disabled={isTestingSmtp}
                        className="flex items-center gap-2"
                      >
                        {isTestingSmtp ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                        Test Connection
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                {isLoadingUsers ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.fullName || user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : user.role === 'creator' ? 'secondary' : 'outline'}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">Active</Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={user.role}
                                onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="creator">Creator</SelectItem>
                                  <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="audit-logs">
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>
                  View system activity and user actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLogs ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>IP Address</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs?.map((log: any) => (
                          <TableRow key={log.id}>
                            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                            <TableCell>{log.user?.fullName || log.user?.username || 'System'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.action}</Badge>
                            </TableCell>
                            <TableCell>{log.target}</TableCell>
                            <TableCell>
                              <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                {log.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {(!auditLogs || auditLogs.length === 0) && (
                      <div className="text-center py-12 text-muted-foreground">
                        No audit logs found
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
