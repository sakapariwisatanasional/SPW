/**
 * SPWN Apps 2.0
 * Admin Achievement Store FINAL
 *
 * Source:
 * - member.list
 * - admin.achievement.member.detail
 *
 * GAS untouched
 */


import { create } from "zustand";

import {
  memberApi
} from "@/services/api/member.api";


import {
  adminAchievementApi
} from "@/services/api/adminAchievement.api";


import {
  mapMemberAchievement
} from "@/features/achievement/utils/adminAchievement.mapper";



interface AdminAchievementState {


  dashboard:any | null;

  statistics:any | null;


  members:any[];

  achievementMembers:any[];


  selectedMember:any | null;


  loading:boolean;

  error:string | null;



  loadDashboard:
    ()=>Promise<void>;


  loadStatistics:
    ()=>Promise<void>;


  loadMembers:
    ()=>Promise<void>;


  loadMemberAchievements:
    ()=>Promise<void>;


  loadMemberDetail:
    (memberId:string)=>Promise<void>;


  clearSelectedMember:
    ()=>void;

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





/**
 * Dashboard metric
 *
 * Tidak mengambil GAS route.
 * Dihitung dari data achievement anggota.
 */
loadDashboard:async()=>{


 const members =
   get().achievementMembers;


 const total =
   members.length;



 const completed =
   members.reduce(
    (
      total,
      item
    )=>{

      return total +
      Number(
        item.completedSkk || 0
      );

    },
    0
   );



 set({

  dashboard:{

    totalMembers:
      total,

    totalCompletedSkk:
      completed

  }

 });


},





/**
 * Statistik achievement
 */
loadStatistics:async()=>{


 const members =
   get().achievementMembers;



 const levels =
   members.reduce(
    (
      result,
      item
    )=>{


      const level =
        item.level ||
        "Belum Ada";


      result[level] =
        (
          result[level] || 0
        ) + 1;


      return result;


    },
    {}
   );



 set({

  statistics:{

    total:
      members.length,

    levelDistribution:
      levels

  }

 });



},





/**
 * Ambil anggota dari GAS
 */
loadMembers:async()=>{


 set({

  loading:true,

  error:null

 });



 try{


  const response =
    await memberApi.list();



  set({

    members:
      response.data || [],


    loading:false

  });



 }catch(error:any){


  set({

    loading:false,

    error:
      error?.message ||
      "Gagal mengambil anggota"

  });


 }



},





/**
 * Gabungkan member.list
 * + achievement detail GAS
 */
loadMemberAchievements:async()=>{


 let members =
   get().members;



 if(
   !members.length
 ){


  await get()
   .loadMembers();



  members =
    get().members;


 }




 set({

  loading:true

 });



 const result:any[]=[];



 for(
   const member of members
 ){


  try{


   const detail =
    await adminAchievementApi
      .getMemberDetail(
        member.no_kta
      );



   result.push(

    mapMemberAchievement(

      member,

      detail.data || {}

    )

   );



  }catch(error){


   result.push(

    mapMemberAchievement(

      member,

      {}

    )

   );


  }


 }



 set({

  achievementMembers:
    result,


  loading:false


 });



 // setelah data masuk,
 // hitung metric


 await get()
  .loadDashboard();



 await get()
  .loadStatistics();



},





loadMemberDetail:async(
 memberId:string
)=>{


 set({

  loading:true

 });



 try{


  const response =
    await adminAchievementApi
      .getMemberDetail(
        memberId
      );



  set({

    selectedMember:
      response.data,


    loading:false

  });



 }catch(error:any){


  set({

   loading:false,

   error:
    error?.message ||
    "Gagal mengambil detail anggota"

  });


 }



},





clearSelectedMember:()=>{


 set({

  selectedMember:null

 });


}



}));
