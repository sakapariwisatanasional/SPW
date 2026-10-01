/**
 * SPWN Apps 2.0
 * AuthStore FINAL ROLE SIMULATION
 *
 * Semua role tetap memakai member yang sama.
 * Role hanya mengubah permission.
 */

import { create } from "zustand";
import { ROLES } from "../config/constants";
import { DEMO_MEMBER } from "../config/simulation/simulationMember";
import { SIMULATION_ROLES } from "../config/simulation/simulationRoles";

export const useAuthStore = create<any>((set, get) => ({

  currentUser: null,
  token: null,
  isAuthenticated: false,
  impersonatedUser: null,

  setSession:(user:any, token:string)=>{

    localStorage.setItem(
      "spwn_session_token",
      token || ""
    );

    localStorage.setItem(
      "spwn_session_user",
      JSON.stringify(user)
    );

    set({
      currentUser:user,
      token,
      isAuthenticated:true
    });
  },

  setImpersonatedUser:(user:any)=>{
    set({
      impersonatedUser:user
    });
  },

  clearImpersonation:()=>{
    set({
      impersonatedUser:null
    });
  },

  getEffectiveUser:()=>{
    const state=get();
    return state.impersonatedUser || state.currentUser;
  },

  switchSimulationRole:(role:string)=>{

    const current=get().currentUser;

    if(!current){
      return;
    }

    const config =
      SIMULATION_ROLES[
        role as keyof typeof SIMULATION_ROLES
      ];

    const simulatedUser={

      ...current,

      id:
        current.id ||
        DEMO_MEMBER.id,

      memberId:
        current.memberId ||
        DEMO_MEMBER.memberId,

      memberProfile:{
        ...(current.memberProfile || {}),

        id:DEMO_MEMBER.memberId,

        member_id:DEMO_MEMBER.memberId,

        full_name:DEMO_MEMBER.fullName
      },

      nama:DEMO_MEMBER.nama,

      fullName:DEMO_MEMBER.fullName,

      role,

      permissions:
        config?.permissions || [],

      simulationMode:true,

      simulationMember:DEMO_MEMBER
    };


    set({

      currentUser:simulatedUser,

      impersonatedUser:simulatedUser

    });

  },

  switchRole:(role:string)=>{

    get().switchSimulationRole(role);

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

      isAuthenticated:false,

      impersonatedUser:null

    });

  },

  hasPermission:(permission:string)=>{

    const user=get().currentUser;

    if(!user){
      return false;
    }

    if(user.role===ROLES.SUPER_ADMIN){
      return true;
    }

    return (
      user.permissions || []
    ).includes(permission);

  }

}));
