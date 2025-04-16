import React from 'react';
import { UserGrowthMetrics } from '../../../shared/api/analytics-api';

interface GrowthMetricsChartProps {
  metrics: UserGrowthMetrics | null;
}

export function GrowthMetricsChart({ metrics }: GrowthMetricsChartProps) {
  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Get the maximum value to normalize the chart
  const maxValue = Math.max(
    metrics.dailyNewUsers,
    metrics.weeklyNewUsers,
    metrics.monthlyNewUsers,
    metrics.totalUsers / 10 // Scale down total users to be comparable
  );

  // Bar chart colors
  const colors = {
    daily: 'bg-blue-500',
    weekly: 'bg-green-500',
    monthly: 'bg-purple-500',
    total: 'bg-amber-500'
  };

  return (
    <div className="w-full h-64 space-y-6">
      <div className="grid grid-cols-4 gap-2 h-52">
        {/* Daily New Users */}
        <div className="flex flex-col items-center justify-end">
          <div 
            className="w-16 data-bar relative"
            style={{ height: `${(metrics.dailyNewUsers / maxValue) * 100}%` }}
          >
            <div className={`absolute inset-0 ${colors.daily} rounded-t-md`}></div>
          </div>
          <span className="text-xs mt-2">Daily</span>
          <span className="text-xs font-bold">{metrics.dailyNewUsers}</span>
        </div>

        {/* Weekly New Users */}
        <div className="flex flex-col items-center justify-end">
          <div 
            className="w-16 data-bar relative"
            style={{ height: `${(metrics.weeklyNewUsers / maxValue) * 100}%` }}
          >
            <div className={`absolute inset-0 ${colors.weekly} rounded-t-md`}></div>
          </div>
          <span className="text-xs mt-2">Weekly</span>
          <span className="text-xs font-bold">{metrics.weeklyNewUsers}</span>
        </div>

        {/* Monthly New Users */}
        <div className="flex flex-col items-center justify-end">
          <div 
            className="w-16 data-bar relative"
            style={{ height: `${(metrics.monthlyNewUsers / maxValue) * 100}%` }}
          >
            <div className={`absolute inset-0 ${colors.monthly} rounded-t-md`}></div>
          </div>
          <span className="text-xs mt-2">Monthly</span>
          <span className="text-xs font-bold">{metrics.monthlyNewUsers}</span>
        </div>

        {/* Total Users */}
        <div className="flex flex-col items-center justify-end">
          <div 
            className="w-16 data-bar relative"
            style={{ height: `${((metrics.totalUsers / 10) / maxValue) * 100}%` }}
          >
            <div className={`absolute inset-0 ${colors.total} rounded-t-md`}></div>
          </div>
          <span className="text-xs mt-2">Total ÷ 10</span>
          <span className="text-xs font-bold">{metrics.totalUsers}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-4">
        <div className="flex items-center">
          <div className={`w-3 h-3 ${colors.daily} rounded-full mr-1`}></div>
          <span className="text-xs">Daily</span>
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 ${colors.weekly} rounded-full mr-1`}></div>
          <span className="text-xs">Weekly</span>
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 ${colors.monthly} rounded-full mr-1`}></div>
          <span className="text-xs">Monthly</span>
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 ${colors.total} rounded-full mr-1`}></div>
          <span className="text-xs">Total ÷ 10</span>
        </div>
      </div>
    </div>
  );
} 