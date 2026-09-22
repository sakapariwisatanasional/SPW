/**
 * SPWN Apps 2.0 (SAKA Pariwisata Network)
 * Digital Tourism Ecosystem Platform Indonesia
 * Clean Architecture Frontend Shell
 */

import React from 'react';
import { Sidebar } from './components/navigation/Sidebar';
import { Header } from './components/navigation/Header';
import { BottomNavigation } from './components/navigation/BottomNavigation';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { Badge } from './components/ui/Badge';
import { useUIStore } from './stores/uiStore';
import { useAuthStore } from './stores/authStore';
import { ROLES } from './config/constants';
import { cn } from './utils/cn';

// Feature Pages
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { MembershipPage } from './features/membership/pages/MembershipPage';
import { VerificationPage } from './features/membership/pages/VerificationPage';
import { PublicRegistrationPage } from './features/membership/pages/PublicRegistrationPage';
import { TourismPage } from './features/tourism/pages/TourismPage';
import { ContentPage } from './features/content/pages/ContentPage';
import { CommercePage } from './features/commerce/pages/CommercePage';
import { AnalyticsPage } from './features/analytics/pages/AnalyticsPage';
import { DesignSystemPage } from './features/design-system/pages/DesignSystemPage';
import { KridaDetailPage } from './features/krida/pages/KridaDetailPage';
import { SkkLearningCenterPage } from './features/skk/pages/SkkLearningCenterPage';
import { SkkDetailPage } from './features/skk/pages/SkkDetailPage';
import { MemberAchievementPage } from './features/achievement/pages/MemberAchievementPage';
import { AdminPortalPage } from './features/admin/pages/AdminPortalPage';
import { CodeManagerPage } from './features/developer/pages/CodeManagerPage';
import { useKridaStore } from './stores/kridaStore';
import { MemberLayout } from './layouts/MemberLayout';

export default function App() {
  const { activeView, setActiveView, isQuickActionModalOpen, setQuickActionModalOpen, isSidebarCollapsed } = useUIStore();
  const { currentUser, switchRole } = useAuthStore();

  // Mode Anggota: Gunakan Member Application Shell (MemberLayout.tsx)
  if (currentUser.role === ROLES.MEMBER) {
    return (
      <MemberLayout
        activeTab={activeView}
        onTabChange={(tabId) => setActiveView(tabId)}
      />
    );
  }

  // Role Access Guard
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardPage />;
      case 'membership':
        if (currentUser.role === ROLES.PUBLIC_USER) {
          return (
            <div className="py-16 text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                🔒
              </div>
              <h2 className="text-lg font-bold text-slate-900">Akses Terbatas untuk Anggota & Pengurus</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Anda sedang menggunakan persona <strong>Public User (Tamu)</strong>. Untuk mengakses direktori keanggotaan dan KTA, silakan simulasikan login sebagai Member atau Admin.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <Button size="sm" variant="primary" onClick={() => switchRole(ROLES.MEMBER)}>
                  Login Sebagai Member
                </Button>
                <Button size="sm" variant="outline" onClick={() => setActiveView('kta-verification')}>
                  Verifikasi KTA Publik
                </Button>
              </div>
            </div>
          );
        }
        return <MembershipPage />;
      case 'kta-verification':
      case 'verifikasi':
        return <VerificationPage />;
      case 'registration':
      case 'daftar':
      case 'register':
      case '/daftar':
        return <PublicRegistrationPage />;
      case 'tourism':
        return <TourismPage />;
      case 'content':
        return <ContentPage />;
      case 'commerce':
        return <CommercePage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'admin-portal':
      case 'admin':
      case '/admin':
        return <AdminPortalPage />;
      case '/superadmin/developer/code-manager':
      case 'superadmin-code-manager':
      case 'developer-code-manager':
      case 'code-manager':
        return <CodeManagerPage />;
      case 'design-system':
        return <DesignSystemPage />;
      case 'skk-learning':
      case 'skk':
        return <SkkLearningCenterPage />;
      case 'member-achievement':
      case 'pencapaian':
      case '/member/pencapaian':
        return <MemberAchievementPage />;
      default:
        // Handle dynamic Krida views (e.g., 'krida-pemandu', 'krida-penyuluh', etc.)
        if (activeView.startsWith('krida-')) {
          const slug = activeView.replace('krida-', '');
          return <KridaDetailPage kridaSlug={slug} />;
        }
        // Handle dynamic SKK views (e.g., 'skk-pm-01')
        if (activeView.startsWith('skk-')) {
          const code = activeView.replace('skk-', '').toUpperCase();
          return <SkkDetailPage skkCode={code} />;
        }
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 flex">
      {/* Dynamic Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={cn("flex-1 flex flex-col min-w-0 transition-all duration-300", isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        {/* Sticky Header */}
        <Header />

        {/* Page View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8">
          {renderActiveView()}
        </main>

        {/* Mobile Navigation */}
        <BottomNavigation />
      </div>

      {/* Quick Action & Notification Modal */}
      <Modal
        isOpen={isQuickActionModalOpen}
        onClose={() => setQuickActionModalOpen(false)}
        title="Pusat Notifikasi & Aksi Cepat"
        description="Ringkasan sinkronisasi dan aktivitas ekosistem terbaru."
        footer={
          <Button variant="outline" size="sm" onClick={() => setQuickActionModalOpen(false)}>
            Tutup
          </Button>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#009B4D] mt-1 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-950">Gateway Google Apps Script Terkoneksi</p>
              <p className="text-emerald-700 text-[11px] mt-0.5">
                Penyimpanan data Sheets beroperasi normal dengan sinkronisasi otomatis.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#0066B3] mt-1 shrink-0" />
            <div>
              <p className="font-semibold text-blue-950">12 Permohonan Verifikasi KTA Baru</p>
              <p className="text-blue-700 text-[11px] mt-0.5">
                Kwarda Jawa Barat & Jawa Timur menunggu validasi admin wilayah.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
