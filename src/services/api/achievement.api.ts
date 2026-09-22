/**
 * SPWN Apps 2.0 - Member Achievement API Client
 * Location: src/services/api/achievement.api.ts
 * -----------------------------------------------
 * Klien HTTP Action-Based Router untuk domain Pencapaian Anggota:
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
import {
  MOCK_ACTIVE_ACHIEVEMENT_PROFILE,
  MOCK_ACTIVE_SKK_ITEMS,
  MOCK_ACTIVE_BADGES,
  MOCK_ACTIVE_ACTIVITIES,
  MOCK_EMPTY_ACHIEVEMENT_PROFILE,
  MOCK_EMPTY_SKK_ITEMS
} from '../../features/achievement/data/achievementMockData';

export const achievementApi = {
  /**
   * Action: member.achievement
   * Mengambil Read Model profil pencapaian anggota
   */
  getAchievement: async (
    memberId?: string
  ): Promise<ApiResponse<MemberAchievementProfile>> => {
    try {
      return await apiClient.get<MemberAchievementProfile>('member.achievement', {
        member_id: memberId
      });
    } catch {
      // Fallback Read Model terisolasi saat offline/dev
      const isMockEmpty = memberId === 'SPWN.31.02.2026.012' || memberId === 'new-member';
      const data = isMockEmpty ? MOCK_EMPTY_ACHIEVEMENT_PROFILE : MOCK_ACTIVE_ACHIEVEMENT_PROFILE;

      return {
        success: true,
        statusCode: 200,
        message: 'Profil pencapaian berhasil dimuat (Read Model)',
        action: 'member.achievement',
        data,
        pagination: null,
        meta: {
          requestId: 'mock-achieve-' + Date.now(),
          timestamp: new Date().toISOString(),
          apiVersion: '2.0.0'
        }
      };
    }
  },

  /**
   * Action: member.skk.status
   * Mengambil status SKK anggota (dengan privacy filter nilai)
   */
  getSkkStatus: async (
    memberId?: string,
    kridaId?: string
  ): Promise<ApiResponse<MemberSkkItem[]>> => {
    try {
      return await apiClient.get<MemberSkkItem[]>('member.skk.status', {
        member_id: memberId,
        krida_id: kridaId
      });
    } catch {
      const isMockEmpty = memberId === 'SPWN.31.02.2026.012' || memberId === 'new-member';
      let items = isMockEmpty ? MOCK_EMPTY_SKK_ITEMS : MOCK_ACTIVE_SKK_ITEMS;

      if (kridaId && kridaId !== 'all') {
        items = items.filter(s => s.kridaId === kridaId);
      }

      return {
        success: true,
        statusCode: 200,
        message: 'Status SKK berhasil dimuat',
        action: 'member.skk.status',
        data: items,
        pagination: null,
        meta: {
          requestId: 'mock-skk-' + Date.now(),
          timestamp: new Date().toISOString(),
          apiVersion: '2.0.0'
        }
      };
    }
  },

  /**
   * Action: member.badges
   * Mengambil daftar lencana digital anggota
   */
  getBadges: async (memberId?: string): Promise<ApiResponse<MemberBadgeItem[]>> => {
    try {
      return await apiClient.get<MemberBadgeItem[]>('member.badges', {
        member_id: memberId
      });
    } catch {
      const isMockEmpty = memberId === 'SPWN.31.02.2026.012' || memberId === 'new-member';
      return {
        success: true,
        statusCode: 200,
        message: 'Daftar lencana berhasil dimuat',
        action: 'member.badges',
        data: isMockEmpty ? [] : MOCK_ACTIVE_BADGES,
        pagination: null,
        meta: {
          requestId: 'mock-badges-' + Date.now(),
          timestamp: new Date().toISOString(),
          apiVersion: '2.0.0'
        }
      };
    }
  },

  /**
   * Action: member.activities
   * Mengambil riwayat kegiatan (Media Policy: thumbnail_url hanya untuk preview)
   */
  getActivities: async (
    memberId?: string
  ): Promise<ApiResponse<MemberActivityItem[]>> => {
    try {
      return await apiClient.get<MemberActivityItem[]>('member.activities', {
        member_id: memberId
      });
    } catch {
      const isMockEmpty = memberId === 'SPWN.31.02.2026.012' || memberId === 'new-member';
      return {
        success: true,
        statusCode: 200,
        message: 'Riwayat kegiatan berhasil dimuat',
        action: 'member.activities',
        data: isMockEmpty ? [] : MOCK_ACTIVE_ACTIVITIES,
        pagination: null,
        meta: {
          requestId: 'mock-activities-' + Date.now(),
          timestamp: new Date().toISOString(),
          apiVersion: '2.0.0'
        }
      };
    }
  }
};
