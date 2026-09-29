/**
 * SPWN Apps 2.0
 * Admin Achievement Store
 *
 * Terpisah dari achievementStore member.
 */

import { create } from "zustand";
import { adminAchievementApi } from "../services/api/adminAchievement.api";


export const useAdminAchievementStore = create((set)=>({

  dashboard:null,

  statistics:null,

  selectedMember:null,

  loading:false,

  error:null,


  loadDashboard: async()=>{

    set({
      loading:true,
      error:null
    });

    try{

      const res =
        await adminAchievementApi
        .getDashboard();


      set({
        dashboard:res.data,
        loading:false
      });


    }catch(error){

      set({
        loading:false,
        error:error.message || "Gagal memuat dashboard achievement"
      });

    }

  },


  loadStatistics: async()=>{

    try{

      const res =
        await adminAchievementApi
        .getStatistics();


      set({
        statistics:res.data
      });


    }catch(error){

      set({
        error:error.message || "Gagal memuat statistik achievement"
      });

    }

  },


  loadMemberDetail: async(memberId:string)=>{

    set({
      loading:true
    });


    try{

      const res =
        await adminAchievementApi
        .getMemberDetail(memberId);


      set({

        selectedMember:res.data,

        loading:false

      });


    }catch(error){

      set({

        loading:false,

        error:error.message || "Gagal memuat detail achievement"

      });

    }

  }


}));
