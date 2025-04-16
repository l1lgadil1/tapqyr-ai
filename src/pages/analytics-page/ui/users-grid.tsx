import React from 'react';
import { TodoCompletionRate } from '../../../shared/api/analytics-api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { User, CheckSquare, Clock } from 'lucide-react';

interface UsersGridProps {
  users: TodoCompletionRate[];
  loading?: boolean;
}

export function UsersGrid({ users, loading = false }: UsersGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No user data available</p>
      </div>
    );
  }

  // Sort users by completion rate, highest first
  const sortedUsers = [...users].sort((a, b) => b.completionRate - a.completionRate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedUsers.map((user, index) => (
        <Card key={user.userId} className="border-primary/10 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {user.userName || user.userEmail || `User ${index + 1}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Completion Rate */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <CheckSquare className="h-4 w-4 text-green-500" />
                    <span className="text-xs">Completion Rate</span>
                  </div>
                  <span className="text-xs font-bold">{(user.completionRate * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-secondary/30 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${user.completionRate * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Task Counts */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                  <div className="flex items-center gap-1">
                    <CheckSquare className="h-4 w-4 text-green-500" />
                    <span className="text-xs">Completed</span>
                  </div>
                  <span className="text-xs font-bold">{user.completedCount}</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-xs">Total</span>
                  </div>
                  <span className="text-xs font-bold">{user.totalCount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 