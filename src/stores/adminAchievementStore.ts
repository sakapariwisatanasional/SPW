/**
 * SPWN Apps 2.0
 * Admin Achievement Store FINAL
 *
 * Source:
 * - admin.achievement.dashboard
 * - admin.achievement.statistics
 * - admin.achievement.member.detail
 *
 * GAS untouched
 */

import { create } from "zustand";

import {
  adminAchievementApi,
} from "@/services/api/adminAchievement.api";


interface AdminAchievementState {

  dashboard: any | null;

  statistics: any | null;

  selectedMember: any | null;

  loading: boolean;

  error: string | null;


  loadDashboard: () => Promise<void>;

  loadStatistics: () => Promise<void>;

  loadMemberDetail: (
    memberId: string
  ) => Promise<void>;

  clearSelectedMember: () => void;

}


export const useAdminAchievementStore =
create<AdminAchievementState>((set) => ({

  dashboard: null,

  statistics: null,

  selectedMember: null,

  loading: false,

  error: null,


  loadDashboard: async () => {

    set({
      loading: true,
      error: null,
    });


    try {

      const response =
        await adminAchievementApi
          .getDashboard();


      set({

        dashboard:
          response.data,

        loading:false,

      });


    } catch(error:any){


      set({

        loading:false,

        error:
          error?.message ||
          "Gagal memuat dashboard achievement"

      });


    }

  },


  loadStatistics: async () => {

    set({

      loading:true,

      error:null,

    });


    try {


      const response =
        await adminAchievementApi
          .getStatistics();


      set({

        statistics:
          response.data,

        loading:false,

      });


    } catch(error:any){


      set({

        loading:false,

        error:
          error?.message ||
          "Gagal memuat statistik achievement"

      });


    }

  },


  loadMemberDetail:
    async(memberId:string)=>{


      set({

        loading:true,

        error:null,

      });


      try {


        const response =
          await adminAchievementApi
            .getMemberDetail(memberId);


        set({

          selectedMember:
            response.data,

          loading:false,

        });


      } catch(error:any){


        set({

          loading:false,

          error:
            error?.message ||
            "Gagal memuat detail achievement anggota"

        });


      }


    },


  clearSelectedMember:()=>{


    set({

      selectedMember:null,

    });


  },


}));
