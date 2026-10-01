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

  // Preview UI only. Tidak membuat identitas anggota backend.
  loadDemoProfile: async (type: any) => {
    const isActive = type === "active";

    const preview = {
      nama: isActive ? "Contoh Anggota" : "Anggota Baru",
      full_name: isActive ? "Contoh Anggota" : "Anggota Baru",
      level: isActive ? "MADYA" : "PURWA",
      summary: {
        completedSkk: isActive ? 8 : 0,
        inProgressSkk: isActive ? 2 : 0,
        progressPercent: isActive ? 80 : 0,
      },
      skkItems: [],
      badges: [],
      activities: [],
    };

    set({
      profile: {
        member: preview,
        summary: preview.summary,
      },
      skkItems: [],
      skk: [],
      badges: [],
      activities: [],
      loading: false,
      isLoading: false,
      error: null,
    });
  },

  loadSimulationAchievement: (user: any) => {
    if (!user) return;

    const memberId =
      user?.memberProfile?.id ||
      user?.memberId ||
      user?.id ||
      null;

    set({
      profile: {
        member: {
          id: memberId,
          memberId,
          nama: user?.memberProfile?.full_name || user?.nama || user?.full_name || "",
          full_name: user?.memberProfile?.full_name || user?.full_name || user?.nama || "",
          no_kta: user?.memberProfile?.no_kta,
          province: user?.memberProfile?.province || user?.province,
          level: user?.memberProfile?.level || user?.level || "PURWA",
        },
        summary: user?.summary || {
          completedSkk: 0,
          inProgressSkk: 0,
          progressPercent: 0,
        },
      },
      skkItems: Array.isArray(user?.skkItems) ? user.skkItems : [],
      skk: Array.isArray(user?.skkItems) ? user.skkItems : [],
      badges: Array.isArray(user?.badges) ? user.badges : [],
      activities: Array.isArray(user?.activities) ? user.activities : [],
      loading: false,
      isLoading: false,
      error: null,
    });
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
