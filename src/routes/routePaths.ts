/**
 * SPWN Apps 2.0 - Centralized Route Paths
 * Location: src/routes/routePaths.ts
 */

export const ROUTE_PATHS = {
  // Public Paths
  HOME: '/',
  TOURISM: '/wisata',
  TOURISM_DETAIL: '/wisata/:id',
  NEWS: '/warta',
  NEWS_DETAIL: '/warta/:slug',
  SHOP: '/kedai',
  VERIFY_KTA: '/verifikasi',
  SKK_LEARNING: '/skk',
  KRIDA_DETAIL: '/krida/:slug',
  SKK_DETAIL: '/krida/:slug/skk/:kode',
  LOGIN: '/login',

  // Member Protected Paths (/member/*)
  MEMBER_ROOT: '/member',
  MEMBER_DASHBOARD: '/member/dashboard',
  MEMBER_ACHIEVEMENT: '/member/pencapaian',
  MEMBER_KTA: '/member/kta',
  MEMBER_PROFILE: '/member/profil',
  MEMBER_ORDERS: '/member/pesanan',
  MEMBER_WRITE_NEWS: '/member/warta/tulis',
  MEMBER_AGENDA: '/member/agenda',

  // Admin Protected Paths (/admin/*)
  ADMIN_ROOT: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_MEMBERS: '/admin/anggota',
  ADMIN_VERIFY: '/admin/verifikasi',
  ADMIN_TOURISM: '/admin/destinasi',
  ADMIN_CONTENT: '/admin/warta',
  ADMIN_COMMERCE: '/admin/kedai',
  ADMIN_AUDIT: '/admin/audit',

  // Error Paths
  ERROR_403: '/error/403',
  ERROR_404: '/error/404',
  ERROR_500: '/error/500',
} as const;

export type RoutePathKey = keyof typeof ROUTE_PATHS;
