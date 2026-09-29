/**
 * SPWN Apps 2.0
 * Admin Achievement Store
 *
 * Scope:
 * - Admin Achievement Dashboard
 * - Achievement Statistics
 * - Member Achievement Detail
 * - Member list integration
 *
 * Catatan:
 * Tidak mengubah GAS.
 * Member list memakai existing memberApi.
 */

import { create } from "zustand";

import { adminAchievementApi } from "@/services/api/adminAchievement.api";
import { memberApi } from "@/services/api/member.api";


interface AdminAchievementState {

  dashboard: any | null;

  statistics: any | null;

  members: any[];

  selectedMember: any | null;

  loading: boolean;

  error: string | null;


  loadDashboard: () => Promise<void>;

  loadStatistics: () => Promise<void>;

  loadMembers: () => Promise<void>;

  loadMemberDetail: (
    memberId: string
  ) => Promise<void>;

  clearSelectedMember: () => void;

}



export const useAdminAchievementStore =
create<AdminAchievementState>((set)=>({


  dashboard:null,

  statistics:null,

  members:[],

  selectedMember:null,

  loading:false,

  error:null,



  loadDashboard: async()=>{

    set({
      loading:true,
      error:null
    });


    try{

      const response =
        await adminAchievementApi
        .getDashboard();


      set({

        dashboard:
          response.data,

        loading:false

      });


    }catch(error:any){

      set({

        loading:false,

        error:
          error.message ||
          "Gagal memuat dashboard achievement"

      });

    }

  },



  loadStatistics: async()=>{


    try{

      const response =
        await adminAchievementApi
        .getStatistics();


      set({

        statistics:
          response.data

      });


    }catch(error:any){

      set({

        error:
          error.message ||
          "Gagal memuat statistik achievement"

      });

    }

  },



  loadMembers: async()=>{


    try{


      const response =
        await memberApi.list();


      set({

        members:
          response.data || []

      });


    }catch(error:any){

      set({

        error:
          error.message ||
          "Gagal memuat data anggota"

      });

    }

  },



  loadMemberDetail:
  async(memberId:string)=>{


    set({
      loading:true,
      error:null
    });


    try{


      const response =
        await adminAchievementApi
        .getMemberDetail(memberId);


      set({

        selectedMember:
          response.data,

        loading:false

      });



    }catch(error:any){


      set({

        loading:false,

        error:
          error.message ||
          "Gagal memuat detail achievement"

      });


    }

  },



  clearSelectedMember:()=>{

    set({

      selectedMember:null

    });

  }


}));
