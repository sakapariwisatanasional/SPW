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
import { AchievementEmptyState, PamongContact } from '../components/AchievementEmptyState';
import { apiClient } from '../../../services/api/apiClient';
import { SuperAdminAchievementView } from '../components/SuperAdminAchievementView';
import { OfficialAchievementMonitoringView } from '../components/OfficialAchievementMonitoringView';
import { Button } from '../../../components/ui';

export const MemberAchievementPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const {
    members: adminMembers,
    selectedMemberId,
    setSelectedMemberId,
    loadMembers,
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
  const [pamongContact, setPamongContact] = useState<PamongContact | null>(null);
  const [pamongLoading, setPamongLoading] = useState(false);


  useEffect(() => {
    if (!isSuperAdmin) {
      setViewMode('personal');
      return;
    }

    // SuperAdmin session tetap SUPER_ADMIN untuk QA.
    // Perspektif selain SUPER_ADMIN harus membuka UI role yang sedang diuji.
    if (qaPerspective && qaPerspective !== 'SUPER_ADMIN') {
      setViewMode('personal');
    } else {
      setViewMode('superadmin');
    }
  }, [isSuperAdmin, qaPerspective]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    if (Array.isArray(adminMembers) && adminMembers.length > 0) return;

    void loadMembers();
  }, [isSuperAdmin, adminMembers, loadMembers]);

  const qaMember = React.useMemo(() => {
    const list = Array.isArray(adminMembers) ? adminMembers : [];

    const normalizePosition = (member: any) =>
      String(
        member?.position ||
        member?.jabatan ||
        member?.tingkat_keanggotaan ||
        ''
      )
        .trim()
        .toUpperCase()
        .replace(/_/g, ' ');

    const inScope = (m: any) => {
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
    };

    const matchesIdentity = (m: any, identity: unknown) =>
      [
        m.member_id,
        m.nomor_kta,
        m.no_kta,
        m.email,
        m.id,
      ].some((value) =>
        String(value || '').trim().toLowerCase() ===
        String(identity || '').trim().toLowerCase()
      );

    // Login MEMBER: profil dirinya sendiri.
    if (currentUser?.role === ROLES.MEMBER) {
      const identities = [
        (currentUser as any)?.memberProfile?.member_id,
        (currentUser as any)?.memberProfile?.id,
        (currentUser as any)?.nomor_kta,
        (currentUser as any)?.no_kta,
        (currentUser as any)?.email,
        (currentUser as any)?.memberId,
      ].filter(Boolean);

      for (const identity of identities) {
        const ownMember = list.find((m: any) =>
          matchesIdentity(m, identity)
        );
        if (ownMember) return ownMember;
      }

      return null;
    }

    // Pilihan anggota nyata selalu menang.
    if (selectedMemberId) {
      const selected = list.find((m: any) =>
        matchesIdentity(m, selectedMemberId)
      );
      if (selected) return selected;
    }

    // QA SuperAdmin: pilih record nyata sesuai perspektif jabatan.
    const perspective = String(qaPerspective || '').toUpperCase();

    const desiredPositions: Record<string, string[]> = {
      ANGGOTA: ['ANGGOTA', 'DEWAN SAKA'],
      PAMONG_SAKA: ['PAMONG SAKA'],
      PINSAKA: ['PIMPINAN SAKA', 'PINSAKA'],
      MABISAKA: ['MABISAKA'],
    };

    const wanted = desiredPositions[perspective];

    if (wanted) {
      const scoped = list.filter(inScope);

      const exact = scoped.find((m: any) =>
        wanted.includes(normalizePosition(m))
      );

      if (exact) return exact;

      return null;
    }

    // Tombol "Uji Profil Anggota" dari mode SuperAdmin:
    // gunakan peserta nyata pertama, bukan identitas akun SuperAdmin.
    if (isSuperAdmin && viewMode === 'personal') {
      return (
        list.find((m: any) => {
          const p = normalizePosition(m);
          return inScope(m) && (
            p === 'ANGGOTA' ||
            p === 'DEWAN SAKA' ||
            p === ''
          );
        }) || null
      );
    }

    return null;
  }, [
    adminMembers,
    selectedMemberId,
    qaPerspective,
    scopeProvinceId,
    scopeRegencyId,
    scopeDistrictId,
    scopePangkalanId,
    currentUser,
    isSuperAdmin,
    viewMode,
  ]);

  const targetMemberId =
    currentUser?.role === ROLES.MEMBER
      ? (
          qaMember?.member_id ||
          qaMember?.nomor_kta ||
          qaMember?.no_kta ||
          qaMember?.email ||
          (currentUser as any)?.memberProfile?.member_id ||
          (currentUser as any)?.memberProfile?.id ||
          (currentUser as any)?.nomor_kta ||
          (currentUser as any)?.no_kta ||
          (currentUser as any)?.email ||
          (currentUser as any)?.memberId ||
          ''
        )
      : (
          qaMember?.member_id ||
          qaMember?.nomor_kta ||
          qaMember?.no_kta ||
          qaMember?.email ||
          qaMember?.id ||
          ''
        );

  useEffect(() => {
    if (!targetMemberId) return;

    void loadAchievement(
      String(targetMemberId),
      currentUser?.role,
      (currentUser as any)?.memberId
    );
  }, [targetMemberId, currentUser?.role, loadAchievement]);

  useEffect(() => {
    if (!targetMemberId || viewMode !== 'personal') {
      setPamongContact(null);
      return;
    }

    let cancelled = false;

    const loadPamong = async () => {
      setPamongLoading(true);

      try {
        const response = await apiClient.get<any>(
          'member.pamong.available',
          {
            member_id: String(targetMemberId),
            nomor_kta:
              String(
                qaMember?.nomor_kta ||
                qaMember?.no_kta ||
                (currentUser as any)?.nomor_kta ||
                (currentUser as any)?.no_kta ||
                ''
              ),
            email:
              String(
                qaMember?.email ||
                (currentUser as any)?.email ||
                ''
              ),
            user_id:
              String(
                (currentUser as any)?.id ||
                ''
              ),
          }
        );

        if (cancelled) return;

        const contacts = Array.isArray(response?.data?.contacts)
          ? response.data.contacts
          : [];

        setPamongContact(contacts.length > 0 ? contacts[0] : null);
      } catch {
        if (!cancelled) setPamongContact(null);
      } finally {
        if (!cancelled) setPamongLoading(false);
      }
    };

    void loadPamong();

    return () => {
      cancelled = true;
    };
  }, [targetMemberId, viewMode]);

  // Sinkronkan identitas yang tampil di Member Shell dengan read-model GAS.
  // Ini hanya memperbarui state/session browser dengan data hasil baca GAS;
  // tidak menulis balik data anggota.
  useEffect(() => {
    if (
      currentUser?.role !== ROLES.MEMBER ||
      !profile?.member
    ) {
      return;
    }

    const gasMember: any = profile.member;

    const nextKta =
      gasMember.nomor_kta ||
      gasMember.no_kta ||
      gasMember.memberId ||
      '';

    const nextPhoto =
      gasMember.fotoUrl ||
      gasMember.photo_url ||
      '';

    const nextName =
      gasMember.full_name ||
      gasMember.nama ||
      currentUser.fullName ||
      '';

    const nextMemberId =
      gasMember.internalId ||
      (currentUser as any)?.memberId ||
      currentUser.id;

    const currentKta =
      (currentUser as any)?.nomor_kta ||
      (currentUser as any)?.no_kta ||
      '';

    const currentPhoto =
      (currentUser as any)?.avatarUrl ||
      (currentUser as any)?.photo_url ||
      '';

    const currentName =
      currentUser.fullName ||
      '';

    if (
      String(currentKta) === String(nextKta) &&
      String(currentPhoto) === String(nextPhoto) &&
      String(currentName) === String(nextName)
    ) {
      return;
    }

    const updatedUser: any = {
      ...currentUser,
      fullName: nextName,
      memberId: nextMemberId,
      nomor_kta: nextKta,
      no_kta: nextKta,
      avatarUrl: nextPhoto,
      photo_url: nextPhoto,
      memberProfile: {
        ...((currentUser as any)?.memberProfile || {}),
        id: nextMemberId,
        member_id: nextMemberId,
        full_name: nextName,
        nomor_kta: nextKta,
        no_kta: nextKta,
        photo_url: nextPhoto,
      },
    };

    useAuthStore.setState({
      currentUser: updatedUser,
    } as any);

    try {
      localStorage.setItem(
        'spwn_session_user',
        JSON.stringify(updatedUser)
      );
    } catch {
      // Browser storage optional; UI tetap memakai Zustand state.
    }
  }, [profile, currentUser]);

  const handleSuperAdminTestMember = async () => {
    let list = Array.isArray(adminMembers) ? adminMembers : [];

    if (!list.length) {
      try {
        const loaded = await loadMembers();
        list = Array.isArray(loaded) ? loaded : [];
      } catch {
        list = [];
      }
    }

    const normalizePosition = (member: any) =>
      String(
        member?.position ||
        member?.jabatan ||
        member?.tingkat_keanggotaan ||
        ''
      )
        .trim()
        .toUpperCase()
        .replace(/_/g, ' ');

    const participant =
      list.find((member: any) => {
        const position = normalizePosition(member);
        return position === 'ANGGOTA' || position === 'DEWAN SAKA';
      }) ||
      list[0] ||
      null;

    if (participant) {
      setSelectedMemberId(
        String(
          participant.member_id ||
          participant.nomor_kta ||
          participant.no_kta ||
          participant.email ||
          participant.id ||
          ''
        )
      );
    }

    setViewMode('personal');
  };

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
        <SuperAdminAchievementView onSwitchToPersonal={handleSuperAdminTestMember} />
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
                  Mode Uji Profil Anggota (Super Administrator)
                </p>
                <p className="text-[11px] text-slate-500">
                  Session tetap SUPER_ADMIN, tetapi data yang diuji harus berasal dari record anggota nyata di GAS.
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

        {isSuperAdmin && viewMode === 'personal' && !targetMemberId && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                Belum ada anggota nyata yang dipilih untuk mode QA
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Sistem tidak akan memakai email/ID akun SuperAdmin sebagai member_id.
                Pilih anggota dari Pantauan Seluruh Wilayah atau gunakan perspektif Anggota/Pamong/Pinsaka/Mabisaka.
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

            {/* Jabatan struktural/pembina: monitoring hierarkis sesuai Kwartir */}
            {!isAchievementParticipant && (isPamong || isPinsaka || isMabisaka) ? (
              <OfficialAchievementMonitoringView />
            ) : hasNoAchievements ? (
              <div className="space-y-6">
                <AchievementEmptyState
                  memberNama={profile.member.nama}
                  memberKrida={
                    (profile.member as any)?.kridaUtamaNama ||
                    (profile.member as any)?.krida ||
                    ''
                  }
                  pamong={pamongContact}
                  pamongLoading={pamongLoading}
                  onExploreCatalog={() => setSelectedKrida('pemandu')}
                  onExploreKrida={() => setSelectedKrida('pemandu')}
                  onOpenPortfolio={() => {
                    window.dispatchEvent(
                      new CustomEvent('spwn-member-navigate', {
                        detail: { tab: 'portfolio' },
                      })
                    );
                  }}
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
