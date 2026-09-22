/**
 * SPWN Apps 2.0 - Central Routing Engine & Route Guards
 * Location: src/routes/index.tsx
 * -----------------------------------------------------------
 * Menyediakan pemetaan rute dinamis yang bersih:
 * - Public Routes: Beranda, Wisata, Warta, Kedai, Cek KTA
 * - Member Protected Routes: Dashboard, KTA Digital, Profil, Warta Saya, Pesanan
 * - Admin Protected Routes: RBAC Guarded (SUPER_ADMIN, ADMIN_PUSAT, ADMIN_WILAYAH, dll)
 */

import React from 'react';
import { ROUTE_PATHS } from './routePaths';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicLayout } from '../layouts/PublicLayout';
import { MemberLayout } from '../layouts/MemberLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ErrorLayout } from '../layouts/ErrorLayout';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { ROLES } from '../config/constants';

// Komponen Rute Router Core
export const AppRouter: React.FC<{
  activeRoute: string;
  onRouteChange: (newRoute: string) => void;
  childrenMap: Record<string, React.ReactNode>;
}> = ({ activeRoute, onRouteChange, childrenMap }) => {
  const { currentUser } = useAuthStore();

  // 1. Error Routes
  if (activeRoute === ROUTE_PATHS.ERROR_403) {
    return (
      <ErrorLayout
        type="403"
        onGoHome={() => onRouteChange(ROUTE_PATHS.HOME)}
        onGoBack={() => window.history.back()}
      />
    );
  }
  if (activeRoute === ROUTE_PATHS.ERROR_500) {
    return (
      <ErrorLayout
        type="500"
        onGoHome={() => onRouteChange(ROUTE_PATHS.HOME)}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // 2. Member Protected Routes (/member/*)
  if (activeRoute.startsWith('/member')) {
    return (
      <ProtectedRoute requireAuth={true} onAccessDenied={() => onRouteChange(ROUTE_PATHS.HOME)}>
        <MemberLayout
          activeTab={activeRoute.replace('/member/', '') || 'dashboard'}
          onTabChange={(tabId) => onRouteChange(`/member/${tabId}`)}
        >
          {childrenMap[activeRoute] || childrenMap['/member/dashboard'] || (
            <ErrorLayout type="404" onGoHome={() => onRouteChange(ROUTE_PATHS.HOME)} />
          )}
        </MemberLayout>
      </ProtectedRoute>
    );
  }

  // 3. Admin Protected Routes (/admin/*)
  if (activeRoute.startsWith('/admin')) {
    const adminSegment = activeRoute.replace('/admin/', '') || 'dashboard';
    return (
      <ProtectedRoute
        roles={[
          ROLES.SUPER_ADMIN,
          ROLES.ADMIN_PUSAT,
          ROLES.ADMIN_WILAYAH,
          ROLES.CONTENT_MANAGER,
          ROLES.TOURISM_MANAGER,
          ROLES.COMMERCE_MANAGER,
        ]}
        onAccessDenied={() => onRouteChange(ROUTE_PATHS.HOME)}
      >
        <AdminLayout
          activeNav={adminSegment}
          onNavigate={(navId) => onRouteChange(`/admin/${navId}`)}
          pageTitle={`Admin • ${currentUser.roleName}`}
        >
          {childrenMap[activeRoute] || childrenMap['/admin/dashboard'] || (
            <ErrorLayout type="404" onGoHome={() => onRouteChange(ROUTE_PATHS.ADMIN_DASHBOARD)} />
          )}
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  // 4. Default: Public Layout Shell
  const publicSegment = activeRoute === '/' ? 'home' : activeRoute.replace('/', '');
  return (
    <PublicLayout
      activeNav={publicSegment}
      onNavigate={(navId) => {
        if (navId === 'home') onRouteChange(ROUTE_PATHS.HOME);
        else if (navId === 'admin-dashboard') onRouteChange(ROUTE_PATHS.ADMIN_DASHBOARD);
        else if (navId === 'member-dashboard') onRouteChange(ROUTE_PATHS.MEMBER_DASHBOARD);
        else if (navId === 'verification' || navId === 'verifikasi') onRouteChange(ROUTE_PATHS.VERIFY_KTA);
        else onRouteChange(`/${navId}`);
      }}
    >
      {childrenMap[activeRoute] || (activeRoute === ROUTE_PATHS.VERIFY_KTA ? childrenMap[ROUTE_PATHS.VERIFY_KTA] : null) || childrenMap[ROUTE_PATHS.HOME] || (
        <ErrorLayout type="404" onGoHome={() => onRouteChange(ROUTE_PATHS.HOME)} />
      )}
    </PublicLayout>
  );
};
