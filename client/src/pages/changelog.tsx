import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Settings, User, Mail, Edit, Calendar } from "lucide-react";
import { format } from "date-fns";

interface ChangelogEntry {
  id: string;
  timestamp: string;
  userId?: number;
  changeType: string;
  description: string;
  payload?: any;
  ipAddress?: string;
  userAgent?: string;
}

const getChangeTypeIcon = (changeType: string) => {
  switch (changeType) {
    case 'smtp_update':
      return <Mail className="h-4 w-4" />;
    case 'role_change':
      return <User className="h-4 w-4" />;
    case 'profile_update':
      return <Edit className="h-4 w-4" />;
    case 'api_key_update':
      return <Settings className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getChangeTypeBadge = (changeType: string) => {
  switch (changeType) {
    case 'smtp_update':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">SMTP</Badge>;
    case 'role_change':
      return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Role</Badge>;
    case 'profile_update':
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Profile</Badge>;
    case 'api_key_update':
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">API Key</Badge>;
    default:
      return <Badge variant="outline">{changeType}</Badge>;
  }
};

export default function ChangelogPage() {
  const { data: changelogEntries = [], isLoading } = useQuery<ChangelogEntry[]>({
    queryKey: ['/api/changelog'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-6 w-6" />
          <h1 className="text-2xl font-bold">System Activity Log</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">Loading changelog entries...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-6 w-6" />
        <h1 className="text-2xl font-bold">System Activity Log</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Changes</CardTitle>
          <CardDescription>
            Track all system modifications and user actions for audit purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {changelogEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No changelog entries found.</p>
              <p className="text-sm mt-2">Make some changes in Settings to see logging in action!</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {changelogEntries.map((entry, index) => (
                  <div key={entry.id} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border">
                        {getChangeTypeIcon(entry.changeType)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getChangeTypeBadge(entry.changeType)}
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(entry.timestamp), 'MMM d, yyyy • h:mm a')}
                          </span>
                        </div>
                        
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {entry.description}
                        </p>
                        
                        {entry.payload && (
                          <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 mt-2">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(entry.payload, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {entry.userId && (
                            <span>User ID: {entry.userId}</span>
                          )}
                          {entry.ipAddress && (
                            <span>IP: {entry.ipAddress}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {index < changelogEntries.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}