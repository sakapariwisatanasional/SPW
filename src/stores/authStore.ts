/**
 * SPWN Apps 2.0
 * AuthStore FINAL v6
 *
 * Full Auth Store
 *
 * Includes:
 * - Login session
 * - Restore session
 * - Logout
 * - Permission check
 * - Member profile update sync
 */

import { create } from 'zustand';
import { authApi } from '../services/api/auth.api';
import { memberApi } from '../services/api/member.api';
import { ROLES } from '../config/constants';


interface AuthState {

  currentUser:any | null;

  token:string | null;

  isAuthenticated:boolean;


  loginWithCredentials:
    (
      identifier:string,
      password:string
    )=>Promise<any>;


  setSession:
    (
      user:any,
      token:string
    )=>void;


  updateCurrentUserProfile:
    (
      profileData:any
    )=>Promise<any>;


  logout:
    ()=>void;


  hasPermission:
    (
      permission:string
    )=>boolean;

}



function getInitialAuthState(){

  try{

    const token =
      localStorage.getItem(
        "spwn_session_token"
      );


    const user =
      JSON.parse(
        localStorage.getItem(
          "spwn_session_user"
        ) || "null"
      );


    if(token && user){

      return {

        currentUser:user,

        token,

        isAuthenticated:true

      };

    }

  }catch(error){

    console.warn(
      "Restore session gagal",
      error
    );

  }


  return {

    currentUser:null,

    token:null,

    isAuthenticated:false

  };

}



const initial =
  getInitialAuthState();



export const useAuthStore =
create<AuthState>((set,get)=>({


  currentUser:
    initial.currentUser,


  token:
    initial.token,


  isAuthenticated:
    initial.isAuthenticated,



  loginWithCredentials:
  async(identifier,password)=>{


    const response =
      await authApi.login({

        email:identifier,

        password

      });



    if(
      !response ||
      !response.success
    ){

      throw new Error(
        response?.message ||
        "Login gagal"
      );

    }



    const user =
      response.data.user ||
      response.data;


    const token =
      user.token ||
      response.data.token ||
      "";



    get().setSession(
      user,
      token
    );



    return response;

  },



  setSession:
  (user,token)=>{


    const sessionUser = {

      ...user,


      memberProfile:
        user.memberProfile ||
        null

    };



    localStorage.setItem(

      "spwn_session_token",

      token || ""

    );


    localStorage.setItem(

      "spwn_session_user",

      JSON.stringify(sessionUser)

    );



    set({

      currentUser:sessionUser,

      token,

      isAuthenticated:true

    });


  },



  updateCurrentUserProfile:
  async(profileData)=>{


    const user =
      get().currentUser;


    if(!user){

      throw new Error(
        "User belum login"
      );

    }



    const memberId =
      user.memberProfile?.id ||
      user.memberId;



    if(!memberId){

      throw new Error(
        "Member ID tidak ditemukan"
      );

    }



    const result =
      await memberApi.updateProfile({

        member_id:memberId,


        data:{

          full_name:
            profileData.fullName,


          phone:
            profileData.phone,


          province:
            profileData.province,


          city:
            profileData.cityName,


          district:
            profileData.districtName,


          krida:
            profileData.kridaName,


          photo_url:
            profileData.avatarUrl

        },


        actor:user.id

      });



    if(!result.success){

      throw new Error(
        result.message ||
        "Gagal memperbarui profil"
      );

    }



    const updatedUser = {

      ...user,


      fullName:
        profileData.fullName,


      avatarUrl:
        profileData.avatarUrl,


      memberProfile:{

        ...user.memberProfile,


        full_name:
          profileData.fullName,


        phone:
          profileData.phone,


        province:
          profileData.province,


        city:
          profileData.cityName,


        district:
          profileData.districtName,


        krida:
          profileData.kridaName,


        photo_url:
          profileData.avatarUrl

      }

    };



    localStorage.setItem(

      "spwn_session_user",

      JSON.stringify(updatedUser)

    );



    set({

      currentUser:updatedUser

    });



    return result;

  },



  logout:()=>{


    localStorage.removeItem(
      "spwn_session_token"
    );


    localStorage.removeItem(
      "spwn_session_user"
    );


    set({

      currentUser:null,

      token:null,

      isAuthenticated:false

    });


  },



  hasPermission:
  (permission)=>{


    const user =
      get().currentUser;



    if(!user){

      return false;

    }



    if(
      user.role === ROLES.SUPER_ADMIN
    ){

      return true;

    }



    return (
      user.permissions || []
    )
    .includes(permission);


  }



}));
