// authStore.ts
// SPWN Apps 2.0 Frontend Hardening
// Backend authentication only - mock login removed

import { create } from 'zustand';
import { ROLES, UserRole } from '../config/constants';
import { UserProfile } from '../types/auth';
import { PermissionKey, ROLE_DEFAULT_PERMISSIONS } from '../types/permissions';
import { authApi } from '../services/api/auth.api';

function getInitialAuthState(){
  try{
    const token = localStorage.getItem('spwn_session_token');
    const user = JSON.parse(localStorage.getItem('spwn_session_user') || 'null');

    if(token && user){
      return {
        currentUser:{
          ...user,
          permissions:user.permissions || ROLE_DEFAULT_PERMISSIONS[user.role] || []
        },
        token,
        isAuthenticated:true
      };
    }
  }catch(e){
    console.warn('Session restore gagal', e);
  }

  return { currentUser:null, token:null, isAuthenticated:false };
}

interface AuthState{
  currentUser:UserProfile | null;
  token:string | null;
  isAuthenticated:boolean;
  loginWithCredentials:(identifier:string,password:string)=>Promise<any>;
  setSession:(user:UserProfile,token:string)=>void;
  logout:()=>void;
  hasPermission:(permission:PermissionKey)=>boolean;
}

const initialAuth = getInitialAuthState();

export const useAuthStore = create<AuthState>((set,get)=>({

  currentUser:initialAuth.currentUser,
  token:initialAuth.token,
  isAuthenticated:initialAuth.isAuthenticated,

  loginWithCredentials:async(identifier,password)=>{
    try{
      const response = await authApi.login({
        email:identifier,
        password
      });

      if(!response.success || !response.data){
        return {success:false,message:response.message || 'Login gagal'};
      }

      get().setSession(
        response.data.user as UserProfile,
        response.data.token
      );

      return {success:true,message:'Login berhasil',user:response.data.user};

    }catch(error:any){
      return {success:false,message:error.message || 'Login gagal'};
    }
  },

  setSession:(user,token)=>{
    const permissions = (user as any).permissions || ROLE_DEFAULT_PERMISSIONS[user.role as UserRole] || [];
    const sessionUser = {...user, permissions};

    localStorage.setItem('spwn_session_token', token);
    localStorage.setItem('spwn_session_user', JSON.stringify(sessionUser));

    set({currentUser:sessionUser,token,isAuthenticated:true});
  },

  logout:()=>{
    localStorage.removeItem('spwn_session_token');
    localStorage.removeItem('spwn_session_user');
    set({currentUser:null,token:null,isAuthenticated:false});
  },

  hasPermission:(permission)=>{
    const user = get().currentUser;
    if(!user) return false;
    if(user.role === ROLES.SUPER_ADMIN) return true;
    return ((user as any).permissions || []).includes(permission);
  }

}));
