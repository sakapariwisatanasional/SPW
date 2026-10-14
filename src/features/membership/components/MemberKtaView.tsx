/**
 * SPWN Apps 2.0
 * Member KTA View v5
 *
 * Rule of Truth:
 * - Data anggota: GAS member.list
 * - Template KTA: GAS admin.kta.template.get / TMPL_DEFAULT
 * - Render: DigitalMemberCard + previewSettings dari GAS
 *
 * Mendukung QA SuperAdmin tanpa mengganti session/token.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import { DigitalMemberCard } from '../../admin/components/DigitalMemberCard';
import {
  KtaCardSide,
  KtaCardSettings,
  KtaMemberBindingData,
} from '../../../types/kta.types';

import { useAuthStore } from '../../../stores/authStore';
import { useAdminStore } from '../../admin/stores/adminStore';
import { memberApi } from '../../../services/api/member.api';
import { spreadsheetService } from '../../../services/spreadsheetService';
import { mapMemberToKtaBinding } from '../../../utils/ktaMemberMapper';
import { resolveEffectiveMember } from '../utils/resolveEffectiveMember';

const norm = (value: unknown) =>
  String(value ?? '').trim().toLowerCase();

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

export const MemberKtaView: React.FC = () => {
  const { currentUser } = useAuthStore();

  const {
    selectedMemberId,
    qaPerspective,
    scopeProvinceId,
    scopeRegencyId,
    scopeDistrictId,
    scopePangkalanId,
  } = useAdminStore();

  const [cardSide, setCardSide] =
    useState<KtaCardSide>('FRONT');

  const [ktaData, setKtaData] =
    useState<any>(null);

  const [templateSettings, setTemplateSettings] =
    useState<KtaCardSettings | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [templateError, setTemplateError] =
    useState<string | null>(null);

  const resolveMemberFromList = (
    rows: any[],
    user: any
  ) =>
    resolveEffectiveMember({
      members: rows,
      currentUser: user,
      qaPerspective,
      selectedMemberId,
      scope: {
        provinceId: scopeProvinceId,
        regencyId: scopeRegencyId,
        districtId: scopeDistrictId,
        pangkalanId: scopePangkalanId,
      },
    });

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    setTemplateError(null);

    try {
      const user: any =
        currentUser || {};

      /*
       * Kedua sumber dibaca langsung dari GAS:
       * member.list + admin.kta.template.get
       */
      const [
        memberResponse,
        gasTemplate,
      ] = await Promise.all([
        memberApi.list({
          limit: 500,
        }),
        spreadsheetService
          .refreshKtaSettings(
            'TMPL_DEFAULT'
          ),
      ]);

      const rawMemberList: any =
        memberResponse?.data;

      const rows: any[] =
        Array.isArray(rawMemberList)
          ? rawMemberList
          : Array.isArray(
              rawMemberList?.data
            )
          ? rawMemberList.data
          : Array.isArray(
              rawMemberList?.members
            )
          ? rawMemberList.members
          : [];

      if (!rows.length) {
        throw new Error(
          'Daftar anggota dari GAS kosong.'
        );
      }

      const matched =
        resolveMemberFromList(
          rows,
          user
        );

      if (!matched) {
        throw new Error(
          'Record anggota untuk mode ini tidak ditemukan pada member.list GAS.'
        );
      }

      setKtaData(matched);

      if (!gasTemplate) {
        setTemplateSettings(null);
        setTemplateError(
          'Template TMPL_DEFAULT tidak berhasil dimuat dari GAS.'
        );
        return;
      }

      setTemplateSettings(
        gasTemplate
      );
    } catch (e: any) {
      setKtaData(null);

      setError(
        e?.message ||
        'KTA gagal dimuat dari GAS.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, [
    currentUser,
    selectedMemberId,
    qaPerspective,
    scopeProvinceId,
    scopeRegencyId,
    scopeDistrictId,
    scopePangkalanId,
  ]);

  const memberBinding:
    KtaMemberBindingData | null =
    useMemo(() => {
      if (!ktaData) {
        return null;
      }

      /*
       * Gunakan mapper yang sama dengan
       * Designer & KTA Management.
       */
      return mapMemberToKtaBinding(
        ktaData
      );
    }, [ktaData]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center text-slate-500">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#0066B3]" />
          <p className="text-sm mt-2">
            Memuat anggota dan template KTA dari GAS...
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
              onClick={() =>
                void loadAll()
              }
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

  if (
    !memberBinding
  ) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
        Data anggota KTA tidak tersedia.
      </div>
    );
  }

  if (
    !templateSettings
  ) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />

          <div>
            <p className="font-bold text-amber-900">
              Template KTA GAS belum tersedia
            </p>

            <p className="text-sm text-amber-800 mt-1">
              {templateError ||
                'TMPL_DEFAULT tidak berhasil dimuat.'}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadAll()
              }
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white border border-amber-200 px-3 py-2 text-xs font-bold text-amber-800"
            >
              <RefreshCw className="w-4 h-4" />
              Muat Ulang Template GAS
            </button>
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

          <p className="text-xs text-emerald-700 font-semibold mt-1">
            Template aktif: {templateSettings.name || 'TMPL_DEFAULT'} • GAS
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadAll()
          }
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
        >
          <RefreshCw className="w-4 h-4" />
          Muat Ulang
        </button>
      </div>

      <div className="flex justify-center">
        <DigitalMemberCard
          member={memberBinding}
          previewSettings={
            templateSettings
          }
          side={cardSide}
          onSideChange={
            setCardSide
          }
          showControls={true}
        />
      </div>
    </div>
  );
};
