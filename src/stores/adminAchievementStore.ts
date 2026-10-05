/**
 * SPWN Apps 2.0
 * Admin Achievement Store - Response Shape Safe Patch
 *
 * Fix:
 * - Handles admin.achievement.directory response shaped as:
 *   { scope, totalMember, members: [...] }
 * - Prevents reduce/forEach errors when backend returns an object instead of array
 * - Keeps dashboard/statistics derived from normalized achievementMembers
 */

import { create } from "zustand";
import { adminAchievementApi } from "@/services/api/adminAchievement.api";

interface AdminAchievementState {
  dashboard: any | null;
  statistics: any | null;
  members: any[];
  achievementMembers: any[];
  selectedMember: any | null;

  loading: boolean;
  error: string | null;

  loadDashboard: () => Promise<void>;
  loadStatistics: () => Promise<void>;
  loadMemberAchievements: () => Promise<void>;
  loadMemberDetail: (memberId: string) => Promise<void>;
  clearSelectedMember: () => void;
}

const normalizeMemberArray = (input: any): any[] => {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.members)) return input.members;
  if (Array.isArray(input?.data)) return input.data;
  if (Array.isArray(input?.data?.members)) return input.data.members;
  return [];
};

export const useAdminAchievementStore =
  create<AdminAchievementState>((set, get) => ({
    dashboard: null,
    statistics: null,
    members: [],
    achievementMembers: [],
    selectedMember: null,
    loading: false,
    error: null,

    loadDashboard: async () => {
      const members = normalizeMemberArray(get().achievementMembers);

      const totalCompletedSkk = members.reduce((total, member) => {
        const completed =
          member?.completedSkk ??
          member?.summary?.completedSkk ??
          0;

        return total + Number(completed || 0);
      }, 0);

      set({
        dashboard: {
          totalMembers: members.length,
          totalCompletedSkk,
        },
      });
    },

    loadStatistics: async () => {
      const members = normalizeMemberArray(get().achievementMembers);
      const levels: Record<string, number> = {};

      members.forEach((item) => {
        const level =
          item?.level ||
          item?.membershipLevel ||
          item?.tingkat ||
          "Belum Ada";

        levels[level] = (levels[level] || 0) + 1;
      });

      set({
        statistics: {
          total: members.length,
          levelDistribution: levels,
        },
      });
    },

    loadMemberAchievements: async () => {
      set({
        loading: true,
        error: null,
      });

      try {
        const response = await adminAchievementApi.getDirectory();

        const data = normalizeMemberArray(response?.data ?? response);

        set({
          members: data,
          achievementMembers: data,
          loading: false,
        });

        await get().loadDashboard();
        await get().loadStatistics();
      } catch (error: any) {
        set({
          members: [],
          achievementMembers: [],
          loading: false,
          error:
            error?.message ||
            "Gagal memuat achievement directory",
        });

        await get().loadDashboard();
        await get().loadStatistics();
      }
    },

    loadMemberDetail: async (memberId: string) => {
      try {
        const response =
          await adminAchievementApi.getMemberDetail(memberId);

        set({
          selectedMember: response?.data ?? null,
        });
      } catch (error: any) {
        set({
          error:
            error?.message ||
            "Gagal memuat detail member",
        });
      }
    },

    clearSelectedMember: () => {
      set({
        selectedMember: null,
      });
    },
  }));
