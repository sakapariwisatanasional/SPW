/**
 * SPWN Apps 2.0 - Member Digital KTA
 * GAS Rule of Truth:
 * - Data anggota: member.profile.getSelf untuk MEMBER
 * - QA/Admin preview: member.detail untuk anggota yang dipilih
 * - Template desain: KTA_TEMPLATE / TMPL_DEFAULT melalui GAS
 * - Tidak memakai fallback template browser/localStorage
 */

import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { DigitalMemberCard } from '../../admin/components/DigitalMemberCard';
import {
  KtaCardSide,
  KtaMemberBindingData,
  KtaCardSettings,
} from '../../../types/kta.types';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';
import { useAdminStore } from '../../admin/stores/adminStore';
import { memberApi } from '../../../services/api/member.api';
import { spreadsheetService } from '../../../services/spreadsheetService';

export const MemberKtaView: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { addToast } = useUIStore();
  const { selectedMemberId } = useAdminStore();

  const [cardSide, setCardSide] = useState<KtaCardSide>('FRONT');
  const [ktaData, setKtaData] = useState<any>(null);
  const [templateSettings, setTemplateSettings] =
    useState<KtaCardSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const resolveTargetMemberId = () =>
    String(
      currentUser?.role === 'MEMBER'
        ? (
            (currentUser as any)?.memberProfile?.member_id ||
            (currentUser as any)?.memberProfile?.id ||
            (currentUser as any)?.memberId ||
            (currentUser as any)?.nomor_kta ||
            (currentUser as any)?.no_kta ||
            currentUser?.id ||
            ''
          )
        : (
            selectedMemberId ||
            (currentUser as any)?.memberId ||
            currentUser?.id ||
            ''
          )
    ).trim();

  const loadKta = async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const memberId = resolveTargetMemberId();

      if (!memberId) {
        throw new Error('Member ID tidak tersedia.');
      }

      /*
       * MEMBER membaca data dirinya melalui endpoint self-profile.
       * Admin/SuperAdmin QA tetap memakai member.detail agar fitur
       * simulasi/preview anggota yang sudah berjalan tidak diputus.
       */
      const memberResponse =
        currentUser?.role === 'MEMBER'
          ? await memberApi.getSelfProfile(memberId)
          : await memberApi.detail(memberId);

      const rawMember: any =
        (memberResponse as any)?.data?.member ||
        (memberResponse as any)?.data?.data?.member ||
        (memberResponse as any)?.data?.data ||
        (memberResponse as any)?.data ||
        null;

      if (!rawMember) {
        throw new Error('Data KTA anggota tidak ditemukan.');
      }

      /*
       * Sumber desain wajib dari KTA Designer di Spreadsheet.
       * refreshKtaSettings membaca TMPL_DEFAULT melalui GAS.
       * Jika gagal/tidak tersedia, jangan fallback diam-diam ke storage browser.
       */
      const template =
        await spreadsheetService.refreshKtaSettings('TMPL_DEFAULT');

      if (!template) {
        throw new Error(
          'Template KTA TMPL_DEFAULT belum tersedia dari KTA Designer/GAS.'
        );
      }

      setKtaData(rawMember);
      setTemplateSettings(template);
    } catch (error: any) {
      console.error('Member KTA loading error:', error);

      const message =
        error?.message ||
        'Gagal memuat KTA dari GAS.';

      setKtaData(null);
      setTemplateSettings(null);
      setLoadError(message);

      addToast({
        type: 'error',
        title: 'Gagal Memuat KTA',
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadKta();
    // selectedMemberId diperlukan untuk QA SuperAdmin.
  }, [currentUser, selectedMemberId]);

  const memberBinding: KtaMemberBindingData | null =
    useMemo(() => {
      if (!ktaData) return null;

      return {
        id:
          ktaData.id ||
          ktaData.member_id,

        nationalMemberNumber:
          ktaData.nationalMemberNumber ||
          ktaData.nomor_kta ||
          ktaData.no_kta,

        fullName:
          ktaData.fullName ||
          ktaData.full_name ||
          ktaData.nama_lengkap,

        membershipLevel:
          ktaData.membershipLevel ||
          ktaData.tingkat_keanggotaan ||
          ktaData.position ||
          'Anggota',

        currentPosition:
          ktaData.currentPosition ||
          ktaData.position ||
          ktaData.jabatan ||
          'Anggota',

        provinceName:
          ktaData.provinceName ||
          ktaData.provinsi_nama ||
          ktaData.province,

        regencyName:
          ktaData.regencyName ||
          ktaData.kabupaten_kota_nama ||
          ktaData.kabupaten_nama ||
          ktaData.city,

        districtName:
          ktaData.districtName ||
          ktaData.kecamatan_nama ||
          ktaData.district,

        kwartirName:
          (
            ktaData.kabupaten_kota_nama ||
            ktaData.kabupaten_nama ||
            ktaData.city
          )
            ? `Kwarcab ${
                ktaData.kabupaten_kota_nama ||
                ktaData.kabupaten_nama ||
                ktaData.city
              }`
            : 'Kwarcab SAKA Pariwisata',

        kwartirHierarchy:
          [
            (
              ktaData.provinsi_nama ||
              ktaData.province
            )
              ? `Kwarda ${
                  ktaData.provinsi_nama ||
                  ktaData.province
                }`
              : '',
            (
              ktaData.kabupaten_kota_nama ||
              ktaData.kabupaten_nama ||
              ktaData.city
            )
              ? `Kwarcab ${
                  ktaData.kabupaten_kota_nama ||
                  ktaData.kabupaten_nama ||
                  ktaData.city
                }`
              : '',
            (
              ktaData.kecamatan_nama ||
              ktaData.district
            )
              ? `Kwarran ${
                  ktaData.kecamatan_nama ||
                  ktaData.district
                }`
              : '',
          ]
            .filter(Boolean)
            .join(' • ') ||
          'Kwartir Nasional',

        krida:
          ktaData.krida ||
          ktaData.krida_nama,

        phone:
          ktaData.phone ||
          ktaData.nomor_telepon,

        email:
          ktaData.email,

        status:
          ktaData.kta_status ||
          ktaData.status_anggota ||
          ktaData.status,

        photoUrl:
          ktaData.photoUrl ||
          ktaData.photo_url ||
          ktaData.foto_url,

        qrUrl:
          ktaData.verificationUrl ||
          ktaData.verification_url ||
          ktaData.qr_verification_url,

        qrToken:
          ktaData.qr_token ||
          ktaData.nationalMemberNumber ||
          ktaData.nomor_kta ||
          ktaData.no_kta,
      };
    }, [ktaData]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-[#0066B3]" />
        <div>Memuat data anggota dan template KTA Designer...</div>
      </div>
    );
  }

  if (loadError || !memberBinding || !templateSettings) {
    return (
      <div className="p-6">
        <div className="max-w-xl mx-auto rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center">
          <AlertCircle className="w-6 h-6 mx-auto text-rose-600 mb-2" />
          <h3 className="font-bold text-rose-900">
            KTA belum dapat ditampilkan
          </h3>
          <p className="text-sm text-rose-700 mt-1">
            {loadError || 'Data anggota atau template KTA tidak tersedia dari GAS.'}
          </p>
          <button
            type="button"
            onClick={() => void loadKta()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border p-6">
        <h2 className="text-xl font-black">
          Kartu Tanda Anggota (KTA) Digital
        </h2>

        <p className="text-sm text-slate-500">
          Data anggota dan desain KTA tersinkron langsung dari GAS/Spreadsheet.
        </p>
      </div>

      <div className="flex justify-center">
        <DigitalMemberCard
          member={memberBinding}
          previewSettings={templateSettings}
          side={cardSide}
          onSideChange={setCardSide}
          showControls={true}
        />
      </div>
    </div>
  );
};
