import React, { useState, useEffect } from 'react';
import { Mail, Plus, Inbox, Send, FileText, Archive, Clock, ChevronDown, Circle, Search, Filter, User, Users, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmailCompose } from '@/components/email-sidebar/email-compose';
import { EmailThread } from '@/components/email-sidebar/email-thread';
import { ConnectEmailModal } from '@/components/email-sidebar/connect-email-modal';
import { GmailOAuthButton } from '@/components/gmail-oauth-button';
import { supabase } from '@/lib/supabase';

interface EmailItem {
  id: string;
  user_id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  received_at: string;
  is_read: boolean;
  folder: string;
  email_account_id?: string;
  campaign_id?: string;
  created_at: string;
}

interface EmailFolder {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  emails: EmailItem[];
}

export default function InboxPage() {
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [accountType, setAccountType] = useState<'users' | 'creators'>('users');
  const [inboxEmails, setInboxEmails] = useState<EmailItem[]>([]);
  const [userEmailAccounts, setUserEmailAccounts] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Function to refresh platform emails
  async function refreshPlatformEmails() {
    setIsSyncing(true);
    try {
      console.log("🔄 Refreshing platform emails...");
      // Just refresh the current user's emails from our database
      if (selectedUser?.id) {
        await fetchInboxEmails(selectedUser.id);
        console.log("✅ Platform emails refreshed");
      }
    } catch (error) {
      console.error("❌ Email refresh error:", error);
    } finally {
      setIsSyncing(false);
    }
  }

  // Function to fetch inbox emails
  async function fetchInboxEmails(userId: string) {
    console.log("🔍 Searching for emails with user_id:", userId);
    
    // First, let's see ALL emails to debug
    const { data: allEmails } = await supabase.from('emails').select('user_id, subject');
    console.log("📋 All emails in database:", allEmails);
    
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('user_id', userId)
      .order('received_at', { ascending: false });

    if (error) {
      console.error("❌ Inbox fetch failed:", error);
      setInboxEmails([]);
    } else {
      console.log("✅ Inbox loaded:", data);
      console.log("📬 Total emails found:", data?.length || 0);
      setInboxEmails(data || []);
    }
  }

  // Fetch emails when user is selected AND has email accounts
  useEffect(() => {
    if (selectedUser?.id && userEmailAccounts.length > 0) {
      console.log("🔍 Fetching emails for user with email accounts:", selectedUser.id);
      fetchInboxEmails(selectedUser.id);
    } else {
      setInboxEmails([]);
    }
  }, [selectedUser?.id, userEmailAccounts.length]);

  // Fetch users from backend API (bypasses RLS issues)
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: accountType === 'users',
    onSuccess: (data) => {
      console.log("📥 Fetched users:", data);
    }
  });

  // Fetch creators from backend API
  const { data: creators = [], isLoading: isLoadingCreators } = useQuery({
    queryKey: ['/api/creators'],
    enabled: accountType === 'creators'
  });

  // Check for connected email accounts in Supabase
  useEffect(() => {
    if (selectedUser?.id) {
      supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', selectedUser.id)
        .then(({ data, error }) => {
          if (error) {
            console.error("❌ Error checking email accounts:", error);
            setUserEmailAccounts([]);
          } else {
            console.log("📧 Found email accounts for user:", selectedUser.id, data);
            setUserEmailAccounts(data || []);
          }
        });
    } else {
      setUserEmailAccounts([]);
    }
  }, [selectedUser?.id]);

  // Use the direct inboxEmails state from useEffect

  // Organize emails by direction and folder from Supabase data
  const inboxEmailsFiltered = inboxEmails.filter(email => 
    (email.direction === 'received' || !email.direction) && 
    (email.folder === 'inbox' || !email.folder)
  );
  const sentEmails = inboxEmails.filter(email => 
    email.direction === 'sent' || email.folder === 'sent'
  );
  const draftEmails = inboxEmails.filter(email => email.folder === 'drafts');
  const scheduledEmails = inboxEmails.filter(email => email.folder === 'scheduled');
  const archivedEmails = inboxEmails.filter(email => email.folder === 'archived');

  const folders: EmailFolder[] = [
    {
      id: 'inbox',
      name: 'Inbox',
      icon: Inbox,
      count: inboxEmailsFiltered.length,
      emails: inboxEmailsFiltered
    },
    {
      id: 'sent',
      name: 'Sent',
      icon: Send,
      count: sentEmails.length,
      emails: sentEmails
    },
    {
      id: 'drafts',
      name: 'Drafts',
      icon: FileText,
      count: draftEmails.length,
      emails: draftEmails
    },
    {
      id: 'scheduled',
      name: 'Scheduled',
      icon: Clock,
      count: scheduledEmails.length,
      emails: scheduledEmails
    },
    {
      id: 'archived',
      name: 'Archived',
      icon: Archive,
      count: archivedEmails.length,
      emails: archivedEmails
    }
  ];

  const currentFolder = folders.find(f => f.id === selectedFolder);
  const currentList = accountType === 'users' ? users : creators;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Email Inbox</h1>
          <p className="text-muted-foreground">Manage email communications for users and creators</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsComposeOpen(true)} disabled={!selectedUser}>
            <Plus className="h-4 w-4 mr-2" />
            Compose
          </Button>
          <Button variant="outline" onClick={() => setIsConnectModalOpen(true)} disabled={!selectedUser}>
            <Mail className="h-4 w-4 mr-2" />
            Connect Email
          </Button>
        </div>
      </div>

      {/* User/Creator Selection */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Account Owner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant={accountType === 'users' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setAccountType('users');
                    setSelectedUser(null);
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Users
                </Button>
                <Button
                  variant={accountType === 'creators' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setAccountType('creators');
                    setSelectedUser(null);
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Creators
                </Button>
              </div>
              
              <select 
                className="min-w-[200px] px-3 py-2 border border-gray-300 rounded-md bg-white"
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedItem = currentList.find((item: any) => item.id === selectedId);
                  setSelectedUser(selectedItem || null);
                }}
                value={selectedUser?.id || ""}
              >
                <option value="">Select {accountType.slice(0, -1)}</option>
                {currentList.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.full_name || item.name || item.email || `${accountType.slice(0, -1)} ${item.id}`}
                  </option>
                ))}
              </select>

              {selectedUser && userEmailAccounts.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {userEmailAccounts.length} email account{userEmailAccounts.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Email Folders */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Folders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {folders.map((folder) => {
                  const Icon = folder.icon;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 text-left hover:bg-muted transition-colors",
                        selectedFolder === folder.id ? "bg-primary/10 text-primary border-r-2 border-primary" : ""
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{folder.name}</span>
                      </div>
                      {folder.count > 0 && (
                        <Badge variant={selectedFolder === folder.id ? "default" : "secondary"} className="text-xs">
                          {folder.count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email List */}
        <div className="col-span-5">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {currentFolder && (
                    <>
                      <currentFolder.icon className="h-5 w-5" />
                      {currentFolder.name}
                    </>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search emails..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                  
                  {/* Gmail OAuth Connection */}
                  {selectedUser && (
                    <GmailOAuthButton 
                      userId={selectedUser} 
                      onConnected={(email) => {
                        console.log(`Gmail connected: ${email}`);
                        refreshPlatformEmails();
                      }}
                    />
                  )}
                  
                  {/* Refresh Platform Emails Button */}
                  <Button 
                    onClick={refreshPlatformEmails}
                    disabled={isSyncing || !selectedUser}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", isSyncing && "animate-spin")} />
                    {isSyncing ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-320px)]">
                {!selectedUser ? (
                  <div className="text-center text-muted-foreground py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-semibold mb-2">Select Account Owner</h3>
                    <p className="mb-4">Choose a user or creator to view their email inbox</p>
                  </div>
                ) : userEmailAccounts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-semibold mb-2">No Email Account Connected</h3>
                    <p className="mb-4">This user has no connected email account.</p>
                    <Button onClick={() => setIsConnectModalOpen(true)} className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Email Now
                    </Button>
                  </div>
                ) : inboxEmails.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No emails in inbox</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {inboxEmails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => setSelectedEmail(email)}
                        className={cn(
                          "p-4 cursor-pointer transition-colors hover:bg-muted",
                          !email.is_read ? "bg-primary/5" : "bg-background",
                          selectedEmail?.id === email.id ? "bg-muted" : ""
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {!email.is_read && (
                              <Circle className="h-2 w-2 fill-primary text-primary" />
                            )}
                            <span className={cn(
                              "font-medium",
                              !email.is_read ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {email.from_address}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {email.campaign_id && (
                              <Badge variant="outline" className="text-xs">
                                Campaign
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(email.received_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="mb-1">
                          <span className={cn(
                            "text-sm",
                            !email.is_read ? "font-semibold" : "font-normal"
                          )}>
                            {email.subject}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {email.body ? email.body.substring(0, 100) + '...' : 'No preview available'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Email Content */}
        <div className="col-span-4">
          <Card className="h-full">
            {selectedEmail ? (
              <div className="h-full flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedEmail.subject}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        From: {selectedEmail.sender}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        To: {selectedEmail.recipient}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">
                        {new Date(selectedEmail.received_at).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {!selectedEmail.is_read && (
                        <div className="mt-1">
                          <Badge variant="default" className="text-xs">Unread</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                  <ScrollArea className="h-full">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap">
                        {selectedEmail.body}
                      </div>
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2 mt-6 pt-4 border-t">
                    <Button size="sm">
                      Reply
                    </Button>
                    <Button variant="outline" size="sm">
                      Forward
                    </Button>
                    <Button variant="outline" size="sm">
                      Archive
                    </Button>
                  </div>
                </CardContent>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an email to view its content</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modals */}
      <EmailCompose 
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        connectedAccounts={connectedAccounts}
      />
      
      <EmailThread
        email={selectedEmail}
        isOpen={false}
        onClose={() => setSelectedEmail(null)}
      />
      
      <ConnectEmailModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        selectedUserId={selectedUser?.id}
        onAccountConnected={(account: string) => {
          setConnectedAccounts(prev => [...prev, account]);
          setIsConnectModalOpen(false);
          // Auto-refresh the inbox view for the selected user
          if (selectedUser?.id) {
            supabase
              .from('emails')
              .select('*')
              .eq('user_id', selectedUser.id)
              .order('received_at', { ascending: false })
              .then(({ data, error }) => {
                if (!error) {
                  setInboxEmails(data || []);
                }
              });
          }
        }}
      />
    </div>
  );
}