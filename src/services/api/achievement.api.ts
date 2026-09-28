/**
 * SPWN Apps 2.0 - Member Achievement API Client FINAL v2
 *
 * Production version:
 * - Action-Based Router
 * - Tidak menggunakan fallback dummy otomatis
 * - Error API dikembalikan agar mudah debugging
 *
 * Actions:
 * - member.achievement
 * - member.skk.status
 * - member.badges
 * - member.activities
 */

import { apiClient, ApiResponse } from './apiClient';

import {
  MemberAchievementProfile,
  MemberSkkItem,
  MemberBadgeItem,
  MemberActivityItem
} from '../../types/achievement';



export const achievementApi = {


  /**
   * Action:
   * member.achievement
   *
   * Mengambil Read Model profil pencapaian anggota
   */
  getAchievement: async (
    memberId?: string
  ): Promise<ApiResponse<MemberAchievementProfile>> => {

    return await apiClient.get<MemberAchievementProfile>(
      'member.achievement',
      {
        member_id: memberId
      }
    );

  },



  /**
   * Action:
   * member.skk.status
   *
   * Mengambil status SKK anggota
   */
  getSkkStatus: async (
    memberId?: string,
    kridaId?: string
  ): Promise<ApiResponse<MemberSkkItem[]>> => {

    return await apiClient.get<MemberSkkItem[]>(
      'member.skk.status',
      {
        member_id: memberId,
        krida_id: kridaId
      }
    );

  },



  /**
   * Action:
   * member.badges
   *
   * Mengambil daftar badge digital anggota
   */
  getBadges: async (
    memberId?: string
  ): Promise<ApiResponse<MemberBadgeItem[]>> => {

    return await apiClient.get<MemberBadgeItem[]>(
      'member.badges',
      {
        member_id: memberId
      }
    );

  },



  /**
   * Action:
   * member.activities
   *
   * Mengambil portofolio aktivitas anggota
   */
  getActivities: async (
    memberId?: string
  ): Promise<ApiResponse<MemberActivityItem[]>> => {

    return await apiClient.get<MemberActivityItem[]>(
      'member.activities',
      {
        member_id: memberId
      }
    );

  }


};
