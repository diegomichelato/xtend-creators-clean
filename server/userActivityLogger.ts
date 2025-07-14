import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface ActivityLogData {
  userId: number;
  actionType: string;
  metadata?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class UserActivityLogger {
  static async logActivity(data: ActivityLogData): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_activity_logs')
        .insert([{
          user_id: data.userId,
          action_type: data.actionType,
          metadata: data.metadata,
          ip_address: data.ipAddress,
          user_agent: data.userAgent,
          timestamp: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error logging user activity:', error);
      }
    } catch (error) {
      console.error('Failed to log user activity:', error);
    }
  }

  static async getUserActivities(userId: number, limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user activities:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch user activities:', error);
      return [];
    }
  }

  static async getAllActivities(limit: number = 100): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select(`
          *,
          users!inner(email)
        `)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching all activities:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch all activities:', error);
      return [];
    }
  }

  static async getActivityStats(days: number = 7): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('action_type, user_id')
        .gte('timestamp', startDate.toISOString());

      if (error) {
        console.error('Error fetching activity stats:', error);
        return {
          totalActions: 0,
          uniqueUsers: 0,
          topActions: []
        };
      }

      const activities = data || [];
      const uniqueUsers = new Set(activities.map(a => a.user_id)).size;
      const actionCounts = activities.reduce((acc, activity) => {
        acc[activity.action_type] = (acc[activity.action_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topActions = Object.entries(actionCounts)
        .map(([actionType, count]) => ({ actionType, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalActions: activities.length,
        uniqueUsers,
        topActions
      };
    } catch (error) {
      console.error('Failed to fetch activity stats:', error);
      return {
        totalActions: 0,
        uniqueUsers: 0,
        topActions: []
      };
    }
  }
}