/**
 * SPWN Apps 2.0
 * Member KTA View - Identity Safe v3
 *
 * - memakai member.detail GAS
 * - multi-identity
 * - tidak memakai ID akun Users sebagai satu-satunya sumber
 * - render aman jika KTA belum terbit
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  CreditCard,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { DigitalMemberCard } from '../../admin/components/DigitalMemberCard';
import { KtaCardSide, KtaMemberBindingData } from '../../../types/kta.types';
import { useAuthStore } from '../../../stores/authStore';
import { memberApi } from '../../../services/api/member.api';

export const MemberKtaView: React.FC = () => {
  const { currentUser } = useAuthStore();

  const [cardSide, setCardSide] = useState<KtaCardSide>('FRONT');
  const [ktaData, setKtaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKta = async () => {
    setLoading(true);
    setError(null);

    try {
      const user: any = currentUser || {};

      const identity =
        user?.memberProfile?.member_id ||
        user?.memberProfile?.id ||
        user?.memberId ||
        user?.nomor_kta ||
        user?.no_kta ||
        user?.email ||
        user?.id ||
        '';

      if (!identity) {
        throw new Error('Identitas anggota tidak tersedia');
      }

      const response = await memberApi.detail(
        String(identity),
        {
          member_id:
            user?.memberProfile?.member_id ||
            user?.memberId ||
            '',
          nomor_kta:
            user?.nomor_kta ||
            user?.memberProfile?.nomor_kta ||
            '',
          no_kta:
            user?.no_kta ||
            user?.memberProfile?.no_kta ||
            '',
          email:
            user?.email ||
            '',
          user_id:
            user?.id ||
            '',
        }
      );

      const member =
        response?.data || null;

      if (!member) {
        throw new Error('Data anggota tidak ditemukan');
      }

      setKtaData(member);
    } catch (e: any) {
      setKtaData(null);
      setError(
        e?.message ||
        'Data KTA gagal dimuat dari GAS'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadKta();
  }, [currentUser]);

  const memberBinding: KtaMemberBindingData | null =
    useMemo(() => {
      if (!ktaData) return null;

      const noKta =
        ktaData.nomor_kta ||
        ktaData.no_kta ||
        ktaData.nationalMemberNumber ||
        '';

      const fullName =
        ktaData.full_name ||
        ktaData.nama_lengkap ||
        ktaData.fullName ||
        '';

      const photo =
        ktaData.foto_url ||
        ktaData.photo_url ||
        ktaData.foto ||
        ktaData.photoUrl ||
        '';

      const position =
        ktaData.tingkat_keanggotaan ||
        ktaData.position ||
        ktaData.jabatan ||
        'Anggota';

      return {
        id:
          ktaData.id ||
          ktaData.member_id ||
          '',

        nationalMemberNumber:
          noKta,

        fullName:
          fullName,

        membershipLevel:
          position,

        currentPosition:
          position,

        provinceName:
          ktaData.provinsi_nama ||
          ktaData.province ||
          ktaData.provinsi ||
          '',

        regencyName:
          ktaData.kabupaten_kota_nama ||
          ktaData.kabupaten_nama ||
          ktaData.city ||
          ktaData.kabupaten ||
          '',

        districtName:
          ktaData.kecamatan_nama ||
          ktaData.district ||
          ktaData.kecamatan ||
          '',

        kwartirName:
          ktaData.kwartir ||
          ktaData.kwartir_name ||
          '',

        kwartirHierarchy:
          ktaData.kwartir_hierarchy ||
          '',

        krida:
          ktaData.krida_nama ||
          ktaData.krida ||
          '',

        phone:
          ktaData.phone ||
          ktaData.no_hp ||
          '',

        email:
          ktaData.email ||
          '',

        status:
          ktaData.kta_status ||
          ktaData.status_anggota ||
          ktaData.status ||
          '',

        photoUrl:
          photo,

        qrToken:
          ktaData.qr_token ||
          '',

        verificationUrl:
          ktaData.verification_url ||
          '',
      } as KtaMemberBindingData;
    }, [ktaData]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center text-slate-500">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#0066B3]" />
          <p className="text-sm mt-2">Memuat KTA dari GAS...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-900">KTA tidak dapat dimuat</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>

            <button
              type="button"
              onClick={() => void loadKta()}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white border border-red-200 px-3 py-2 text-xs font-bold text-red-700"
            >
              <RefreshCw className="w-4 h-4" />
              Muat Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  const noKta =
    ktaData?.nomor_kta ||
    ktaData?.no_kta ||
    '';

  const qrToken =
    ktaData?.qr_token ||
    '';

  const ktaIssued =
    Boolean(noKta && qrToken);

  if (!memberBinding || !ktaIssued) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900">
              KTA belum diterbitkan
            </p>
            <p className="text-sm text-amber-800 mt-1">
              Data anggota ditemukan, tetapi nomor KTA atau QR resmi belum tersedia.
              Hubungi administrator atau tunggu proses penerbitan KTA selesai.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#0066B3]">
            KTA DIGITAL ANDA
          </p>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Kartu Tanda Anggota
          </h2>
        </div>

        <button
          type="button"
          onClick={() => void loadKta()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
        >
          <RefreshCw className="w-4 h-4" />
          Muat Ulang
        </button>
      </div>

      <div className="flex justify-center">
        <DigitalMemberCard
          member={memberBinding}
          side={cardSide}
        />
      </div>

      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setCardSide('FRONT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold ${
            cardSide === 'FRONT'
              ? 'bg-[#0066B3] text-white'
              : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          Sisi Depan
        </button>

        <button
          type="button"
          onClick={() => setCardSide('BACK')}
          className={`px-4 py-2 rounded-xl text-xs font-bold ${
            cardSide === 'BACK'
              ? 'bg-[#0066B3] text-white'
              : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          Sisi Belakang
        </button>
      </div>
    </div>
  );
};
