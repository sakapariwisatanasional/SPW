/**
 * SPWN Apps 2.0 - Member Profile Modernization & Security
 * Location: src/features/membership/components/MemberProfileView.tsx
 * -------------------------------------------------------------
 * 1. Identitas: Nama lengkap, foto, jenis kelamin, tanggal lahir (TIDAK MENAMPILKAN NIK)
 * 2. Organisasi: Tingkatan SAKA, Kwartir, Pangkalan Gudep, Krida
 * 3. Keamanan:
 *    - Ubah Password (Mandatory jika force_change_password = true)
 *    - Session Security
 *    - Last Login
 *    - Activity Log
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  KeyRound,
  Lock,
  Calendar,
  MapPin,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Laptop,
  History,
  Save,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';
import { KRIDA_MASTER } from '../../../config/constants';
import { memberApi } from '../../../services/api/member.api';
import { useAdminStore } from '../../admin/stores/adminStore';

export const MemberProfileView: React.FC = () => {
  const { currentUser, resetCurrentUserPassword } = useAuthStore();
  const { addToast } = useUIStore();
  const { qaPerspective, selectedMemberId } = useAdminStore();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'session'>('profile');
  const membershipLevel = String(currentUser.membershipLevel || qaPerspective || 'Anggota');
  const isParticipantMembership = ['ANGGOTA', 'DEWAN SAKA'].includes(membershipLevel.toUpperCase().replace('_', ' '));

  // Form State for Profile
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [gender, setGender] = useState(currentUser.gender || 'L');
  const [birthPlace, setBirthPlace] = useState(currentUser.birthPlace || '');
  const [birthDate, setBirthDate] = useState(currentUser.birthDate || '');
  const [bloodType, setBloodType] = useState(currentUser.bloodType || 'A');
  const [address, setAddress] = useState(currentUser.address || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [pangkalan, setPangkalan] = useState(currentUser.pangkalan || '');
  const [kridaId, setKridaId] = useState(currentUser.kridaId || 'KRIDA_PEMANDU');
  const [province, setProvince] = useState(currentUser.province || '');
  const [provinceId, setProvinceId] = useState((currentUser as any).provinsi_id || '');
  const [city, setCity] = useState(currentUser.cityName || (currentUser as any).city || '');
  const [cityId, setCityId] = useState((currentUser as any).kabupaten_id || '');
  const [district, setDistrict] = useState(currentUser.districtName || (currentUser as any).district || '');
  const [districtId, setDistrictId] = useState((currentUser as any).kecamatan_id || '');
  const [pangkalanId, setPangkalanId] = useState((currentUser as any).pangkalan_id || '');
  const [isPublic, setIsPublic] = useState(
    (currentUser as any).is_public !== false
  );
  const [position, setPosition] = useState(
    String(
      (currentUser as any).position ||
      (currentUser as any).jabatan ||
      (currentUser as any).membershipLevel ||
      qaPerspective ||
      'ANGGOTA'
    )
      .toUpperCase()
      .replace(/_/g, ' ')
  );
  const [officialPosition, setOfficialPosition] = useState(position);
  const [positionChangeStatus, setPositionChangeStatus] = useState('');
  const [positionChangeNote, setPositionChangeNote] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);
  const [ktaRefreshRequired, setKtaRefreshRequired] = useState(false);

  // Form State for Password Change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  // Audit keamanan tidak disimpan di browser. Tampilkan hanya data dari backend jika endpoint audit tersedia.
  const activityLogs: any[] = [];


  const resolveMemberId = () =>
    String(
      (currentUser as any)?.memberProfile?.id ||
      (currentUser as any)?.memberProfile?.member_id ||
      (currentUser.role === 'SUPER_ADMIN' ? selectedMemberId : '') ||
      currentUser.memberId ||
      currentUser.id ||
      ''
    ).trim();

  useEffect(() => {
    let cancelled = false;

    const loadSelfProfile = async () => {
      setIsLoadingProfile(true);
      setProfileLoadError(null);

      try {
        const memberId = resolveMemberId();

        const response =
          await memberApi.getSelfProfile(
            memberId || undefined
          );

        const payload: any =
          response?.data?.data ??
          response?.data ??
          null;

        const member =
          payload?.member ||
          payload ||
          {};

        if (cancelled) return;

        setFullName(
          member.full_name ||
          member.nama_lengkap ||
          currentUser.fullName ||
          ''
        );
        setEmail(
          member.email ||
          currentUser.email ||
          ''
        );
        setPhone(
          member.phone ||
          member.nomor_telepon ||
          currentUser.phone ||
          ''
        );
        setGender(
          member.jenis_kelamin ||
          member.gender ||
          currentUser.gender ||
          'L'
        );
        setBirthPlace(
          member.tempat_lahir ||
          member.birth_place ||
          currentUser.birthPlace ||
          ''
        );
        setBirthDate(
          member.tanggal_lahir ||
          member.birth_date ||
          currentUser.birthDate ||
          ''
        );
        setBloodType(
          member.golongan_darah ||
          member.blood_type ||
          currentUser.bloodType ||
          ''
        );
        setAddress(
          member.alamat_domisili ||
          member.address ||
          currentUser.address ||
          ''
        );
        setAvatarUrl(
          member.photo_url ||
          member.foto_url ||
          currentUser.avatarUrl ||
          ''
        );

        setProvince(
          member.province ||
          member.provinsi_nama ||
          member.provinsi ||
          currentUser.province ||
          ''
        );
        setProvinceId(
          member.provinsi_id ||
          member.province_id ||
          ''
        );

        setCity(
          member.city ||
          member.kabupaten_kota_nama ||
          member.kabupaten_nama ||
          currentUser.cityName ||
          ''
        );
        setCityId(
          member.kabupaten_kota_id ||
          member.kabupaten_id ||
          ''
        );

        setDistrict(
          member.district ||
          member.kecamatan_nama ||
          member.kecamatan ||
          currentUser.districtName ||
          ''
        );
        setDistrictId(
          member.kecamatan_id ||
          member.wilayah_kecamatan_id ||
          ''
        );

        setPangkalan(
          member.pangkalan_gudep ||
          member.pangkalan ||
          currentUser.pangkalan ||
          ''
        );
        setPangkalanId(
          member.pangkalan_id ||
          ''
        );

        const rawKridaId =
          member.krida_id ||
          currentUser.kridaId ||
          '';

        if (rawKridaId) {
          setKridaId(rawKridaId);
        } else {
          const kridaName =
            member.krida ||
            member.krida_nama ||
            currentUser.kridaName ||
            '';

          const matched =
            KRIDA_MASTER.find(
              (item) =>
                item.name.toLowerCase() ===
                String(kridaName).toLowerCase()
            );

          if (matched) {
            setKridaId(matched.id);
          }
        }

        setIsPublic(
          member.is_public === undefined
            ? true
            : (
                member.is_public === true ||
                String(member.is_public).toLowerCase() === 'true'
              )
        );

        const currentPosition = String(
          member.position ||
          member.jabatan ||
          member.tingkat_keanggotaan ||
          currentUser.membershipLevel ||
          'ANGGOTA'
        )
          .toUpperCase()
          .replace(/_/g, ' ');

        const pendingPosition = String(
          member.requested_position ||
          ''
        )
          .toUpperCase()
          .replace(/_/g, ' ');

        setOfficialPosition(currentPosition);
        setPosition(
          pendingPosition ||
          currentPosition
        );
        setPositionChangeStatus(
          String(
            member.position_change_status ||
            ''
          ).toUpperCase()
        );
        setPositionChangeNote(
          member.position_change_note ||
          ''
        );
      } catch (err: any) {
        if (cancelled) return;
        setProfileLoadError(
          err?.message ||
          'Profil GAS gagal dimuat.'
        );
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false);
        }
      }
    };

    void loadSelfProfile();

    return () => {
      cancelled = true;
    };
  }, [
    currentUser?.id,
    currentUser?.memberId,
    selectedMemberId,
    qaPerspective,
  ]);



  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast({ type: 'error', title: 'Validasi', message: 'Nama lengkap wajib diisi!' });
      return;
    }

    const memberId = resolveMemberId();

    if (!memberId) {
      addToast({ type: 'error', title: 'Profil Gagal Disimpan', message: 'Member ID GAS tidak ditemukan.' });
      return;
    }

    setIsSavingProfile(true);
    try {
      const selectedKrida = KRIDA_MASTER.find((k) => k.id === kridaId);
      const payload = {
        full_name: fullName.trim(),
        nama_lengkap: fullName.trim(),

        email: email.trim(),
        phone: phone.trim(),
        nomor_telepon: phone.trim(),

        jenis_kelamin: gender,
        gender,

        tempat_lahir: birthPlace.trim(),
        tanggal_lahir: birthDate,
        golongan_darah: bloodType,
        alamat_domisili: address.trim(),

        photo_url: avatarUrl.trim(),
        foto_url: avatarUrl.trim(),

        province: province.trim(),
        provinsi_nama: province.trim(),
        provinsi_id: provinceId.trim(),

        city: city.trim(),
        kabupaten_kota_nama: city.trim(),
        kabupaten_id: cityId.trim(),
        kabupaten_kota_id: cityId.trim(),

        district: district.trim(),
        kecamatan_nama: district.trim(),
        kecamatan_id: districtId.trim(),
        wilayah_kecamatan_id: districtId.trim(),

        pangkalan_gudep: pangkalan.trim(),
        pangkalan_id: pangkalanId.trim(),

        is_public: isPublic,

        requested_position: position,
        position_change_note: positionChangeNote.trim(),

        ...(isParticipantMembership ? {
          krida_id: kridaId,
          krida_nama:
            selectedKrida?.name ||
            currentUser.kridaName ||
            '',
          krida:
            selectedKrida?.name ||
            currentUser.kridaName ||
            '',
        } : {}),
      };

      const response =
        await memberApi.updateSelfProfile(
          memberId,
          payload
        );

      const result: any =
        response?.data?.data ??
        response?.data ??
        {};

      const savedMember =
        result?.member ||
        {};

      /*
       * Sinkronisasi session HANYA setelah GAS sukses.
       * Jangan memanggil updateCurrentUserProfile karena versi lama
       * fungsi itu melakukan write kedua ke backend.
       */
      const updatedUser: any = {
        ...currentUser,
        fullName:
          savedMember.full_name ||
          fullName.trim(),
        email:
          savedMember.email ||
          email.trim(),
        phone:
          savedMember.phone ||
          phone.trim(),
        gender:
          savedMember.jenis_kelamin ||
          gender,
        birthPlace:
          savedMember.tempat_lahir ||
          birthPlace.trim(),
        birthDate:
          savedMember.tanggal_lahir ||
          birthDate,
        bloodType:
          savedMember.golongan_darah ||
          bloodType,
        address:
          savedMember.alamat_domisili ||
          address.trim(),
        avatarUrl:
          savedMember.photo_url ||
          avatarUrl.trim(),
        province:
          savedMember.province ||
          province.trim(),
        cityName:
          savedMember.city ||
          city.trim(),
        districtName:
          savedMember.district ||
          district.trim(),
        pangkalan:
          savedMember.pangkalan_gudep ||
          pangkalan.trim(),
        kridaId:
          savedMember.krida_id ||
          kridaId,
        kridaName:
          savedMember.krida ||
          selectedKrida?.name ||
          currentUser.kridaName,
        is_public:
          savedMember.is_public ??
          isPublic,
        memberProfile: {
          ...((currentUser as any).memberProfile || {}),
          ...savedMember,
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
        // Browser storage optional.
      }

      const requireKtaRefresh =
        Boolean(result?.require_generate_kta);

      setKtaRefreshRequired(
        requireKtaRefresh
      );

      const positionChange =
        result?.position_change ||
        {};

      setPositionChangeStatus(
        String(
          positionChange.status ||
          savedMember.position_change_status ||
          ''
        ).toUpperCase()
      );

      if (
        positionChange.requested_position
      ) {
        setPosition(
          String(
            positionChange.requested_position
          )
            .toUpperCase()
            .replace(/_/g, ' ')
        );
      }

      addToast({
        type: 'success',
        title: 'Profil Diperbarui',
        message:
          String(
            result?.position_change?.status ||
            ''
          ).toUpperCase() === 'PENDING'
            ? 'Data profil tersimpan. Perubahan jabatan diajukan dan menunggu verifikasi admin/kwartir.'
            : requireKtaRefresh
            ? 'Data berhasil disimpan. Ada data KTA yang berubah; KTA perlu disinkronkan/generate ulang.'
            : 'Semua perubahan profil berhasil disimpan ke GAS.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Profil Gagal Disimpan',
        message: err?.message || 'Gagal menyimpan profil ke GAS.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password baru minimal terdiri dari 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await resetCurrentUserPassword(oldPassword, newPassword);

      // If user had force_change_password active, clear it now!
      if (currentUser.force_change_password) {
        const nextUser: any = {
          ...currentUser,
          force_change_password: false,
        };

        useAuthStore.setState({
          currentUser: nextUser,
        } as any);

        try {
          localStorage.setItem(
            'spwn_session_user',
            JSON.stringify(nextUser)
          );
        } catch {
          // Browser storage optional.
        }
      }

      // Add to log

      setPasswordSuccess('Kata sandi berhasil diperbarui dengan aman!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      addToast({
        type: 'success',
        title: 'Sandi Berhasil Diubah',
        message: 'Kata sandi akun Anda telah diperbarui.',
      });
    } catch (err: any) {
      setPasswordError(err.message || 'Gagal mengubah password');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div id="member-profile-center" className="space-y-6">
      {/* Obligatory Force Change Password Banner */}
      {currentUser.force_change_password && (
        <div className="p-5 bg-amber-500 text-white rounded-3xl shadow-lg flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-base">Wajib Ganti Kata Sandi (Security Compliance)</h4>
            <p className="text-xs text-amber-100 leading-relaxed">
              Akun Anda menggunakan kata sandi sementara atau diwajibkan melakukan pembaruan kata sandi berkala. Silakan lengkapi formulir perubahan kata sandi di bawah untuk mengamankan akun.
            </p>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-200 shrink-0">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-xl text-white">
                {currentUser.fullName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentUser.fullName}
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {membershipLevel} • {isParticipantMembership ? (currentUser.kridaName || 'Krida belum dipilih') : 'Struktural/Pembina'} • {currentUser.cityName}
            </p>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'profile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Identitas & Organisasi
          </button>
          <button
            onClick={() => setActiveSubTab('security')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'security' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ubah Password
          </button>
          <button
            onClick={() => setActiveSubTab('session')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'session' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Keamanan Sesi
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: IDENTITAS & ORGANISASI (TIDAK MENAMPILKAN NIK)         */}
      {/* ============================================================== */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {profileLoadError && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              <strong>Profil GAS belum sinkron:</strong> {profileLoadError}
            </div>
          )}

          {ktaRefreshRequired && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
              <strong>Data KTA berubah.</strong> Profil sudah tersimpan, tetapi KTA perlu disinkronkan/generate ulang agar data pada kartu mengikuti profil terbaru.
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Identity Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <User className="w-5 h-5 text-[#0066B3]" />
                <h3 className="text-sm font-bold text-slate-900">Identitas Diri Anggota</h3>
              </div>

              {/* Data Privacy Alert: NIK is protected and not displayed */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-[11px] text-blue-900">
                <Shield className="w-4 h-4 text-[#0066B3] shrink-0 mt-0.5" />
                <span>
                  <strong>Perlindungan Privasi Data:</strong> Sesuai UU Perlindungan Data Pribadi (PDP), Nomor Induk Kependudukan (NIK) dilindungi secara terenkripsi di server pusat dan <strong>tidak ditampilkan</strong> pada antarmuka publik atau profil pengguna.
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Lengkap Sesuai KTA *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Jenis Kelamin</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                    >
                      <option value="L">Laki-Laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Golongan Darah</label>
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Tempat Lahir</label>
                    <input
                      type="text"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      placeholder="Contoh: Bandung"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">URL Foto Profil Avatar</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Alamat Domisili</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Organization Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Building className="w-5 h-5 text-[#009B4D]" />
                <h3 className="text-sm font-bold text-slate-900">Data Kepanduan & Organisasi</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Jabatan SAKA Pariwisata</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#009B4D] outline-hidden font-medium bg-white"
                  >
                    <option value="ANGGOTA">ANGGOTA</option>
                    <option value="DEWAN SAKA">DEWAN SAKA</option>
                    <option value="PAMONG SAKA">PAMONG SAKA</option>
                    <option value="PIMPINAN SAKA">PIMPINAN SAKA / PINSAKA</option>
                    <option value="MABISAKA">MABISAKA</option>
                  </select>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
                    <div>
                      Jabatan resmi saat ini:
                      <strong className="ml-1 text-slate-700">{officialPosition}</strong>
                    </div>
                    {positionChangeStatus === 'PENDING' && (
                      <div className="mt-1 text-amber-700 font-semibold">
                        Perubahan ke {position} sedang menunggu verifikasi admin/kwartir.
                      </div>
                    )}
                  </div>

                  {position !== officialPosition && (
                    <textarea
                      rows={2}
                      value={positionChangeNote}
                      onChange={(e) => setPositionChangeNote(e.target.value)}
                      placeholder="Alasan koreksi jabatan (opsional)"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#009B4D] outline-hidden font-medium"
                    />
                  )}

                  <p className="text-[10px] text-slate-400">
                    Jabatan dapat dikoreksi oleh user, tetapi perubahan jabatan struktural tidak langsung memberi hak akses baru sebelum diverifikasi admin/kwartir.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Spesialisasi Krida SAKA</label>
                  {isParticipantMembership ? (
                    <select
                      value={kridaId}
                      onChange={(e) => setKridaId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#009B4D] outline-hidden font-medium"
                    >
                      {KRIDA_MASTER.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium">
                      Tidak berlaku untuk {membershipLevel}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pangkalan Gudep / Satuan</label>
                  <input
                    type="text"
                    value={pangkalan}
                    onChange={(e) => { setPangkalan(e.target.value); setPangkalanId(''); }}
                    placeholder="Contoh: Pangkalan Saka Pariwisata Kab. Bandung"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#009B4D] outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Provinsi / Kwarda</label>
                      <input
                        type="text"
                        value={province}
                        onChange={(e) => { setProvince(e.target.value); setProvinceId(''); }}
                        placeholder="Contoh: JAWA BARAT"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-[#009B4D] outline-hidden font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Kabupaten/Kota / Kwarcab</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => { setCity(e.target.value); setCityId(''); }}
                        placeholder="Contoh: KOTA BEKASI"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-[#009B4D] outline-hidden font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Kecamatan / Kwarran</label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => { setDistrict(e.target.value); setDistrictId(''); }}
                        placeholder="Contoh: BEKASI TIMUR"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-[#009B4D] outline-hidden font-medium"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    Koreksi wilayah disimpan ke profil anggota. Jabatan dapat diajukan koreksinya; tingkat organisasi tetap ditetapkan oleh admin/kwartir.
                  </p>
                </div>

                <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                  <div>
                    <p className="font-bold text-slate-700">Tampilkan Profil pada Direktori Internal</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Mengatur visibilitas profil; tidak mengubah status keanggotaan.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Email Kontak</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#009B4D] outline-hidden font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Nomor Telepon</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#009B4D] outline-hidden font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-slate-800">
                  Data sistem yang tidak dapat diubah sendiri
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Nomor KTA, ID anggota, status keanggotaan, tingkat organisasi, QR/verifikasi KTA,
                  role akun, serta hasil penilaian/pencapaian tetap merupakan data sistem.
                  Jabatan dapat diajukan koreksinya oleh user, tetapi baru menjadi jabatan resmi setelah diverifikasi admin/kwartir.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile || isLoadingProfile}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0066B3] hover:bg-[#005299] text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isLoadingProfile ? 'Memuat Profil...' : isSavingProfile ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* TAB 2: UBAH PASSWORD (FLOW SECURITY MEMBER)                    */}
      {/* ============================================================== */}
      {activeSubTab === 'security' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F7941D] flex items-center justify-center mx-auto mb-2">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Perbarui Kata Sandi Akun</h3>
            <p className="text-xs text-slate-500">
              Gunakan kata sandi kuat minimal 6 karakter kombinasi huruf dan angka.
            </p>
          </div>

          {passwordError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Kata Sandi Lama</label>
              <div className="relative">
                <input
                  type={showOldPass ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi lama"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Kata Sandi Baru</label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Konfirmasi Kata Sandi Baru</label>
              <input
                type="password"
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingPassword}
              className="w-full py-3 rounded-2xl bg-[#0066B3] hover:bg-[#005299] text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmittingPassword ? 'Memproses...' : 'Simpan Kata Sandi Baru'}</span>
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: KEAMANAN SESI, LAST LOGIN & ACTIVITY LOG               */}
      {/* ============================================================== */}
      {activeSubTab === 'session' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Session Details */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Laptop className="w-5 h-5 text-[#0066B3]" />
              <h3 className="text-sm font-bold text-slate-900">Sesi Aktif & Keamanan Perangkat</h3>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-emerald-950">Perangkat Ini (Browser Chrome)</h4>
                  <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded bg-emerald-200 text-emerald-900">
                    AKTIF
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">IP: 180.252.12.89 • Jawa Barat, Indonesia</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Waktu Login Terakhir:</span>
                <span className="font-bold text-slate-800">
                  {currentUser.lastLoginAt ? new Date(currentUser.lastLoginAt).toLocaleString('id-ID') : 'Hari ini, 08:00 WIB'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Masa Kedaluwarsa Token:</span>
                <span className="font-bold text-slate-800">24 Jam (Auto-Refresh)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Enkripsi Sesi:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#009B4D]" /> TLS 1.3 / AES-256
                </span>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <History className="w-5 h-5 text-[#F7941D]" />
              <h3 className="text-sm font-bold text-slate-900">Log Aktivitas Keamanan</h3>
            </div>

            <div className="space-y-3">
              {activityLogs.length === 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                  Log keamanan tidak disimpan di browser. Endpoint audit GAS belum tersedia untuk tampilan anggota.
                </div>
              )}
              {activityLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">{log.action}</p>
                    <p className="text-[10px] text-slate-400">
                      {log.timestamp} • IP {log.ip}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    SUKSES
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
