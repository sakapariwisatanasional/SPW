/**
 * SPWN Apps 2.0
 * Admin Achievement Store FINAL
 *
 * Source:
 * - MEMBER -> member.list
 * - ACHIEVEMENT -> admin.achievement.member.detail
 *
 * GAS untouched
 */


import { create } from "zustand";

import {
  adminAchievementApi
} from "@/services/api/adminAchievement.api";


import {
  memberApi
} from "@/services/api/member.api";


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





loadDashboard:async()=>{

 try{


  const response =
   await adminAchievementApi
    .getDashboard();



  set({

    dashboard:
      response.data

  });



 }catch(error:any){


  set({

    error:
      error.message ||
      "Gagal memuat dashboard"

  });


 }


},





loadStatistics:async()=>{


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
    "Gagal memuat statistik"

  });


 }



},





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
    error.message ||
    "Gagal memuat anggota"

  });


 }



},





loadMemberAchievements:async()=>{


 let members =
   get().members;



 if(!members.length){


  await get()
    .loadMembers();



  members =
   get().members;


 }




 set({

  loading:true,

  error:null

 });



 const result:any[]=[];



 for(const member of members){


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



},





loadMemberDetail:async(memberId:string)=>{


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
    error.message ||
    "Gagal memuat detail"

  });



 }



},





clearSelectedMember:()=>{


 set({

  selectedMember:null

 });


}



}));
