/**
 * SPWN Apps 2.0
 * Admin Achievement API FINAL
 */

import { apiClient, ApiResponse } from "./apiClient";

export const adminAchievementApi = {

  getDirectory: async (): Promise<ApiResponse<any>> => {
    return apiClient.get<any>(
      "admin.achievement.directory"
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
