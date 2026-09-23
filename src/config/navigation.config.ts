/**
 * SPWN Apps 2.0 - Role-Based Navigation Configuration
 */

import { ROLES, type UserRole } from "./constants";

export interface NavigationItem {
  id: string;
  label: string;
  iconName: string;
  path: string;
  badge?: string;
  roles: UserRole[];
  category?: 'main' | 'ecosystem' | 'management' | 'system';
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  // Beranda Publik / Home
  {
    id: 'home',
    label: 'Beranda SAKA',
    iconName: 'Home',
    path: '/',
    roles: [
      ROLES.PUBLIC_USER,
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN_PUSAT,
      ROLES.ADMIN_WILAYAH,
      ROLES.CONTENT_MANAGER,
      ROLES.TOURISM_MANAGER,
      ROLES.COMMERCE_MANAGER,
      ROLES.MEMBER,
    ],
    category: 'main',
  },
  // General & Dashboard
  {
    id: 'dashboard',
    label: 'Dashboard Ekosistem',
    iconName: 'LayoutDashboard',
    path: '/dashboard',
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN_PUSAT,
      ROLES.ADMIN_WILAYAH,
      ROLES.CONTENT_MANAGER,
      ROLES.TOURISM_MANAGER,
      ROLES.COMMERCE_MANAGER,
      ROLES.MEMBER,
    ],
    category: 'main',
  },
  
  // Membership & Identity
  {
    id: 'registration',
    label: 'Pendaftaran Anggota',
    iconName: 'UserPlus',
    path: '/daftar',
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN_PUSAT,
      ROLES.ADMIN_WILAYAH,
      ROLES.PUBLIC_USER,
      ROLES.MEMBER,
    ],
    category: 'ecosystem',
  },
  {
    id: 'membership',
    label: 'Keanggotaan & KTA',
    iconName: 'Users',
    path: '/membership',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT, ROLES.ADMIN_WILAYAH, ROLES.MEMBER],
    category: 'ecosystem',
  },
  {
    id: 'skk-learning',
    label: 'SKK Learning Center',
    iconName: 'GraduationCap',
    path: '/skk',
    badge: '23 SKK',
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN_PUSAT,
      ROLES.ADMIN_WILAYAH,
      ROLES.CONTENT_MANAGER,
      ROLES.TOURISM_MANAGER,
      ROLES.COMMERCE_MANAGER,
      ROLES.MEMBER,
      ROLES.PUBLIC_USER,
    ],
    category: 'ecosystem',
  },
  {
    id: 'member-achievement',
    label: 'Pencapaian Saya',
    iconName: 'Award',
    path: '/member/pencapaian',
    badge: 'Madya',
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN_PUSAT,
      ROLES.ADMIN_WILAYAH,
      ROLES.MEMBER,
    ],
    category: 'ecosystem',
  },
  {
    id: 'kta-verification',
    label: 'Verifikasi KTA Publik',
    iconName: 'QrCode',
    path: '/verify',
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN_PUSAT,
      ROLES.ADMIN_WILAYAH,
      ROLES.CONTENT_MANAGER,
      ROLES.TOURISM_MANAGER,
      ROLES.COMMERCE_MANAGER,
      ROLES.MEMBER,
      ROLES.PUBLIC_USER,
    ],
    category: 'ecosystem',
  },

  // Tourism Explorer & Marketplace
  {
    id: 'tourism',
    label: 'Pariwisata & Destinasi',
    iconName: 'Compass',
    path: '/tourism',
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN_PUSAT,
      ROLES.ADMIN_WILAYAH,
      ROLES.TOURISM_MANAGER,
      ROLES.MEMBER,
      ROLES.PUBLIC_USER,
    ],
    category: 'ecosystem',
  },

  // Content Management System
  {
    id: 'content',
    label: 'Konten & Agenda CMS',
    iconName: 'Newspaper',
    path: '/content',
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN_PUSAT,
      ROLES.CONTENT_MANAGER,
      ROLES.MEMBER,
      ROLES.PUBLIC_USER,
    ],
    category: 'ecosystem',
  },

  // Tourism Commerce Marketplace
  {
    id: 'commerce',
    label: 'Pasar Wisata & UMKM',
    iconName: 'ShoppingBag',
    path: '/commerce',
    badge: 'Kriya & Rasa',
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN_PUSAT,
      ROLES.COMMERCE_MANAGER,
      ROLES.MEMBER,
      ROLES.PUBLIC_USER,
    ],
    category: 'ecosystem',
  },

  // Admin Portal & Ekosistem Wilayah
  {
    id: 'admin-portal',
    label: 'Portal Admin SPWN',
    iconName: 'ShieldCheck',
    path: '/admin',
    badge: 'KTA & Wilayah',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT, ROLES.ADMIN_WILAYAH],
    category: 'management',
  },

  // Analytics
  {
    id: 'analytics',
    label: 'Analitik & Telemetri',
    iconName: 'BarChart3',
    path: '/analytics',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT, ROLES.ADMIN_WILAYAH],
    category: 'management',
  },

  // Foundation & Design System Showcase
  {
    id: 'design-system',
    label: 'Design System & UI Library',
    iconName: 'Palette',
    path: '/design-system',
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN_PUSAT,
      ROLES.ADMIN_WILAYAH,
      ROLES.CONTENT_MANAGER,
      ROLES.TOURISM_MANAGER,
      ROLES.COMMERCE_MANAGER,
      ROLES.MEMBER,
      ROLES.PUBLIC_USER,
    ],
    category: 'system',
  },

  // Developer & System Engineering (Phase 7.1 - Super Admin Exclusive)
  {
    id: '/superadmin/developer/code-manager',
    label: 'Code Registry & GAS',
    iconName: 'Code2',
    path: '/superadmin/developer/code-manager',
    badge: 'Super Admin',
    roles: [ROLES.SUPER_ADMIN],
    category: 'system',
  },
];
