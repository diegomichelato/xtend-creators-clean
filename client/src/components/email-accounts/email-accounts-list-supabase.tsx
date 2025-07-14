import { useState } from "react";
import { useEmailAccounts, useDeleteEmailAccount } from "@/hooks/useEmailAccounts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Mail, Settings, Trash2, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import EmailAccountAddDialog from "./email-account-add-dialog-supabase";
import { useToast } from "@/hooks/use-toast";

export default function EmailAccountsList() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { data: emailAccounts = [], isLoading, error } = useEmailAccounts();
  const deleteEmailAccount = useDeleteEmailAccount();
  const { toast } = useToast();

  const handleDelete = async (accountId: string, accountName: string) => {
    if (window.confirm(`Are you sure you want to delete "${accountName}"? This action cannot be undone.`)) {
      try {
        await deleteEmailAccount.mutateAsync(accountId);
        toast({
          title: "Success",
          description: "Email account deleted successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete email account. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading email accounts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Failed to load email accounts</p>
          <p className="text-sm text-gray-500 mt-1">Please refresh the page to try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Accounts</h2>
          <p className="text-gray-600">
            Manage your connected email accounts for sending campaigns
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Email Account
        </Button>
      </div>

      {emailAccounts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle className="mb-2">No email accounts connected</CardTitle>
            <CardDescription className="mb-4">
              Connect your first email account to start sending campaigns
            </CardDescription>
            <Button onClick={() => setAddDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Email Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {emailAccounts.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <CardDescription>{account.email}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={account.status === "active" ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      {account.status === "active" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {account.status}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(account.id, account.name)}
                      disabled={deleteEmailAccount.isPending}
                    >
                      {deleteEmailAccount.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Provider</span>
                    <p className="font-medium capitalize">{account.provider}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Daily Limit</span>
                    <p className="font-medium">{account.daily_limit}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">SMTP Host</span>
                    <p className="font-medium">{account.smtp_host}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Added</span>
                    <p className="font-medium">
                      {formatDistanceToNow(new Date(account.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EmailAccountAddDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
      />
    </div>
  );
}