export interface DashboardSummaryMetrics {
  totalMembers: number;
  activeMembers: number;
  verifiedKTAPercentage: number;
  totalDestinations: number;
  activePartners: number;
  totalArticles: number;
  totalCommerceTransactions: number;
  totalCommerceRevenue: number;
}

export interface ProvinceMapStat {
  provinceName: string;
  memberCount: number;
  destinationCount: number;
  kridaLeader: string;
}

export interface ActivityTimelineItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  category: 'membership' | 'tourism' | 'content' | 'commerce' | 'verification';
}
