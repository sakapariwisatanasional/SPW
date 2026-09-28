/**
 * SPWN Apps 2.0
 * Achievement API Client FINAL
 *
 * Production:
 * - Tidak memakai dummy/mock
 * - Semua data berasal dari GAS Database
 */

import { apiClient, ApiResponse } from "./apiClient";
import {
  MemberAchievementProfile,
  MemberSkkItem,
  MemberBadgeItem,
  MemberActivityItem
} from "../../types/achievement";


export const achievementApi = {

  getAchievement: async (
    memberId: string
  ): Promise<ApiResponse<MemberAchievementProfile>> => {

    return apiClient.get<MemberAchievementProfile>(
      "member.achievement",
      {
        member_id: memberId
      }
    );

  },


  getSkkStatus: async (
    memberId: string,
    kridaId?: string
  ): Promise<ApiResponse<MemberSkkItem[]>> => {

    return apiClient.get<MemberSkkItem[]>(
      "member.skk.status",
      {
        member_id: memberId,
        krida_id: kridaId || "all"
      }
    );

  },


  getBadges: async (
    memberId: string
  ): Promise<ApiResponse<MemberBadgeItem[]>> => {

    return apiClient.get<MemberBadgeItem[]>(
      "member.badges",
      {
        member_id: memberId
      }
    );

  },


  getActivities: async (
    memberId: string
  ): Promise<ApiResponse<MemberActivityItem[]>> => {

    return apiClient.get<MemberActivityItem[]>(
      "member.activities",
      {
        member_id: memberId
      }
    );

  }

};
