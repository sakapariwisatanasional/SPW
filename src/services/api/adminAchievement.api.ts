/**
 * SPWN Apps 2.0
 * Admin Achievement API
 *
 * Backend:
 * - admin.achievement.dashboard
 * - admin.achievement.statistics
 * - admin.achievement.member.detail
 */

import { apiClient, ApiResponse } from "./apiClient";


export const adminAchievementApi = {

  getDashboard: async (): Promise<ApiResponse<any>> => {

    return apiClient.get<any>(
      "admin.achievement.dashboard"
    );

  },


  getStatistics: async (): Promise<ApiResponse<any>> => {

    return apiClient.get<any>(
      "admin.achievement.statistics"
    );

  },


  getMemberDetail: async (
    memberId:string
  ): Promise<ApiResponse<any>> => {

    return apiClient.get<any>(
      "admin.achievement.member.detail",
      {
        member_id: memberId
      }
    );

  }

};
