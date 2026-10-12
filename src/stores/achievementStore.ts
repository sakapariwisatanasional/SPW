/**
 * SPWN Apps 2.0
 * Achievement Store FINAL FIX
 *
 * Backend aligned version
 * - Real API member
 * - SuperAdmin uses real selected member
 * - No dummy member identity
 * - Safe array contract
 */

import { create } from "zustand";
import { achievementApi } from "../services/api/achievement.api";

export const useAchievementStore = create((set) => ({
  profile: null,
  skkItems: [],
  skk: [],
  badges: [],
  activities: [],

  selectedKrida: "pemandu",

  loading: false,
  isLoading: false,
  error: null,

  privacyScoreVisible: false,

  setSelectedKrida: (krida: any) => {
    set({ selectedKrida: krida });
  },

  togglePrivacyView: () => {
    set((state: any) => ({
      privacyScoreVisible: !state.privacyScoreVisible,
    }));
  },

  // Legacy compatibility only. Tidak membuat profile lokal/dummy.
  loadSimulationAchievement: (user: any) => {
    const memberId =
      user?.memberProfile?.id ||
      user?.memberProfile?.member_id ||
      user?.memberId ||
      user?.id ||
      null;

    if (!memberId) {
      set({
        profile: null,
        skkItems: [],
        skk: [],
        badges: [],
        activities: [],
        loading: false,
        isLoading: false,
        error: "Member ID GAS tidak tersedia untuk profil pencapaian",
      });
    }
  },

  loadAchievement: async (
    memberId: any,
    viewerRole?: any,
    viewerMemberId?: any
  ) => {
    set({
      loading: true,
      isLoading: true,
      error: null,
    });

    try {
      if (!memberId) {
        throw new Error("Member ID tidak tersedia");
      }

      const [
        profileRes,
        skkRes,
        badgesRes,
        activitiesRes,
      ] = await Promise.all([
        achievementApi.getAchievement(memberId),
        achievementApi.getSkkStatus(memberId),
        achievementApi.getBadges(memberId),
        achievementApi.getActivities(memberId),
      ]);

      set({
        profile: profileRes?.data || null,
        skkItems: Array.isArray(skkRes?.data) ? skkRes.data : [],
        skk: Array.isArray(skkRes?.data) ? skkRes.data : [],
        badges: Array.isArray(badgesRes?.data) ? badgesRes.data : [],
        activities: Array.isArray(activitiesRes?.data) ? activitiesRes.data : [],
        loading: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error("Achievement loading error:", error);

      set({
        loading: false,
        isLoading: false,
        profile: null,
        skkItems: [],
        skk: [],
        badges: [],
        activities: [],
        error: error?.message || "Gagal memuat pencapaian",
      });
    }
  },
}));
