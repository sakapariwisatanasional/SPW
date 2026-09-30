/**
 * SPWN Apps 2.0
 * Achievement Store FINAL
 *
 * Member Achievement
 *
 * Source:
 * - GAS Achievement Database
 * - member.achievement
 * - member.skk.status
 * - member.badges
 * - member.activities
 */


import { create } from "zustand";

import {
  achievementApi
} from "../services/api/achievement.api";



interface AchievementState {

  profile:any | null;

  skkItems:any[];

  badges:any[];

  activities:any[];


  selectedKrida:string;


  loading:boolean;

  isLoading:boolean;


  error:string | null;


  privacyScoreVisible:boolean;



  loadAchievement:
    (
      memberId:string,
      viewerRole?:string,
      viewerMemberId?:string
    )=>Promise<void>;



  setSelectedKrida:
    (krida:string)=>void;



  togglePrivacyView:
    ()=>void;



  loadDemoProfile:
    (type:string)=>Promise<void>;

}



export const useAchievementStore =
create<AchievementState>((set)=>({


  profile:null,


  skkItems:[],


  badges:[],


  activities:[],



  selectedKrida:"all",



  loading:false,

  isLoading:false,



  error:null,



  privacyScoreVisible:true,





  loadAchievement:async(
    memberId:string,
    viewerRole?:string,
    viewerMemberId?:string
  )=>{


    set({

      loading:true,

      isLoading:true,

      error:null

    });



    try{


      const [

        profileRes,

        skkRes,

        badgesRes,

        activitiesRes


      ] = await Promise.all([


        achievementApi
          .getAchievement(memberId),



        achievementApi
          .getSkkStatus(memberId),



        achievementApi
          .getBadges(memberId),



        achievementApi
          .getActivities(memberId)


      ]);




      set({


        profile:
          profileRes.data,



        skkItems:
          skkRes.data || [],



        badges:
          badgesRes.data || [],



        activities:
          activitiesRes.data || [],



        loading:false,

        isLoading:false


      });



    }catch(error:any){



      console.error(
        "Achievement loading error:",
        error
      );



      set({

        loading:false,

        isLoading:false,


        error:
          error?.message ||
          "Gagal memuat pencapaian"


      });



    }


  },





  setSelectedKrida:(krida:string)=>{


    set({

      selectedKrida:krida

    });


  },





  togglePrivacyView:()=>{


    set(state=>({

      privacyScoreVisible:
        !state.privacyScoreVisible

    }));


  },





  /**
   * Compatibility handler
   * Tidak menggunakan dummy.
   * Dipertahankan agar halaman lama tidak crash.
   */
  loadDemoProfile:async()=>{


    return;


  }



}));
