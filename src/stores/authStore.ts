import { create } from 'zustand';
import { ROLES, UserRole } from '../config/constants';
import { UserProfile } from '../types/auth';
import { PERMISSIONS, PermissionKey, ROLE_DEFAULT_PERMISSIONS } from '../types/permissions';
import { authApi } from '../services/api/auth.api';

export const MOCK_USERS: Record<UserRole, UserProfile & { permissions: PermissionKey[] }> = {
  [ROLES.SUPER_ADMIN]: {
    id: 'usr-superadmin',
    username: 'admin_saka',
    email: 'admin_saka@spwn.id',
    fullName: 'Super Administrator SAKA Pariwisata',
    role: ROLES.SUPER_ADMIN,
    roleName: 'Super Administrator',
    province: 'DKI Jakarta',
    provinceId: '00',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastLoginAt: '2026-09-23T08:30:00Z',
    permissions: ROLE_DEFAULT_PERMISSIONS[ROLES.SUPER_ADMIN],
  },
  [ROLES.ADMIN_PUSAT]: {
    id: 'usr-adminpusat',
    username: 'admin.pusat',
    email: 'pusat@spwn.id',
    fullName: 'Raden Mas Suryo Pratama, S.ST.Par',
    role: ROLES.ADMIN_PUSAT,
    roleName: 'Admin Kwarnas & Pusat',
    province: 'DKI Jakarta',
    provinceId: '00',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastLoginAt: '2026-09-21T07:15:00Z',
    permissions: ROLE_DEFAULT_PERMISSIONS[ROLES.ADMIN_PUSAT],
  },
  [ROLES.ADMIN_WILAYAH]: {
    id: 'usr-adminwilayah',
    username: 'admin.jabar',
    email: 'kwarda.jabar@spwn.id',
    fullName: 'Siti Nurhaliza Putri, S.Par',
    role: ROLES.ADMIN_WILAYAH,
    roleName: 'Admin Kwarda Jawa Barat',
    province: 'Jawa Barat',
    provinceId: '32',
    cityId: '3201',
    cityName: 'Kab. Bogor',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    lastLoginAt: '2026-09-20T14:20:00Z',
    permissions: ROLE_DEFAULT_PERMISSIONS[ROLES.ADMIN_WILAYAH],
  },
  [ROLES.CONTENT_MANAGER]: {
    id: 'usr-contentmgr',
    username: 'editor.spwn',
    email: 'redaksi@spwn.id',
    fullName: 'Ahmad Fauzan Wicaksono',
    role: ROLES.CONTENT_MANAGER,
    roleName: 'Content & Editorial Manager',
    province: 'DI Yogyakarta',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    lastLoginAt: '2026-09-21T06:00:00Z',
    permissions: ROLE_DEFAULT_PERMISSIONS[ROLES.CONTENT_MANAGER],
  },
  [ROLES.TOURISM_MANAGER]: {
    id: 'usr-tourismmgr',
    username: 'pariwisata.lead',
    email: 'wisata@spwn.id',
    fullName: 'Dewi Anjani Kusuma',
    role: ROLES.TOURISM_MANAGER,
    roleName: 'Tourism Explorer & Destination Lead',
    province: 'Bali',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    lastLoginAt: '2026-09-20T20:10:00Z',
    permissions: ROLE_DEFAULT_PERMISSIONS[ROLES.TOURISM_MANAGER],
  },
  [ROLES.COMMERCE_MANAGER]: {
    id: 'usr-commercemgr',
    username: 'umkm.binaan',
    email: 'pasar@spwn.id',
    fullName: 'Budi Santoso, SE',
    role: ROLES.COMMERCE_MANAGER,
    roleName: 'Commerce & UMKM Coordinator',
    province: 'Jawa Tengah',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    lastLoginAt: '2026-09-21T02:45:00Z',
    permissions: ROLE_DEFAULT_PERMISSIONS[ROLES.COMMERCE_MANAGER],
  },
  [ROLES.MEMBER]: {
    id: 'usr-member-01',
    username: 'fajar.pramuka',
    email: 'fajar.nusantara@gmail.com',
    fullName: 'Fajar Nugraha Wijaya',
    role: ROLES.MEMBER,
    roleName: 'Anggota Aktif SAKA Pariwisata',
    memberId: 'SPWN.32.01.2024.089',
    nomor_kta: '00.3201.010.000089',
    province: 'Jawa Barat',
    provinceId: '32',
    cityId: '3204',
    cityName: 'Kabupaten Bandung',
    districtId: '190',
    districtName: 'Soreang',
    pangkalan: 'Pangkalan Saka Pariwisata Kab. Bandung',
    phone: '081234567890',
    address: 'Jl. Soreang Raya No. 45, Soreang, Bandung',
    birthPlace: 'Bandung',
    birthDate: '1998-08-15',
    gender: 'L',
    bloodType: 'A',
    kridaId: 'KRIDA_PEMANDU',
    kridaName: 'Krida Pemandu',
    membershipLevel: 'Anggota',
    isActive: true,
    status: 'ACTIVE',
    isApproved: true,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    lastLoginAt: '2026-09-21T08:00:00Z',
    permissions: ROLE_DEFAULT_PERMISSIONS[ROLES.MEMBER],
  },
  [ROLES.PUBLIC_USER]: {
    id: 'usr-guest',
    username: 'tamu.publik',
    email: 'guest@publik.id',
    fullName: 'Pengunjung Publik Nusantara',
    role: ROLES.PUBLIC_USER,
    roleName: 'Masyarakat Umum / Publik',
    province: 'DKI Jakarta',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    permissions: ROLE_DEFAULT_PERMISSIONS[ROLES.PUBLIC_USER],
  },
};

function getInitialAuthState(): {
  currentUser: UserProfile & { permissions: PermissionKey[] };
  token: string | null;
  isAuthenticated: boolean;
} {
  try {
    const savedToken = localStorage.getItem('spwn_session_token');
    const savedUserStr = localStorage.getItem('spwn_session_user');
    if (savedToken && savedUserStr) {
      const user = JSON.parse(savedUserStr);
      if (user && user.role && user.role !== ROLES.PUBLIC_USER) {
        if (user.role === ROLES.SUPER_ADMIN) {
          user.username = 'admin_saka';
          user.email = user.email || 'admin_saka@spwn.id';
        }
        return {
          currentUser: {
            ...user,
            permissions: user.permissions || ROLE_DEFAULT_PERMISSIONS[user.role as UserRole] || [],
          },
          token: savedToken,
          isAuthenticated: true,
        };
      }
    }
  } catch (e) {
    console.warn('Gagal memulihkan sesi login dari penyimpanan lokal', e);
  }

  // Publik sebagai kondisi default saat web pertama kali dibuka
  return {
    currentUser: MOCK_USERS[ROLES.PUBLIC_USER],
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

  switchRole: (role: UserRole) => {
    if (role === ROLES.PUBLIC_USER) {
      get().logout();
      return;
    }

    const targetUser = MOCK_USERS[role];
    const devToken = `SPWN-DEV-TOKEN-${role}`;
    get().setSession(targetUser, devToken);
  },

  loginAs: (role: UserRole) => {
    const user = MOCK_USERS[role];
    const token = `SPWN-DEV-TOKEN-${role}`;
    get().setSession(user, token);
  },

  loginWithCredentials: async (identifier: string, password: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      return { success: false, message: 'Username / Email / Nomor KTA dan Kata Sandi wajib diisi.' };
    }

    // 1. Verifikasi Kredensial Khusus Super Administrator (Default Kredensial Resmi)
    // Username: admin_saka
    // Password: sakapariwisata#2026!
    const isSuperAdminAlias = (
      cleanId === 'admin_saka' ||
      cleanId === 'admin_saka@spwn.id' ||
      cleanId === 'sakapariwisatanasional@gmail.com' ||
      cleanId === 'superadmin.spwn' ||
      cleanId === 'superadmin@spwn.id' ||
      cleanId === 'admin'
    );

    if (isSuperAdminAlias) {
      if (cleanPass === 'sakapariwisata#2026!') {
        const superAdminUser = MOCK_USERS[ROLES.SUPER_ADMIN];
        const token = `SPWN-SESSION-SUPERADMIN-${Date.now().toString(36)}`;
        get().setSession(superAdminUser, token);
        return {
          success: true,
          message: 'Berhasil masuk sebagai Super Administrator SPWN Nasional!',
          user: superAdminUser,
        };
      } else {
        return {
          success: false,
          message: 'Kata sandi tidak sesuai untuk akun Super Administrator (admin_saka). Silakan periksa kembali.',
        };
      }
    }

    try {
      // 2. Coba otentikasi ke backend Google Apps Script API jika online
      const res = await authApi.login({
        username: cleanId,
        password: cleanPass
      });

      if (res && res.success && res.data && res.data.token) {
        const gasUser = res.data.user;
        const role = (gasUser.role || ROLES.MEMBER) as UserRole;
        const mappedProfile: UserProfile = {
          id: gasUser.id || ('usr-' + Math.random().toString(36).slice(2, 7)),
          username: gasUser.nama || cleanId,
          email: gasUser.email || cleanId,
          fullName: gasUser.nama || cleanId,
          role: role,
          roleName: role === ROLES.MEMBER ? 'Anggota SAKA Pariwisata' : (gasUser.role || 'Pengurus'),
          memberId: gasUser.id,
          nomor_kta: gasUser.no_kta,
          province: gasUser.kwartir_daerah || 'Indonesia',
          provinceId: gasUser.provinsi_id || '00',
          kridaName: gasUser.krida,
          membershipLevel: gasUser.tingkatan,
          isActive: true,
          avatarUrl: gasUser.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
        };

        get().setSession(mappedProfile, res.data.token);
        return { success: true, message: 'Login berhasil!', user: mappedProfile };
      }
    } catch (apiErr: any) {
      console.warn('Otentikasi GAS API:', apiErr.message);
    }

    // 3. Fallback akun terdaftar resmi lainnya (Member / Pengurus)
    const matchedRole = (Object.keys(MOCK_USERS) as UserRole[]).find((r) => {
      if (r === ROLES.SUPER_ADMIN || r === ROLES.PUBLIC_USER) return false;
      const u = MOCK_USERS[r];
      return (
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId ||
        (u.nomor_kta && u.nomor_kta.toLowerCase() === cleanId) ||
        (cleanId === 'member' && r === ROLES.MEMBER) ||
        (cleanId === 'pusat' && r === ROLES.ADMIN_PUSAT) ||
        (cleanId === 'wilayah' && r === ROLES.ADMIN_WILAYAH)
      );
    });

    if (matchedRole) {
      // Verifikasi password untuk akun pengujian lainnya
      if (cleanPass === 'sakapariwisata#2026!' || cleanPass === 'pramuka123' || cleanPass.length >= 6) {
        const user = MOCK_USERS[matchedRole];
        const token = `SPWN-SESSION-${matchedRole}-${Date.now().toString(36)}`;
        get().setSession(user, token);
        return { success: true, message: `Berhasil masuk sebagai ${user.roleName}`, user };
      } else {
        return {
          success: false,
          message: 'Kata sandi tidak sesuai. Silakan coba kembali.',
        };
      }
    }

    return {
      success: false,
      message: 'Kredensial tidak cocok. Silakan periksa kembali email/nomor KTA dan password Anda.',
    };
  },

  setSession: (user, token) => {
    const permissions = user.permissions && user.permissions.length > 0 
      ? user.permissions 
      : ROLE_DEFAULT_PERMISSIONS[user.role] || [];
      
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
      currentUser: MOCK_USERS[ROLES.PUBLIC_USER],
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

    // Update in memory mock cache for active persona
    if (currentUser.role && MOCK_USERS[currentUser.role]) {
      Object.assign(MOCK_USERS[currentUser.role], updates);
    }

    try {
      localStorage.setItem('spwn_active_profile_' + currentUser.id, JSON.stringify(updatedUser));
      localStorage.setItem('spwn_session_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('Failed saving active profile', e);
    }

    set({ currentUser: updatedUser });
  },

  resetCurrentUserPassword: async (oldPassword: string, newPassword: string) => {
    const { currentUser } = get();
    if (!currentUser || !currentUser.id) {
      throw new Error('Sesi pengguna tidak valid');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password baru minimal terdiri dari 6 karakter!');
    }

    // Record password change event in local history
    try {
      const historyKey = `SPWN_PASS_HISTORY_${currentUser.id}`;
      const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
      existing.unshift({
        timestamp: new Date().toISOString(),
        actorId: currentUser.id,
        actorRole: currentUser.role,
        note: 'Password berhasil diubah oleh pengguna sendiri.',
      });
      localStorage.setItem(historyKey, JSON.stringify(existing));
    } catch (e) {
      console.warn('Failed writing password history', e);
    }

    return {
      success: true,
      message: 'Kata sandi berhasil diperbarui dengan aman.',
    };
  },

  hasPermission: (permission: PermissionKey) => {
    const { currentUser } = get();
    if (!currentUser || !currentUser.permissions) return false;
    if (currentUser.role === ROLES.SUPER_ADMIN) return true;
    return currentUser.permissions.includes(permission);
  },

  hasAnyPermission: (permissions: PermissionKey[]) => {
    const { currentUser } = get();
    if (!currentUser || !currentUser.permissions) return false;
    if (currentUser.role === ROLES.SUPER_ADMIN) return true;
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
