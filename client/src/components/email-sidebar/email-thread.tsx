import React, { useState } from 'react';
import { X, Reply, ReplyAll, Forward, Archive, Star, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

interface EmailThreadProps {
  email: EmailItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmailThread({ email, isOpen, onClose }: EmailThreadProps) {
  const [isStarred, setIsStarred] = useState(false);

  if (!email) return null;

  // Mock email content - will be replaced with real API data
  const emailContent = {
    ...email,
    fullBody: `Hi there,

I hope this email finds you well. I'm reaching out regarding a potential collaboration opportunity with your creator network.

We're a growing brand in the lifestyle space and are looking to partner with authentic creators who align with our values. After reviewing your creator roster, we believe there could be a great fit for a long-term partnership.

Would you be available for a brief call this week to discuss potential collaboration opportunities? I'd love to learn more about your creators and share how we could work together.

Looking forward to hearing from you!

Best regards,
${email.sender}`,
    attachments: [],
    isRead: !email.isUnread
  };

  const handleReply = () => {
    console.log('Opening reply composer for:', email.id);
    // This would open the compose modal with pre-filled reply data
  };

  const handleArchive = () => {
    console.log('Archiving email:', email.id);
    // This would move the email to archived folder
    onClose();
  };

  const markAsImportant = () => {
    console.log('Marking email as important:', email.id);
    setIsStarred(!isStarred);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">{email.subject}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Email metadata */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {email.sender.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{email.sender}</p>
                <p>to me</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>{email.timestamp}</span>
              {email.campaignTag && (
                <Badge variant="outline" className="text-xs">
                  {email.campaignTag}
                </Badge>
              )}
              {email.isImportant && (
                <Badge variant="destructive" className="text-xs">
                  Priority
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Email content */}
        <ScrollArea className="flex-1 max-h-[500px]">
          <div className="p-6 space-y-4">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {emailContent.fullBody}
            </div>
            
            {emailContent.attachments && emailContent.attachments.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Attachments</h4>
                <div className="space-y-2">
                  {emailContent.attachments.map((attachment: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span>{attachment.name}</span>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Action buttons */}
        <div className="flex items-center justify-between p-4 bg-muted/50">
          <div className="flex gap-2">
            <Button onClick={handleReply} size="sm">
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
            <Button variant="outline" size="sm">
              <ReplyAll className="h-4 w-4 mr-2" />
              Reply All
            </Button>
            <Button variant="outline" size="sm">
              <Forward className="h-4 w-4 mr-2" />
              Forward
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAsImportant}
              className={isStarred ? "text-yellow-500" : ""}
            >
              <Star className={`h-4 w-4 ${isStarred ? "fill-current" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleArchive}>
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}