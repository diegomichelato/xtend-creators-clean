import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Activity, Users, TrendingUp, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLog {
  id: number;
  userId: number;
  actionType: string;
  timestamp: string;
  metadata: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  userName?: string;
}

interface ActivityStats {
  totalActions: number;
  uniqueUsers: number;
  topActions: Array<{ actionType: string; count: number }>;
}

export default function AdminAnalytics() {
  const [filters, setFilters] = useState({
    actionType: '',
    startDate: '',
    endDate: '',
    limit: 50,
    offset: 0,
  });

  const { data: activityLogs = [], isLoading: logsLoading } = useQuery<ActivityLog[]>({
    queryKey: ['/api/admin/activity-logs', filters],
    enabled: true,
  });

  const { data: activityStats, isLoading: statsLoading } = useQuery<ActivityStats>({
    queryKey: ['/api/admin/activity-stats', { 
      startDate: filters.startDate, 
      endDate: filters.endDate 
    }],
    enabled: true,
  });

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
  };

  const resetFilters = () => {
    setFilters({
      actionType: '',
      startDate: '',
      endDate: '',
      limit: 50,
      offset: 0,
    });
  };

  const formatMetadata = (metadata: string | null) => {
    if (!metadata) return null;
    try {
      const parsed = JSON.parse(metadata);
      return Object.entries(parsed).map(([key, value]) => (
        <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded mr-1">
          {key}: {String(value)}
        </span>
      ));
    } catch {
      return <span className="text-xs text-gray-500">{metadata}</span>;
    }
  };

  const getActionTypeColor = (actionType: string) => {
    const colors: Record<string, string> = {
      login: 'bg-green-100 text-green-800',
      logout: 'bg-gray-100 text-gray-800',
      create_campaign: 'bg-blue-100 text-blue-800',
      import_contacts: 'bg-purple-100 text-purple-800',
      connect_email_account: 'bg-yellow-100 text-yellow-800',
      send_email: 'bg-orange-100 text-orange-800',
      page_view: 'bg-gray-50 text-gray-600',
    };
    return colors[actionType] || 'bg-gray-100 text-gray-800';
  };

  if (statsLoading || logsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Analytics</h1>
        <p className="text-gray-600">Monitor user activity and platform engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats?.totalActions?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">All user activities tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats?.uniqueUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Unique users with activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Action</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityStats?.topActions?.[0]?.actionType?.replace(/_/g, ' ') || 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              {activityStats?.topActions?.[0]?.count || 0} occurrences
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Actions */}
      {activityStats?.topActions && activityStats.topActions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Most Popular Actions</CardTitle>
            <CardDescription>Actions performed most frequently by users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {activityStats.topActions.slice(0, 10).map((action, index) => (
                <div key={action.actionType} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{action.count}</div>
                  <div className="text-sm text-gray-600 capitalize">
                    {action.actionType.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Activity Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Action Type</label>
              <Select value={filters.actionType} onValueChange={(value) => handleFilterChange('actionType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="create_campaign">Create Campaign</SelectItem>
                  <SelectItem value="import_contacts">Import Contacts</SelectItem>
                  <SelectItem value="connect_email_account">Connect Email</SelectItem>
                  <SelectItem value="send_email">Send Email</SelectItem>
                  <SelectItem value="page_view">Page View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Results</label>
              <Select value={filters.limit.toString()} onValueChange={(value) => handleFilterChange('limit', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 results</SelectItem>
                  <SelectItem value="50">50 results</SelectItem>
                  <SelectItem value="100">100 results</SelectItem>
                  <SelectItem value="200">200 results</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={resetFilters} variant="outline" size="sm">
            Reset Filters
          </Button>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Showing {activityLogs.length} recent user activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No activity logs found for the selected filters
              </div>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className={getActionTypeColor(log.actionType)}>
                        {log.actionType.replace(/_/g, ' ')}
                      </Badge>
                      <span className="font-medium">
                        User: {log.userName || `ID ${log.userId}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                    </div>
                  </div>

                  {log.metadata && (
                    <div className="mb-2">
                      <div className="text-sm text-gray-600 mb-1">Details:</div>
                      <div className="flex flex-wrap gap-1">
                        {formatMetadata(log.metadata)}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                    {log.ipAddress && (
                      <div>
                        <span className="font-medium">IP:</span> {log.ipAddress}
                      </div>
                    )}
                    {log.userAgent && (
                      <div className="truncate">
                        <span className="font-medium">User Agent:</span> {log.userAgent}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {activityLogs.length > 0 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleFilterChange('offset', Math.max(0, filters.offset - filters.limit))}
                disabled={filters.offset === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => handleFilterChange('offset', filters.offset + filters.limit)}
                disabled={activityLogs.length < filters.limit}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}