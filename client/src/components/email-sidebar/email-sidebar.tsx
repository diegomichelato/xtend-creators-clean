import React, { useState } from 'react';
import { Mail, Plus, Inbox, Send, FileText, Archive, Clock, ChevronDown, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EmailAccountSwitcher } from './email-account-switcher';
import { EmailCompose } from './email-compose';
import { EmailThread } from './email-thread';
import { ConnectEmailModal } from './connect-email-modal';

interface EmailItem {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  isUnread: boolean;
  isImportant?: boolean;
  campaignTag?: string;
}

interface EmailFolder {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  emails: EmailItem[];
}

export function EmailSidebar() {
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);

  const folders: EmailFolder[] = [
    {
      id: 'inbox',
      name: 'Inbox',
      icon: Inbox,
      count: 0,
      emails: []
    },
    {
      id: 'sent',
      name: 'Sent',
      icon: Send,
      count: 0,
      emails: []
    },
    {
      id: 'drafts',
      name: 'Drafts',
      icon: FileText,
      count: 0,
      emails: []
    },
    {
      id: 'scheduled',
      name: 'Scheduled',
      icon: Clock,
      count: 0,
      emails: []
    },
    {
      id: 'archived',
      name: 'Archived',
      icon: Archive,
      count: 0,
      emails: []
    }
  ];

  const currentFolder = folders.find(f => f.id === selectedFolder);

  return (
    <>
      {/* Sidebar Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 shadow-lg"
        size="sm"
      >
        <Mail className="h-4 w-4" />
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 right-0 h-full bg-background border-l border-border transition-transform duration-300 z-40",
        isOpen ? "translate-x-0" : "translate-x-full",
        "w-96"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Email</h2>
              <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm">
                ×
              </Button>
            </div>
            
            {/* Email Account Switcher */}
            <EmailAccountSwitcher 
              accounts={connectedAccounts}
              onConnectEmail={() => setIsConnectModalOpen(true)}
            />
            
            {/* Compose Button */}
            <Button 
              onClick={() => setIsComposeOpen(true)}
              className="w-full mt-3"
              disabled={connectedAccounts.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </div>

          {/* Folders */}
          <div className="p-4 border-b border-border">
            <div className="space-y-1">
              {folders.map((folder) => {
                const Icon = folder.icon;
                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-md text-sm transition-colors",
                      selectedFolder === folder.id 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center">
                      <Icon className="h-4 w-4 mr-3" />
                      {folder.name}
                    </div>
                    {folder.count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {folder.count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email List */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {connectedAccounts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="mb-2">Connect your email account to get started</p>
                  <Button 
                    onClick={() => setIsConnectModalOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    Connect Email
                  </Button>
                </div>
              ) : currentFolder?.emails.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No emails in {currentFolder.name.toLowerCase()}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentFolder?.emails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted",
                        email.isUnread ? "bg-primary/5 border-primary/20" : "bg-background"
                      )}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center">
                          {email.isUnread && (
                            <Circle className="h-2 w-2 fill-primary text-primary mr-2 mt-1" />
                          )}
                          <span className={cn(
                            "text-sm",
                            email.isUnread ? "font-semibold" : "font-normal"
                          )}>
                            {email.sender}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {email.timestamp}
                        </span>
                      </div>
                      
                      <div className="mb-1">
                        <p className={cn(
                          "text-sm truncate",
                          email.isUnread ? "font-medium" : "font-normal"
                        )}>
                          {email.subject}
                        </p>
                      </div>
                      
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {email.preview}
                      </p>
                      
                      {email.campaignTag && (
                        <Badge variant="outline" className="text-xs">
                          {email.campaignTag}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Modals and Overlays */}
      <EmailCompose 
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        connectedAccounts={connectedAccounts}
      />
      
      <EmailThread
        email={selectedEmail}
        isOpen={!!selectedEmail}
        onClose={() => setSelectedEmail(null)}
      />
      
      <ConnectEmailModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onAccountConnected={(account) => {
          setConnectedAccounts(prev => [...prev, account]);
          setIsConnectModalOpen(false);
        }}
      />

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}