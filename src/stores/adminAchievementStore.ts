/**
 * SPWN Apps 2.0
 * Admin Achievement Store
 *
 * Source:
 * - admin achievement API
 * - no dummy data
 * - GAS untouched
 */

import { create } from "zustand";

import {
  adminAchievementApi
} from "../services/api/adminAchievement.api";


interface AdminAchievementState {

  dashboard:any | null;

  statistics:any | null;

  selectedMember:any | null;

  loading:boolean;

  error:string | null;


  loadDashboard:()=>Promise<void>;

  loadStatistics:()=>Promise<void>;

  loadMemberDetail:(memberId:string)=>Promise<void>;

  clearSelectedMember:()=>void;

}



export const useAdminAchievementStore =
create<AdminAchievementState>((set)=>({


  dashboard:null,

  statistics:null,

  selectedMember:null,

  loading:false,

  error:null,



  loadDashboard:async()=>{

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

      console.error(
        "Admin achievement dashboard error:",
        error
      );


      set({

        loading:false,

        error:
          error.message ||
          "Gagal memuat dashboard"

      });

    }

  },



  loadStatistics:async()=>{


    set({
      loading:true,
      error:null
    });


    try{


      const response =
        await adminAchievementApi
        .getStatistics();



      set({

        statistics:
          response.data,

        loading:false

      });



    }catch(error:any){


      console.error(
        "Admin achievement statistics error:",
        error
      );


      set({

        loading:false,

        error:
          error.message ||
          "Gagal memuat statistik"

      });


    }


  },




  loadMemberDetail:async(memberId:string)=>{


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


      console.error(
        "Admin achievement member detail error:",
        error
      );


      set({

        loading:false,

        error:
          error.message ||
          "Gagal memuat detail anggota"

      });


    }


  },




  clearSelectedMember:()=>{

    set({

      selectedMember:null

    });

  }


}));
