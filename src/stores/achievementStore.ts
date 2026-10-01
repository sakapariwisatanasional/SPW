/**
 * SPWN Apps 2.0
 * Achievement Store FINAL FIX
 *
 * Support:
 * - Real API member
 * - SuperAdmin simulation member
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


  setSelectedKrida: (krida:any) => {
    set({
      selectedKrida: krida
    });
  },


  togglePrivacyView: () => {
    set((state:any)=>({
      privacyScoreVisible:
        !state.privacyScoreVisible
    }));
  },


  loadDemoProfile: async(type:any)=>{

    const active =
      type === "active";

    const user = active
      ? {
          id:"DEMO-MEMBER-FAJAR",
          memberId:"SPWN.32.01.2024.089",
          nama:"Fajar",
          full_name:"Fajar",
          no_kta:"SPWN.32.01.2024.089",
          level:"MADYA",

          summary:{
            completedSkk:8,
            inProgressSkk:2,
            progressPercent:80
          },

          skkItems:[],
          badges:[],
          activities:[]
        }
      : {
          id:"DEMO-MEMBER-BAGAS",
          memberId:"SPWN.31.01.2026.001",
          nama:"Bagas",
          full_name:"Bagas",
          level:"PURWA",

          summary:{
            completedSkk:0,
            inProgressSkk:0,
            progressPercent:0
          },

          skkItems:[],
          badges:[],
          activities:[]
        };


    set({

      profile:{
        member:{
          ...user
        },

        summary:user.summary
      },

      skkItems:
        Array.isArray(user.skkItems)
          ? user.skkItems
          : [],

      skk:
        Array.isArray(user.skkItems)
          ? user.skkItems
          : [],

      badges:
        Array.isArray(user.badges)
          ? user.badges
          : [],

      activities:
        Array.isArray(user.activities)
          ? user.activities
          : [],

      loading:false,
      isLoading:false,
      error:null
    });

  },


  loadSimulationAchievement:(user:any)=>{

    if(!user){
      return;
    }


    set({

      profile:{

        member:{

          id:user.id,

          memberId:
            user.memberId,

          nama:
            user.nama ||
            user.full_name,

          full_name:
            user.full_name ||
            user.nama,

          no_kta:
            user.no_kta,

          province:
            user.province,

          level:
            user.level ||
            "PURWA"

        },

        summary:
          user.summary ||
          {
            completedSkk:0,
            inProgressSkk:0,
            progressPercent:0
          }

      },


      skkItems:
        Array.isArray(user.skkItems)
          ? user.skkItems
          : [],

      skk:
        Array.isArray(user.skkItems)
          ? user.skkItems
          : [],

      badges:
        Array.isArray(user.badges)
          ? user.badges
          : [],

      activities:
        Array.isArray(user.activities)
          ? user.activities
          : [],

      loading:false,
      isLoading:false,
      error:null

    });

  },


  loadAchievement: async(
    memberId:any,
    viewerRole?:any,
    viewerMemberId?:any
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

        achievementApi.getAchievement(memberId),

        achievementApi.getSkkStatus(memberId),

        achievementApi.getBadges(memberId),

        achievementApi.getActivities(memberId)

      ]);


      set({

        profile:
          profileRes?.data || null,


        skkItems:
          Array.isArray(skkRes?.data)
            ? skkRes.data
            : [],


        skk:
          Array.isArray(skkRes?.data)
            ? skkRes.data
            : [],


        badges:
          Array.isArray(badgesRes?.data)
            ? badgesRes.data
            : [],


        activities:
          Array.isArray(activitiesRes?.data)
            ? activitiesRes.data
            : [],


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

        profile:null,

        skkItems:[],

        skk:[],

        badges:[],

        activities:[],

        error:
          error?.message ||
          "Gagal memuat pencapaian"

      });

    }

  }

}));
