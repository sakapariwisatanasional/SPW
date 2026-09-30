/**
 * SPWN Apps 2.0
 * Admin Achievement Store FINAL
 *
 * SuperAdmin menggunakan:
 * admin.achievement.directory
 */

import { create } from "zustand";

import {
  adminAchievementApi
} from "@/services/api/adminAchievement.api";


interface AdminAchievementState {

  dashboard:any | null;
  statistics:any | null;
  members:any[];
  achievementMembers:any[];
  selectedMember:any | null;

  loading:boolean;
  error:string | null;

  loadDashboard:()=>Promise<void>;
  loadStatistics:()=>Promise<void>;
  loadMemberAchievements:()=>Promise<void>;
  loadMemberDetail:(memberId:string)=>Promise<void>;
  clearSelectedMember:()=>void;

}


export const useAdminAchievementStore =
create<AdminAchievementState>((set,get)=>({

  dashboard:null,
  statistics:null,

  members:[],
  achievementMembers:[],

  selectedMember:null,

  loading:false,
  error:null,


  loadDashboard:async()=>{

    const members =
      get().achievementMembers || [];

    set({
      dashboard:{
        totalMembers:members.length,
        totalCompletedSkk:
          members.reduce(
            (a,b)=>a + Number(b.completedSkk || 0),
            0
          )
      }
    });

  },


  loadStatistics:async()=>{

    const members =
      get().achievementMembers || [];

    const levels:any = {};

    members.forEach(item=>{

      const level =
        item.level || "Belum Ada";

      levels[level] =
        (levels[level] || 0) + 1;

    });


    set({
      statistics:{
        total:members.length,
        levelDistribution:levels
      }
    });

  },


  loadMemberAchievements:async()=>{

    set({
      loading:true,
      error:null
    });


    try{

      const response =
        await adminAchievementApi
          .getDirectory();


      const data =
        response.data || [];


      set({

        members:data,

        achievementMembers:data,

        loading:false

      });


      await get().loadDashboard();
      await get().loadStatistics();


    }catch(error:any){

      set({

        loading:false,

        error:
          error?.message ||
          "Gagal memuat achievement directory"

      });

    }

  },


  loadMemberDetail:async(memberId:string)=>{

    try{

      const response =
        await adminAchievementApi
          .getMemberDetail(memberId);


      set({

        selectedMember:
          response.data

      });


    }catch(error:any){

      set({

        error:
          error?.message ||
          "Gagal memuat detail member"

      });

    }

  },


  clearSelectedMember:()=>{

    set({
      selectedMember:null
    });

  }

}));
