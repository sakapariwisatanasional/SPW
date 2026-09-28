/**
 * SPWN Apps 2.0
 * Achievement Store FINAL
 *
 * Tidak menggunakan data dummy.
 * Semua sumber dari API database.
 */

import { create } from "zustand";
import { achievementApi } from "../services/api/achievement.api";


export const useAchievementStore = create((set) => ({

  profile: null,
  skk: [],
  badges: [],
  activities: [],
  loading: false,
  error: null,


  loadAchievement: async (
    memberId,
    viewerRole,
    viewerMemberId
  ) => {

    set({
      loading: true,
      error: null
    });


    try {

      const [
        profileRes,
        skkRes,
        badgesRes,
        activitiesRes
      ] = await Promise.all([

        achievementApi.getAchievement(memberId),

        achievementApi.getSkkStatus(memberId),

        achievementApi.getBadges(memberId),

        achievementApi.getActivities(memberId)

      ]);


      set({

        profile: profileRes.data,

        skk: skkRes.data || [],

        badges: badgesRes.data || [],

        activities: activitiesRes.data || [],

        loading:false

      });


    } catch(error){

      console.error(
        "Achievement loading error:",
        error
      );


      set({

        loading:false,

        error:error.message || "Gagal memuat pencapaian"

      });


    }

  }

}));
