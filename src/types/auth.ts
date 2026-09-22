import { UserRole, AdminTier } from "../config/constants";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  roleName: string;
  memberId?: string;
  adminTier?: AdminTier;
  adminTierLabel?: string;
  province?: string;
  provinceId?: string;
  cityId?: string;
  cityName?: string;
  districtId?: string;
  districtName?: string;
  pangkalan?: string;
  phone?: string;
  address?: string;
  birthPlace?: string;
  birthDate?: string;
  gender?: 'L' | 'P';
  bloodType?: string;
  kridaId?: string;
  kridaName?: string;
  membershipLevel?: string;
  isActive: boolean;
  lastLoginAt?: string;
  force_change_password?: boolean;
  nomor_kta?: string;
}

export interface AuthSession {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
}
