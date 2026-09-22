/**
 * ProtectedRoute
 * -----------------------------------------------------------------
 * Guard otorisasi rute berbasis Izin (Permission-Engine) & Peran (Role)
 * Sesuai Refinement 3: Mendukung <ProtectedRoute permission="CONTENT_PUBLISH">
 * Jika tidak berizin, menampilkan ErrorLayout 403 yang ramah pengguna.
 */

import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { PermissionKey } from '../types/permissions';
import { UserRole, ROLES } from '../config/constants';
import { ErrorLayout } from '../layouts/ErrorLayout';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  
  // Permission Based Authorization (Refinement 3)
  permission?: PermissionKey;
  anyPermission?: PermissionKey[];
  
  // Role Based Authorization (Fallback / Super Check)
  roles?: UserRole[];
  requireAuth?: boolean;
  
  // Custom Fallback Actions
  fallbackView?: React.ReactNode;
  onAccessDenied?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permission,
  anyPermission,
  roles,
  requireAuth = true,
  fallbackView,
  onAccessDenied,
}) => {
  const { currentUser, isAuthenticated, hasPermission, hasAnyPermission } = useAuthStore();

  // 1. Cek Apakah Memerlukan Otentikasi
  if (requireAuth && (!isAuthenticated || currentUser.role === ROLES.PUBLIC_USER)) {
    if (fallbackView) return <>{fallbackView}</>;

    return (
      <ErrorLayout
        type="403"
        title="Otentikasi Diperlukan"
        message="Silakan masuk menggunakan akun Anggota atau Pengurus SAKA Pariwisata untuk mengakses fitur ini."
        onGoHome={() => {
          if (onAccessDenied) onAccessDenied();
        }}
      />
    );
  }

  // 2. Super Admin Bypass: Super Admin memiliki akses mutlak ke seluruh modul
  if (currentUser.role === ROLES.SUPER_ADMIN) {
    return <>{children}</>;
  }

  // 3. Cek Specific Permission (Refinement 3)
  if (permission && !hasPermission(permission)) {
    if (fallbackView) return <>{fallbackView}</>;

    return (
      <ErrorLayout
        type="403"
        title="Akses Fitur Terbatas"
        message={`Akun Anda (${currentUser.roleName}) tidak memiliki hak akses otorisasi untuk melakukan tindakan ini.`}
        requiredPermission={permission}
        onGoBack={() => window.history.back()}
      />
    );
  }

  // 4. Cek Any of Multiple Permissions
  if (anyPermission && anyPermission.length > 0 && !hasAnyPermission(anyPermission)) {
    if (fallbackView) return <>{fallbackView}</>;

    return (
      <ErrorLayout
        type="403"
        title="Akses Fitur Terbatas"
        message="Akun Anda tidak memiliki satupun izin yang dipersyaratkan pada modul ini."
        requiredPermission={anyPermission.join(', ')}
        onGoBack={() => window.history.back()}
      />
    );
  }

  // 5. Cek Role Whitelist (jika disediakan)
  if (roles && roles.length > 0 && !roles.includes(currentUser.role)) {
    if (fallbackView) return <>{fallbackView}</>;

    return (
      <ErrorLayout
        type="403"
        title="Peran Akun Tidak Sesuai"
        message={`Modul ini dikhususkan bagi peran [${roles.join(', ')}]. Peran Anda saat ini: ${currentUser.roleName}.`}
        onGoBack={() => window.history.back()}
      />
    );
  }

  // Lolos seluruh verifikasi izin
  return <>{children}</>;
};
