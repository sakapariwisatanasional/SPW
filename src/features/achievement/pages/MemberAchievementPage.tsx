/**
 * SPWN Apps 2.0 - Member Achievement Profile Page
 * Location: src/features/achievement/pages/MemberAchievementPage.tsx
 * ------------------------------------------------------------------
 * Halaman utama Profil Pencapaian Anggota SAKA Pariwisata (Read Model):
 * - Level Purwa / Madya / Utama
 * - Matriks SKK 4 Krida
 * - Perlindungan privasi nilai evaluasi (UU PDP)
 * - Lencana Digital
 * - Portofolio Partisipasi Kegiatan
 * - Empty State untuk anggota baru
 */

import React, { useEffect, useState } from 'react';
import { Award, Compass, RefreshCw, AlertCircle, Users, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useAchievementStore } from '../../../stores/achievementStore';
import { useAdminStore } from '../../admin/stores/adminStore';
import { ROLES } from '../../../config/constants';
import { AchievementHeader } from '../components/AchievementHeader';
import { AchievementSummaryCard } from '../components/AchievementSummaryCard';
import { KridaProgressCard } from '../components/KridaProgressCard';
import { BadgeCollection } from '../components/BadgeCollection';
import { ActivityHistory } from '../components/ActivityHistory';
import { AchievementEmptyState } from '../components/AchievementEmptyState';
import { SuperAdminAchievementView } from '../components/SuperAdminAchievementView';
import { Button } from '../../../components/ui';

export const MemberAchievementPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const {
    members: adminMembers,
    selectedMemberId,
    qaPerspective,
    scopeProvinceId,
    scopeRegencyId,
    scopeDistrictId,
    scopePangkalanId,
  } = useAdminStore();
  const {
    profile,
    skkItems,
    badges,
    activities,
    selectedKrida,
    isLoading,
    error,
    privacyScoreVisible,
    loadAchievement,
    setSelectedKrida,
    togglePrivacyView
  } = useAchievementStore();

  const isSuperAdmin = currentUser?.role === ROLES.SUPER_ADMIN || currentUser?.role === ROLES.ADMIN_PUSAT;
  const [viewMode, setViewMode] = useState<'superadmin' | 'personal'>(isSuperAdmin ? 'superadmin' : 'personal');


  useEffect(() => {
    if (isSuperAdmin) {
      setViewMode('superadmin');
    } else {
      setViewMode('personal');
    }
  }, [isSuperAdmin]);

  const qaMember = React.useMemo(() => {
    const list = Array.isArray(adminMembers) ? adminMembers : [];

    if (selectedMemberId) {
      const selected = list.find((m: any) =>
        String(m.id || m.member_id || '') === String(selectedMemberId)
      );
      if (selected) return selected;
    }

    if (qaPerspective !== 'ANGGOTA') return null;

    return list.find((m: any) => {
      if (
        scopeProvinceId !== 'ALL' &&
        String(m.provinsi_id || '') !== String(scopeProvinceId)
      ) return false;

      if (
        scopeRegencyId !== 'ALL' &&
        String(m.kabupaten_id || m.kabupaten_kota_id || '') !== String(scopeRegencyId)
      ) return false;

      if (
        scopeDistrictId !== 'ALL' &&
        String(m.kecamatan_id || m.wilayah_kecamatan_id || '') !== String(scopeDistrictId)
      ) return false;

      if (
        scopePangkalanId !== 'ALL' &&
        String(m.pangkalan_id || m.pangkalan_gudep || '') !== String(scopePangkalanId)
      ) return false;

      return true;
    }) || null;
  }, [
    adminMembers,
    selectedMemberId,
    qaPerspective,
    scopeProvinceId,
    scopeRegencyId,
    scopeDistrictId,
    scopePangkalanId,
  ]);

  const targetMemberId =
    qaMember?.id ||
    qaMember?.member_id ||
    qaMember?.no_kta ||
    qaMember?.nomor_kta ||
    (currentUser as any)?.memberProfile?.id ||
    (currentUser as any)?.memberProfile?.member_id ||
    (currentUser as any)?.memberId ||
    (currentUser as any)?.no_kta ||
    (currentUser as any)?.nomor_kta ||
    '';

  useEffect(() => {
    if (!targetMemberId) return;

    void loadAchievement(
      String(targetMemberId),
      currentUser?.role,
      (currentUser as any)?.memberId
    );
  }, [targetMemberId, currentUser?.role, loadAchievement]);

  const hasNoAchievements =
    profile &&
    profile.summary.completedSkk === 0 &&
    profile.summary.inProgressSkk === 0 &&
    badges.length === 0 &&
    activities.length === 0;

  const achievementAccess =
    (profile as any)?.access ||
    (profile as any)?.member?.capabilities ||
    {};

  const memberPosition = String(
    (profile as any)?.member?.position ||
    (profile as any)?.member?.jabatan ||
    achievementAccess?.position ||
    'ANGGOTA'
  ).trim().toUpperCase();

  const isAchievementParticipant =
    achievementAccess?.can_participate !== false &&
    (profile as any)?.member?.canParticipateAchievement !== false;

  const isPamong =
    memberPosition === 'PAMONG SAKA' ||
    memberPosition === 'PAMONG_SAKA';

  const isPinsaka =
    memberPosition === 'PIMPINAN SAKA' ||
    memberPosition === 'PINSAKA' ||
    memberPosition === 'PIMPINAN_SAKA';

  const isMabisaka =
    memberPosition === 'MABISAKA';

  // Jika SuperAdmin dalam mode Pantauan Seluruh Wilayah
  if (isSuperAdmin && viewMode === 'superadmin') {
    return (
      <div id="member-achievement-page" className="min-h-screen bg-slate-50/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <SuperAdminAchievementView onSwitchToPersonal={() => setViewMode('personal')} />
      </div>
    );
  }

  return (
    <div id="member-achievement-page" className="min-h-screen bg-slate-50/50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Banner Switcher untuk SuperAdmin bila sedang melihat profil pribadi */}
        {isSuperAdmin && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0066B3] text-white flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Mode: Pencapaian Pribadi (Super Administrator)
                </p>
                <p className="text-[11px] text-slate-500">
                  Anda sedang melihat profil pencapaian anggota dari GAS. Tidak ada profil demo atau ID fallback.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setViewMode('superadmin')}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer"
            >
              Kembali ke Pantauan Seluruh Wilayah
            </Button>
          </div>
        )}

        {/* Page Top Breadcrumb / Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5 text-[#0066B3]" />
              <span>Portal Anggota</span>
              <span>/</span>
              <span className="text-slate-800">Pencapaian & Portofolio</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-[#0066B3]" />
              Profil Pencapaian Kecakapan
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-refresh-achievement"
              onClick={() => {
                if (targetMemberId) {
                  void loadAchievement(
                    String(targetMemberId),
                    currentUser?.role,
                    (currentUser as any)?.memberId
                  );
                }
              }}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Muat Ulang Data</span>
            </button>
          </div>
        </div>

        {!targetMemberId && viewMode === 'personal' && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Identitas anggota GAS belum dipilih</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Halaman tidak lagi memakai ID anggota contoh. Pilih anggota nyata dari data GAS
                atau kembali ke Pantauan Seluruh Wilayah.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Gagal Memuat Profil Pencapaian</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !profile && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <RefreshCw className="w-8 h-8 text-[#0066B3] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Mengkalkulasi Read Model Pencapaian...</p>
            <p className="text-xs text-slate-500 mt-1">Mengagregasi data SKK, Badges, dan Riwayat Partisipasi</p>
          </div>
        )}

        {/* Main Content when profile is loaded */}
        {profile && (
          <>
            {/* Header Profil Anggota */}
            <AchievementHeader
              member={profile.member}
              isPrivacyScoreVisible={privacyScoreVisible}
              onTogglePrivacyView={togglePrivacyView}
            />

            {/* Jabatan struktural/pembina tidak menjadi peserta Krida/SKK */}
            {!isAchievementParticipant && (isPamong || isPinsaka || isMabisaka) ? (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-lg font-extrabold text-slate-900">
                      Mode Monitoring Pencapaian Anggota
                    </h2>

                    <p className="text-sm text-slate-700">
                      Jabatan <strong>{memberPosition}</strong> tidak mengikuti penyelesaian
                      Krida dan SKK sebagai peserta.
                    </p>

                    <p className="text-sm text-slate-600">
                      {isPamong
                        ? 'Pamong Saka bertugas mendampingi anggota, meninjau bukti/portofolio, serta melakukan verifikasi SKK anggota binaan sesuai kewenangannya.'
                        : 'Jabatan ini dapat melihat dan meninjau perkembangan pencapaian anggota sesuai wilayah kewenangannya, tanpa memiliki progres Krida/SKK pribadi.'}
                    </p>

                    <div className="pt-2 text-xs font-semibold text-blue-800">
                      Pencapaian pribadi dinonaktifkan oleh Rule of Truth GAS berdasarkan jabatan anggota.
                    </div>
                  </div>
                </div>
              </div>
            ) : hasNoAchievements ? (
              <div className="space-y-6">
                <AchievementEmptyState
                  memberNama={profile.member.nama}
                  onExploreCatalog={() => setSelectedKrida('pemandu')}
                  onContactPembina={() => {}}
                />

                {/* Tetap tampilkan preview silabus SKK agar anggota tahu apa yang dapat dipelajari */}
                <div className="opacity-90">
                  <KridaProgressCard
                    skkItems={skkItems}
                    selectedKrida={selectedKrida}
                    onSelectKrida={setSelectedKrida}
                    isPrivacyScoreVisible={privacyScoreVisible}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Summary Card & Metrik Level */}
                <AchievementSummaryCard
                  summary={profile.summary}
                  currentLevel={profile.member.level}
                />

                {/* 2. Matriks SKK & Krida Progress */}
                <KridaProgressCard
                  skkItems={skkItems}
                  selectedKrida={selectedKrida}
                  onSelectKrida={setSelectedKrida}
                  isPrivacyScoreVisible={privacyScoreVisible}
                />

                {/* 3. Lencana Digital (Badges) */}
                <BadgeCollection badges={badges} />

                {/* 4. Riwayat Aktivitas & Partisipasi Wisata */}
                <ActivityHistory activities={activities} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
