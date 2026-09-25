/**
 * SPWN Apps 2.0 - Achievement Store
 * Location: src/stores/achievementStore.ts
 * ----------------------------------------
 * Zustand state store untuk Read Model pencapaian anggota,
 * filter Krida SKK, penanganan privacy guard score, dan empty state.
 */

import { create } from 'zustand';
import {
  MemberAchievementProfile,
  MemberSkkItem,
  MemberBadgeItem,
  MemberActivityItem
} from '../types/achievement';
import { achievementApi } from '../services/api/achievement.api';

interface AchievementState {
  profile: MemberAchievementProfile | null;
  skkItems: MemberSkkItem[];
  badges: MemberBadgeItem[];
  activities: MemberActivityItem[];
  selectedKrida: string;
  isLoading: boolean;
  error: string | null;
  privacyScoreVisible: boolean;

  // Actions
  loadAchievement: (memberId?: string, viewerRole?: string, viewerMemberId?: string) => Promise<void>;
  setSelectedKrida: (kridaId: string) => void;
  togglePrivacyView: () => void;
  loadDemoProfile: (type: 'active' | 'empty') => Promise<void>;
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  profile: null,
  skkItems: [],
  badges: [],
  activities: [],
  selectedKrida: 'all',
  isLoading: false,
  error: null,
  privacyScoreVisible: true,

  loadAchievement: async (memberId, viewerRole, viewerMemberId) => {
    set({ isLoading: true, error: null });
    try {
      const [profileRes, skkRes, badgesRes, activitiesRes] = await Promise.all([
        achievementApi.getAchievement(memberId),
        achievementApi.getSkkStatus(memberId),
        achievementApi.getBadges(memberId),
        achievementApi.getActivities(memberId)
      ]);

      const targetMemberId = profileRes.data?.member?.memberId || memberId;
      const isSelf = viewerMemberId && targetMemberId && viewerMemberId.toLowerCase() === targetMemberId.toLowerCase();
      const isAuthorizedRole = ['SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_WILAYAH', 'PEMBINA', 'TOURISM_MANAGER'].includes(
        viewerRole || ''
      );

      const canViewScore = Boolean(isSelf || isAuthorizedRole);

      // Filter privacy scores if not authorized
      const sanitizedSkkItems = (skkRes.data || []).map((item: any) => {
        if (!canViewScore) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { score, ...rest } = item;
          return rest;
        }
        return item;
      });

      set({
        profile: profileRes.data,
        skkItems: sanitizedSkkItems,
        badges: badgesRes.data || [],
        activities: activitiesRes.data || [],
        isLoading: false,
        privacyScoreVisible: canViewScore
      });
    } catch (err) {
      set({
        error: (err as Error).message || 'Gagal memuat profil pencapaian',
        isLoading: false
      });
    }
  },

  setSelectedKrida: (kridaId: string) => {
    set({ selectedKrida: kridaId });
  },

  togglePrivacyView: () => {
    set(state => ({ privacyScoreVisible: !state.privacyScoreVisible }));
  },

  loadDemoProfile: async (type: 'active' | 'empty') => {
    const id = type === 'empty' ? 'SPWN.31.02.2026.012' : 'SPWN.32.01.2024.089';
    await get().loadAchievement(id, 'MEMBER', id);
  }
}));
