import React, { useState } from 'react';
import { X, Send, Clock, Save, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface EmailComposeProps {
  isOpen: boolean;
  onClose: () => void;
  connectedAccounts: string[];
  userId: string;
}

export function EmailCompose({ isOpen, onClose, connectedAccounts, userId }: EmailComposeProps) {
  const [formData, setFormData] = useState({
    from: connectedAccounts[0] || '',
    to: '',
    subject: '',
    body: '',
    campaignTag: '',
    contactType: ''
  });

  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');

  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!formData.to || !formData.subject || !formData.body) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    try {
      console.log('📧 Sending email via Gmail API for user:', userId);
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          to_address: formData.to,
          subject: formData.subject,
          body: formData.body,
          campaign_id: formData.campaignTag || null,
          use_gmail: true // Use Gmail API by default
        })
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        console.log('✅ Email sent successfully via Gmail API');
        alert('Email sent successfully!');
        
        // Reset form
        setFormData({
          from: connectedAccounts[0] || '',
          to: '',
          subject: '',
          body: '',
          campaignTag: '',
          contactType: ''
        });
        
        onClose();
      } else {
        throw new Error(result.message || 'Failed to send email');
      }
      
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      alert(`Failed to send email: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = async () => {
    console.log('Saving draft:', formData);
    // await saveDraft(formData);
    onClose();
  };

  const handleSchedule = async () => {
    if (!scheduledDate) return;
    console.log('Scheduling email:', { ...formData, scheduledDate });
    // await scheduleEmail({ ...formData, scheduledDate });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* From Field */}
          <div>
            <Label htmlFor="from">From</Label>
            <Select value={formData.from} onValueChange={(value) => setFormData(prev => ({ ...prev, from: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select email account" />
              </SelectTrigger>
              <SelectContent>
                {connectedAccounts.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To Field */}
          <div>
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="email"
              placeholder="recipient@example.com"
              value={formData.to}
              onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
            />
          </div>

          {/* Subject Field */}
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          {/* Tagging Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="campaignTag">Campaign Tag</Label>
              <Input
                id="campaignTag"
                placeholder="Campaign name"
                value={formData.campaignTag}
                onChange={(e) => setFormData(prev => ({ ...prev, campaignTag: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="contactType">Contact Type</Label>
              <Select value={formData.contactType} onValueChange={(value) => setFormData(prev => ({ ...prev, contactType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brand">Brand</SelectItem>
                  <SelectItem value="Agency">Agency</SelectItem>
                  <SelectItem value="Creator">Creator</SelectItem>
                  <SelectItem value="Priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Body Field */}
          <div>
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              placeholder="Type your message here..."
              className="min-h-[200px]"
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
            />
          </div>

          {/* Scheduling */}
          {isScheduling && (
            <div>
              <Label htmlFor="scheduledDate">Schedule for</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
          )}

          {/* Tags Display */}
          {(formData.campaignTag || formData.contactType) && (
            <div className="flex gap-2">
              {formData.campaignTag && (
                <Badge variant="outline">
                  <Tag className="h-3 w-3 mr-1" />
                  {formData.campaignTag}
                </Badge>
              )}
              {formData.contactType && (
                <Badge variant={formData.contactType === 'Priority' ? 'destructive' : 'secondary'}>
                  {formData.contactType}
                </Badge>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSend} disabled={isSending} className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              {isSending ? 'Sending...' : 'Send via Gmail'}
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsScheduling(!isScheduling)}
            >
              <Clock className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            {isScheduling && (
              <Button onClick={handleSchedule} disabled={!scheduledDate}>
                Schedule Send
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}