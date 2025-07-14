import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ConnectEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    fullName?: string;
    email: string;
  } | null;
}

interface EmailAccountOption {
  id: string;
  email: string;
  name: string;
  provider: string;
  status: string;
  user_id: string | null;
}

export function ConnectEmailDialog({ isOpen, onClose, user }: ConnectEmailDialogProps) {
  const [selectedEmailId, setSelectedEmailId] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all email accounts so you can reassign them
  const { data: availableAccounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['all-email-accounts-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_accounts')
        .select('id, email, name, provider, status, user_id')
        .eq('status', 'active');

      if (error) {
        throw new Error('Failed to fetch email accounts');
      }

      return data as EmailAccountOption[];
    },
    enabled: isOpen,
  });

  // Mutation to connect email account to user
  const connectEmailMutation = useMutation({
    mutationFn: async (emailAccountId: string) => {
      if (!user?.id) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('email_accounts')
        .update({ user_id: user.id })
        .eq('id', emailAccountId)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to connect email account to user');
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['all-email-accounts-for-assignment'] });
      
      toast({
        title: "Email Account Connected",
        description: `Successfully connected ${data.email} to ${user?.fullName || user?.email}`,
      });
      
      onClose();
      setSelectedEmailId('');
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect email account",
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    if (!selectedEmailId) {
      toast({
        title: "Selection Required",
        description: "Please select an email account to connect",
        variant: "destructive",
      });
      return;
    }

    connectEmailMutation.mutate(selectedEmailId);
  };

  const handleClose = () => {
    onClose();
    setSelectedEmailId('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Connect Email Account
          </DialogTitle>
          <DialogDescription>
            Connect an unassigned email account to {user?.fullName || user?.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoadingAccounts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading email accounts...</span>
            </div>
          ) : !availableAccounts || availableAccounts.length === 0 ? (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">No Email Accounts</p>
                <p className="text-sm text-yellow-600">No email accounts found in the system.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Email Account</label>
              <Select value={selectedEmailId} onValueChange={setSelectedEmailId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an email account..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <span className="font-medium">{account.email}</span>
                          <span className="text-sm text-gray-500">{account.name}</span>
                          {account.user_id && (
                            <span className="text-xs text-blue-600">Currently assigned</span>
                          )}
                          {!account.user_id && (
                            <span className="text-xs text-green-600">Unassigned</span>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {account.provider}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConnect}
            disabled={!selectedEmailId || connectEmailMutation.isPending || !availableAccounts?.length}
          >
            {connectEmailMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Connect Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}