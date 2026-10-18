import { create } from 'zustand';
import { ROLES, UserRole } from '../config/constants';
import { UserProfile } from '../types/auth';
import { PermissionKey } from '../types/permissions';
import { authApi } from '../services/api/auth.api';

const EMPTY_PUBLIC_USER: UserProfile & { permissions: PermissionKey[] } = {
  id: '',
  username: '',
  email: '',
  fullName: '',
  role: ROLES.PUBLIC_USER,
  roleName: 'Publik',
  isActive: false,
  permissions: [],
};

function getInitialAuthState(): {
  currentUser: UserProfile & { permissions: PermissionKey[] };
  token: string | null;
  isAuthenticated: boolean;
} {
  try {
    const savedToken = localStorage.getItem('spwn_session_token');
    const savedUserStr = localStorage.getItem('spwn_session_user');
    if (savedToken && savedToken.indexOf('SPWN-SES-') === 0 && savedUserStr) {
      const user = JSON.parse(savedUserStr);
      if (user && user.role && user.role !== ROLES.PUBLIC_USER) {
        return {
          currentUser: {
            ...user,
            permissions: Array.isArray(user.permissions) ? user.permissions : [],
          },
          token: savedToken,
          isAuthenticated: true,
        };
      }
    }
  } catch (e) {
    console.warn('Gagal memulihkan sesi login dari penyimpanan lokal', e);
  }

  try {
    const savedToken = localStorage.getItem('spwn_session_token');
    if (savedToken && savedToken.indexOf('SPWN-SES-') !== 0) {
      localStorage.removeItem('spwn_session_token');
      localStorage.removeItem('spwn_session_user');
    }
  } catch { /* Penyimpanan lokal tidak tersedia; mulai sebagai publik. */ }

  // Publik sebagai kondisi default saat web pertama kali dibuka
  return {
    currentUser: EMPTY_PUBLIC_USER,
    token: null,
    isAuthenticated: false,
  };
}

interface AuthState {
  currentUser: UserProfile & { permissions: PermissionKey[] };
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  switchRole: (role: UserRole) => void;
  loginAs: (role: UserRole) => void;
  loginWithCredentials: (identifier: string, password: string) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  setSession: (user: UserProfile & { permissions?: PermissionKey[] }, token: string) => void;
  logout: () => void;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => void;
  resetCurrentUserPassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  
  // Permission helper
  hasPermission: (permission: PermissionKey) => boolean;
  hasAnyPermission: (permissions: PermissionKey[]) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const initialAuth = getInitialAuthState();

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: initialAuth.currentUser,
  token: initialAuth.token,
  isAuthenticated: initialAuth.isAuthenticated,

  // Compatibilidade temporária com componentes antigos: troca de papel/demo login desativados.
  switchRole: (_role: UserRole) => {
    get().logout();
  },

  loginAs: (_role: UserRole) => {
    get().logout();
  },

  loginWithCredentials: async (identifier: string, password: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password;

    if (!cleanId || !cleanPass) {
      return { success: false, message: 'Username / Email / Nomor KTA dan Kata Sandi wajib diisi.' };
    }

    // Autentikasi produksi hanya melalui GAS. Jangan menerbitkan token mock
    // karena token tersebut tidak pernah terdaftar di CacheService backend.
    try {
      const res = await authApi.login({
        username: cleanId,
        password: cleanPass,
      });

      const data: any = res && res.data;
      const gasUser = data && (data.user || data);
      const token = data && data.token;

      if (!res || !res.success || !gasUser || !token || !gasUser.id || !gasUser.role) {
        return {
          success: false,
          message: (res && res.message) || 'Login GAS tidak mengembalikan sesi dan identitas pengguna yang valid. Periksa respons backend.',
        };
      }

      const role = gasUser.role as UserRole;
      const mappedProfile: UserProfile = {
        id: String(gasUser.id || ''),
        username: gasUser.username || gasUser.nama || gasUser.fullName || cleanId,
        email: gasUser.email || cleanId,
        fullName: gasUser.fullName || gasUser.full_name || gasUser.nama || gasUser.username || cleanId,
        role,
        roleName: gasUser.roleName || role,
        memberId: gasUser.memberId || gasUser.member_id || gasUser.id || '',
        nomor_kta: gasUser.nomorKTA || gasUser.nomor_kta || gasUser.no_kta || '',
        no_kta: gasUser.no_kta || gasUser.nomor_kta || gasUser.nomorKTA || '',
        province: gasUser.province || gasUser.kwartir_daerah || '',
        provinceId: gasUser.provinsi_id || '',
        kridaName: gasUser.kridaName || gasUser.krida || '',
        membershipLevel: gasUser.membershipLevel || gasUser.position || gasUser.tingkatan || '',
        isActive: gasUser.isActive !== false,
        avatarUrl: gasUser.avatarUrl || gasUser.foto_url || gasUser.photo_url || gasUser.foto || '',
        permissions: gasUser.permissions || [],
      } as UserProfile;

      if (!mappedProfile.id) {
        return { success: false, message: 'Login GAS tidak mengembalikan ID pengguna. Sesi tidak disimpan.' };
      }

      get().setSession(mappedProfile, String(token));
      return { success: true, message: 'Login berhasil melalui GAS.', user: mappedProfile };
    } catch (apiErr: any) {
      console.warn('Otentikasi GAS API gagal:', apiErr && apiErr.message ? apiErr.message : apiErr);
      return {
        success: false,
        message: (apiErr && apiErr.message) || 'Tidak dapat memverifikasi akun ke GAS. Periksa koneksi dan deployment backend.',
      };
    }
  },

  setSession: (user, token) => {
    // Permission hanya berasal dari respons backend; jangan memberi hak akses default di frontend.
    const permissions = Array.isArray(user.permissions) ? user.permissions : [];
      
    try {
      localStorage.setItem('spwn_session_token', token);
      localStorage.setItem('spwn_session_user', JSON.stringify({ ...user, permissions }));
    } catch (e) {
      console.warn('Failed saving auth to localStorage', e);
    }

    set({
      currentUser: { ...user, permissions },
      token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    try {
      localStorage.removeItem('spwn_session_token');
      localStorage.removeItem('spwn_session_user');
    } catch (e) {
      console.warn('Failed clearing auth from localStorage', e);
    }

    set({
      currentUser: EMPTY_PUBLIC_USER,
      token: null,
      isAuthenticated: false,
    });
  },

  updateCurrentUserProfile: (updates: Partial<UserProfile>) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      ...updates,
    };

    try {
      localStorage.setItem('spwn_active_profile_' + currentUser.id, JSON.stringify(updatedUser));
      localStorage.setItem('spwn_session_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('Failed saving active profile', e);
    }

    set({ currentUser: updatedUser });
  },

  resetCurrentUserPassword: async (_oldPassword: string, _newPassword: string) => {
    return {
      success: false,
      message: 'Perubahan kata sandi lokal dinonaktifkan. Gunakan endpoint reset kata sandi resmi di backend GAS.',
    };
  },

  hasPermission: (permission: PermissionKey) => {
    const { currentUser } = get();
    if (!currentUser || !currentUser.permissions) return false;
    return currentUser.permissions.includes(permission);
  },

  hasAnyPermission: (permissions: PermissionKey[]) => {
    const { currentUser } = get();
    if (!currentUser || !currentUser.permissions) return false;
    return permissions.some(p => currentUser.permissions.includes(p));
  },

  hasRole: (roles: UserRole | UserRole[]) => {
    const { currentUser } = get();
    if (!currentUser) return false;
    if (Array.isArray(roles)) {
      return roles.includes(currentUser.role);
    }
    return currentUser.role === roles;
  }
}));
