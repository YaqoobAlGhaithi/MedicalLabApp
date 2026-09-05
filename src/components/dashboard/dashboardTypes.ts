export interface DashboardWidgetConfig {
  kpis: boolean;
  charts: boolean;
  categoryPie: boolean;
  activityHeatmap: boolean;
  recentReports: boolean;
  printPreview: boolean;
  doctorStats: boolean;
}

export type DashboardViewMode = 'all' | 'clinical' | 'executive';
export type TimeRange = '7days' | '30days' | 'all';
