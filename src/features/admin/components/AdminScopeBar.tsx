/**
 * SPWN Apps 2.0 - SuperAdmin Role QA Inspector
 * Location: src/features/admin/components/AdminScopeBar.tsx
 */

import React, { useMemo } from 'react';
import {
  ShieldCheck,
  Building2,
  MapPinned,
  School,
  UserRoundCog,
  UserRound,
  ChevronRight,
  FlaskConical,
} from 'lucide-react';
import { useAdminStore } from '../stores/adminStore';
import { useUIStore } from '../../../stores/uiStore';
import { useAuthStore } from '../../../stores/authStore';
import { ROLES } from '../../../config/constants';

type QaPerspective =
  | 'SUPER_ADMIN'
  | 'ADMIN_KWARDA'
  | 'ADMIN_KWARCAB'
  | 'ADMIN_PANGKALAN'
  | 'PAMONG_SAKA'
  | 'PINSAKA'
  | 'MABISAKA'
  | 'ANGGOTA';

export const AdminScopeBar: React.FC = () => {
  const {
    members,
    qaPerspective,
    scopeProvinceId,
    scopeProvinceName,
    scopeRegencyId,
    scopeRegencyName,
    scopeDistrictId,
    scopeDistrictName,
    scopePangkalanId,
    scopePangkalanName,
    setQaPerspective,
  } = useAdminStore();

  const { setActiveView } = useUIStore();
  const { switchRole } = useAuthStore();

  const provinceOptions = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m: any) => {
      const id = String(m.provinsi_id || '').trim();
      const name = String(m.provinsi_nama || m.province || '').trim();
      if (id && name) map.set(id, name);
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  const regencyOptions = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m: any) => {
      if (
        scopeProvinceId !== 'ALL' &&
        String(m.provinsi_id || '') !== String(scopeProvinceId)
      ) return;

      const id = String(
        m.kabupaten_kota_id ||
        m.kabupaten_id ||
        ''
      ).trim();

      const name = String(
        m.kabupaten_kota_nama ||
        m.kabupaten_nama ||
        m.city ||
        ''
      ).trim();

      if (id && name) map.set(id, name);
    });

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members, scopeProvinceId]);

  const districtOptions = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m: any) => {
      if (
        scopeRegencyId !== 'ALL' &&
        String(m.kabupaten_kota_id || m.kabupaten_id || '') !==
          String(scopeRegencyId)
      ) return;

      const id = String(
        m.kecamatan_id ||
        m.wilayah_kecamatan_id ||
        ''
      ).trim();

      const name = String(
        m.kecamatan_nama ||
        m.wilayah_kecamatan_nama ||
        m.district ||
        ''
      ).trim();

      if (id && name) map.set(id, name);
    });

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members, scopeRegencyId]);

  const pangkalanOptions = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m: any) => {
      if (
        scopeDistrictId &&
        scopeDistrictId !== 'ALL' &&
        String(m.kecamatan_id || m.wilayah_kecamatan_id || '') !==
          String(scopeDistrictId)
      ) return;

      const name = String(
        m.pangkalan_gudep ||
        m.pangkalan ||
        m.gugus_depan ||
        ''
      ).trim();

      const id = String(m.pangkalan_id || name).trim();
      if (id && name) map.set(id, name);
    });

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members, scopeDistrictId]);

  const applyPerspective = (perspective: QaPerspective) => {
    if (perspective === 'ANGGOTA') {
      setQaPerspective('ANGGOTA', {
        provId: scopeProvinceId,
        provName: scopeProvinceName,
        regId: scopeRegencyId,
        regName: scopeRegencyName,
        distId: scopeDistrictId,
        distName: scopeDistrictName,
        pangkalanId: scopePangkalanId,
        pangkalanName: scopePangkalanName,
      });

      sessionStorage.setItem(
        'spwn_superadmin_role_qa_return',
        'true'
      );
      switchRole(ROLES.MEMBER);
      setActiveView('membership');
      return;
    }

    setQaPerspective(perspective, {
      provId: scopeProvinceId,
      provName: scopeProvinceName,
      regId: scopeRegencyId,
      regName: scopeRegencyName,
      distId: scopeDistrictId,
      distName: scopeDistrictName,
      pangkalanId: scopePangkalanId,
      pangkalanName: scopePangkalanName,
    });
  };

  const needsProvince = qaPerspective !== 'SUPER_ADMIN';
  const needsRegency = [
    'ADMIN_KWARCAB',
    'ADMIN_PANGKALAN',
    'PAMONG_SAKA',
    'PINSAKA',
    'MABISAKA',
    'ANGGOTA',
  ].includes(qaPerspective);

  const needsDistrict = [
    'ADMIN_PANGKALAN',
    'PAMONG_SAKA',
    'ANGGOTA',
  ].includes(qaPerspective);

  const needsPangkalan = needsDistrict;

  const roles: {
    id: QaPerspective;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'SUPER_ADMIN', label: 'SuperAdmin', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'ADMIN_KWARDA', label: 'Admin Kwarda', icon: <Building2 className="w-4 h-4" /> },
    { id: 'ADMIN_KWARCAB', label: 'Admin Kwarcab', icon: <MapPinned className="w-4 h-4" /> },
    { id: 'ADMIN_PANGKALAN', label: 'Admin Pangkalan', icon: <School className="w-4 h-4" /> },
    { id: 'PAMONG_SAKA', label: 'Pamong Saka', icon: <UserRoundCog className="w-4 h-4" /> },
    { id: 'PINSAKA', label: 'Pinsaka', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'MABISAKA', label: 'Mabisaka', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'ANGGOTA', label: 'Anggota', icon: <UserRound className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Mode Pemeriksaan Peran SuperAdmin
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Uji tampilan, scope, dan fitur setiap peran memakai data GAS nyata.
              </div>
            </div>
          </div>

          <div className="text-[10px] rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-amber-800">
            Session asli tetap <strong>SUPER_ADMIN</strong>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {roles.map((role) => {
            const active = qaPerspective === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => applyPerspective(role.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                  active
                    ? 'bg-violet-700 text-white border-violet-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300 hover:bg-violet-50'
                }`}
              >
                {role.icon}
                {role.label}
              </button>
            );
          })}
        </div>

        {needsProvince && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 pt-3 border-t border-slate-100">
            <select
              value={scopeProvinceId === 'ALL' ? '' : scopeProvinceId}
              onChange={(e) => {
                const selected = provinceOptions.find((x) => x.id === e.target.value);
                setQaPerspective(qaPerspective, {
                  provId: e.target.value || 'ALL',
                  provName: selected?.name || 'Seluruh Indonesia',
                  regId: 'ALL',
                  regName: 'Seluruh Kabupaten/Kota',
                  distId: 'ALL',
                  distName: 'Seluruh Kecamatan',
                  pangkalanId: 'ALL',
                  pangkalanName: 'Seluruh Pangkalan',
                });
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white"
            >
              <option value="">Pilih Provinsi / Kwarda</option>
              {provinceOptions.map((x) => (
                <option key={x.id} value={x.id}>{x.name}</option>
              ))}
            </select>

            {needsRegency && (
              <select
                value={scopeRegencyId === 'ALL' ? '' : scopeRegencyId}
                onChange={(e) => {
                  const selected = regencyOptions.find((x) => x.id === e.target.value);
                  setQaPerspective(qaPerspective, {
                    provId: scopeProvinceId,
                    provName: scopeProvinceName,
                    regId: e.target.value || 'ALL',
                    regName: selected?.name || 'Seluruh Kabupaten/Kota',
                    distId: 'ALL',
                    distName: 'Seluruh Kecamatan',
                    pangkalanId: 'ALL',
                    pangkalanName: 'Seluruh Pangkalan',
                  });
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white"
              >
                <option value="">Pilih Kabupaten/Kota / Kwarcab</option>
                {regencyOptions.map((x) => (
                  <option key={x.id} value={x.id}>{x.name}</option>
                ))}
              </select>
            )}

            {needsDistrict && (
              <select
                value={scopeDistrictId === 'ALL' ? '' : scopeDistrictId}
                onChange={(e) => {
                  const selected = districtOptions.find((x) => x.id === e.target.value);
                  setQaPerspective(qaPerspective, {
                    provId: scopeProvinceId,
                    provName: scopeProvinceName,
                    regId: scopeRegencyId,
                    regName: scopeRegencyName,
                    distId: e.target.value || 'ALL',
                    distName: selected?.name || 'Seluruh Kecamatan',
                    pangkalanId: 'ALL',
                    pangkalanName: 'Seluruh Pangkalan',
                  });
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white"
              >
                <option value="">Pilih Kecamatan</option>
                {districtOptions.map((x) => (
                  <option key={x.id} value={x.id}>{x.name}</option>
                ))}
              </select>
            )}

            {needsPangkalan && (
              <select
                value={scopePangkalanId === 'ALL' ? '' : scopePangkalanId}
                onChange={(e) => {
                  const selected = pangkalanOptions.find((x) => x.id === e.target.value);
                  setQaPerspective(qaPerspective, {
                    provId: scopeProvinceId,
                    provName: scopeProvinceName,
                    regId: scopeRegencyId,
                    regName: scopeRegencyName,
                    distId: scopeDistrictId,
                    distName: scopeDistrictName,
                    pangkalanId: e.target.value || 'ALL',
                    pangkalanName: selected?.name || 'Seluruh Pangkalan',
                  });
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white"
              >
                <option value="">Pilih Pangkalan</option>
                {pangkalanOptions.map((x) => (
                  <option key={x.id} value={x.id}>{x.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-1">
          <span className="font-semibold">Perspektif aktif:</span>
          <span>{qaPerspective}</span>

          {needsProvince && scopeProvinceId !== 'ALL' && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span>{scopeProvinceName}</span>
            </>
          )}

          {needsRegency && scopeRegencyId !== 'ALL' && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span>{scopeRegencyName}</span>
            </>
          )}

          {needsDistrict && scopeDistrictId !== 'ALL' && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span>{scopeDistrictName}</span>
            </>
          )}

          {needsPangkalan && scopePangkalanId !== 'ALL' && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span>{scopePangkalanName}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
