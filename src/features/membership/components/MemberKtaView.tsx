/**
 * SPWN Apps 2.0
 * Member KTA View - LIST RESOLVER v4
 *
 * Tidak memakai member.detail.
 * KTA di-resolve dari member.list (GAS Rule of Truth),
 * sehingga tidak tergantung konflik/duplikasi MemberAdminService.detail().
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
import { useAdminStore } from '../../admin/stores/adminStore';
import { memberApi } from '../../../services/api/member.api';

const norm = (value: unknown) =>
  String(value ?? '').trim().toLowerCase();

export const MemberKtaView: React.FC = () => {
  const { currentUser } = useAuthStore();
  const {
    selectedMemberId,
    qaPerspective,
  } = useAdminStore();

  const [cardSide, setCardSide] = useState<KtaCardSide>('FRONT');
  const [ktaData, setKtaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKta = async () => {
    setLoading(true);
    setError(null);

    try {
      const user: any = currentUser || {};

      const response = await memberApi.list({
        limit: 500,
      });

      const rows: any[] =
        Array.isArray(response?.data)
          ? response.data
          : [];

      if (!rows.length) {
        throw new Error('Daftar anggota dari GAS kosong.');
      }

      const preferredIdentities = [
        selectedMemberId,
        user?.memberProfile?.member_id,
        user?.memberProfile?.id,
        user?.memberId,
        user?.nomor_kta,
        user?.no_kta,
        user?.email,
      ]
        .map(norm)
        .filter(Boolean);

      const userName = norm(user?.fullName);

      const matched =
        rows.find((member: any) => {
          const identities = [
            member?.id,
            member?.member_id,
            member?.nomor_kta,
            member?.no_kta,
            member?.email,
          ]
            .map(norm)
            .filter(Boolean);

          return preferredIdentities.some((identity) =>
            identities.includes(identity)
          );
        }) ||
        rows.find((member: any) => {
          const name = norm(
            member?.full_name ||
            member?.nama_lengkap ||
            member?.fullName
          );

          return Boolean(userName) && name === userName;
        }) ||
        null;

      if (!matched) {
        throw new Error(
          'Record anggota tidak ditemukan pada member.list GAS.'
        );
      }

      setKtaData(matched);
    } catch (e: any) {
      setKtaData(null);
      setError(
        e?.message ||
        'Data KTA gagal dimuat dari GAS.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadKta();
  }, [
    currentUser,
    selectedMemberId,
    qaPerspective,
  ]);

  const memberBinding: KtaMemberBindingData | null =
    useMemo(() => {
      if (!ktaData) return null;

      const noKta =
        ktaData?.nomor_kta ||
        ktaData?.no_kta ||
        ktaData?.nationalMemberNumber ||
        '';

      const fullName =
        ktaData?.full_name ||
        ktaData?.nama_lengkap ||
        ktaData?.fullName ||
        '';

      const photo =
        ktaData?.foto_url ||
        ktaData?.photo_url ||
        ktaData?.foto ||
        ktaData?.photoUrl ||
        '';

      const position =
        ktaData?.tingkat_keanggotaan ||
        ktaData?.position ||
        ktaData?.jabatan ||
        'Anggota';

      return {
        id:
          ktaData?.id ||
          ktaData?.member_id ||
          '',

        nationalMemberNumber: noKta,
        fullName,
        membershipLevel: position,
        currentPosition: position,

        provinceName:
          ktaData?.provinsi_nama ||
          ktaData?.province ||
          ktaData?.provinsi ||
          '',

        regencyName:
          ktaData?.kabupaten_kota_nama ||
          ktaData?.kabupaten_nama ||
          ktaData?.city ||
          ktaData?.kabupaten ||
          '',

        districtName:
          ktaData?.kecamatan_nama ||
          ktaData?.district ||
          ktaData?.kecamatan ||
          '',

        kwartirName:
          ktaData?.kwartir ||
          ktaData?.kwartir_name ||
          '',

        kwartirHierarchy:
          ktaData?.kwartir_hierarchy ||
          '',

        krida:
          ktaData?.krida_nama ||
          ktaData?.krida ||
          '',

        phone:
          ktaData?.phone ||
          ktaData?.no_hp ||
          '',

        email:
          ktaData?.email ||
          '',

        status:
          ktaData?.kta_status ||
          ktaData?.status_anggota ||
          ktaData?.status ||
          '',

        photoUrl: photo,

        qrToken:
          ktaData?.qr_token ||
          '',

        verificationUrl:
          ktaData?.verification_url ||
          '',
      } as KtaMemberBindingData;
    }, [ktaData]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center text-slate-500">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#0066B3]" />
          <p className="text-sm mt-2">
            Memuat KTA dari GAS...
          </p>
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
            <p className="font-bold text-red-900">
              KTA tidak dapat dimuat
            </p>
            <p className="text-sm text-red-700 mt-1">
              {error}
            </p>
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

  if (!memberBinding || !noKta || !qrToken) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900">
              KTA belum diterbitkan
            </p>
            <p className="text-sm text-amber-800 mt-1">
              Record anggota ditemukan di GAS, tetapi nomor KTA atau QR resmi belum tersedia.
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
