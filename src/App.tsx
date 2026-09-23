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
import { useUIStore } from './stores/uiStore';
import { useAuthStore } from './stores/authStore';
import { ROLES } from './config/constants';
import { cn } from './utils/cn';

// Auth Components
import { LoginModal } from './components/auth/LoginModal';
import { AuthAccessBarrier } from './components/auth/AuthAccessBarrier';

// Feature Pages
import { PublicHomePage } from './features/home/pages/PublicHomePage';
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
import { MemberLayout } from './layouts/MemberLayout';
import { PublicLayout } from './layouts/PublicLayout';

export default function App() {
  const {
    activeView,
    setActiveView,
    isQuickActionModalOpen,
    setQuickActionModalOpen,
    isLoginModalOpen,
    setLoginModalOpen,
    isSidebarCollapsed,
  } = useUIStore();
  const { currentUser, isAuthenticated } = useAuthStore();

  const isPublicUser = !isAuthenticated || currentUser.role === ROLES.PUBLIC_USER;

  // Role Access Guard
  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
      case '/':
        return <PublicHomePage />;

      case 'dashboard':
        if (isPublicUser) {
          return (
            <AuthAccessBarrier
              featureName="Dashboard Ekosistem"
              requiredRole="Pengurus / Anggota SAKA"
            />
          );
        }
        return <DashboardPage />;

      case 'membership':
        if (isPublicUser) {
          return (
            <AuthAccessBarrier
              featureName="Direktori Keanggotaan & KTA"
              requiredRole="Pengurus Kwarda / Kwarcab atau Anggota"
            />
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
        if (isPublicUser) {
          return (
            <AuthAccessBarrier
              featureName="Analitik & Telemetri"
              requiredRole="Administrator Regional / Nasional"
            />
          );
        }
        return <AnalyticsPage />;

      case 'admin-portal':
      case 'admin':
      case '/admin':
        if (isPublicUser) {
          return (
            <AuthAccessBarrier
              featureName="Portal Administrator"
              requiredRole="Super Admin / Admin Wilayah"
            />
          );
        }
        return <AdminPortalPage />;

      case '/superadmin/developer/code-manager':
      case 'superadmin-code-manager':
      case 'developer-code-manager':
      case 'code-manager':
        if (isPublicUser || currentUser.role !== ROLES.SUPER_ADMIN) {
          return (
            <AuthAccessBarrier
              featureName="Code Registry Developer"
              requiredRole="Super Admin (Kwarnas)"
            />
          );
        }
        return <CodeManagerPage />;

      case 'design-system':
        return <DesignSystemPage />;

      case 'skk-learning':
      case 'skk':
        return <SkkLearningCenterPage />;

      case 'member-achievement':
      case 'pencapaian':
      case '/member/pencapaian':
        if (isPublicUser) {
          return (
            <AuthAccessBarrier
              featureName="Pencapaian & Lencana Anggota"
              requiredRole="Anggota SAKA Pariwisata Terdaftar"
            />
          );
        }
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
        return isPublicUser ? <PublicHomePage /> : <DashboardPage />;
    }
  };

  // Mode Publik: Pengunjung umum mendapatkan PublicLayout (Wonderful Indonesia portal)
  if (isPublicUser) {
    return (
      <>
        <PublicLayout
          activeNav={activeView}
          onNavigate={(navId) => setActiveView(navId)}
        >
          {renderActiveView()}
        </PublicLayout>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setLoginModalOpen(false)}
        />
      </>
    );
  }

  // Mode Anggota: Gunakan Member Application Shell (MemberLayout.tsx)
  if (currentUser.role === ROLES.MEMBER) {
    return (
      <>
        <MemberLayout
          activeTab={activeView}
          onTabChange={(tabId) => setActiveView(tabId)}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setLoginModalOpen(false)}
        />
      </>
    );
  }

  // Mode Administrator & Pengurus: Gunakan Admin Management Console Shell
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 flex overflow-x-hidden w-full max-w-full">
      {/* Dynamic Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={cn("flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-x-hidden w-full max-w-full", isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        {/* Sticky Header */}
        <Header />

        {/* Page View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8 overflow-x-hidden">
          {renderActiveView()}
        </main>

        {/* Mobile Navigation */}
        <BottomNavigation />
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

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
