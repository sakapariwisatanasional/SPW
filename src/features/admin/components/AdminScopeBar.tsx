/**
 * SPWN Apps 2.0 - Admin Scope & RBAC Navigation Bar
 * Location: src/features/admin/components/AdminScopeBar.tsx
 */

import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, MapPin, Globe, ChevronRight, Code2 } from 'lucide-react';
import { useAdminStore } from '../stores/adminStore';
import { useUIStore } from '../../../stores/uiStore';
import { PROVINCES, getRegenciesByProvince } from '../../../data/wilayahData';

export const AdminScopeBar: React.FC = () => {
  const { setActiveView } = useUIStore();
  const {
    simulatedScope,
    scopeProvinceId,
    scopeProvinceName,
    scopeRegencyId,
    scopeRegencyName,
    setSimulatedScope,
  } = useAdminStore();

  const regenciesForJabar = getRegenciesByProvince(scopeProvinceId === 'ALL' ? '32' : scopeProvinceId);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Scope Context & Title */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              simulatedScope === 'SUPER_ADMIN'
                ? 'bg-purple-50 text-purple-700 border border-purple-200/80'
                : simulatedScope === 'ADMIN_PUSAT'
                ? 'bg-blue-50 text-[#0066B3] border border-blue-200/80'
                : 'bg-emerald-50 text-[#009B4D] border border-emerald-200/80'
            }`}
          >
            {simulatedScope === 'SUPER_ADMIN' ? (
              <ShieldAlert className="w-5 h-5" />
            ) : simulatedScope === 'ADMIN_PUSAT' ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <Shield className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Portal Administrasi SPWN Apps 2.0
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  simulatedScope === 'SUPER_ADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : simulatedScope === 'ADMIN_PUSAT'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {simulatedScope === 'SUPER_ADMIN'
                  ? 'SUPER_ADMIN (Nasional)'
                  : simulatedScope === 'ADMIN_PUSAT'
                  ? 'ADMIN_NASIONAL'
                  : 'ADMIN_WILAYAH'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-700 mt-1 flex-wrap font-medium">
              <span className="text-slate-500">Scope:</span>
              <span className="font-semibold text-slate-900">{scopeProvinceName}</span>
              {simulatedScope === 'ADMIN_WILAYAH' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-[#0066B3]">{scopeRegencyName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RBAC Role & Scope Switcher Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSimulatedScope('SUPER_ADMIN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              simulatedScope === 'SUPER_ADMIN'
                ? 'bg-white text-purple-700 shadow-xs border border-purple-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Super Admin
          </button>

          <button
            type="button"
            onClick={() => setSimulatedScope('ADMIN_PUSAT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              simulatedScope === 'ADMIN_PUSAT'
                ? 'bg-white text-[#0066B3] shadow-xs border border-blue-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin Nasional
          </button>

          <button
            type="button"
            onClick={() => setSimulatedScope('ADMIN_WILAYAH', '32', 'Jawa Barat', '3201', 'Kabupaten Bogor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              simulatedScope === 'ADMIN_WILAYAH'
                ? 'bg-white text-[#009B4D] shadow-xs border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin Wilayah (Jabar)
          </button>
        </div>
      </div>

      {/* Regional Scoping Dropdown (if ADMIN_WILAYAH) */}
      {simulatedScope === 'ADMIN_WILAYAH' && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
          <div className="flex items-center gap-1.5 text-emerald-800 font-semibold shrink-0">
            <MapPin className="w-4 h-4 text-[#009B4D]" />
            <span>Wilayah Binaan Aktif:</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={scopeProvinceId}
              onChange={(e) => {
                const prov = PROVINCES.find((p) => p.code === e.target.value);
                setSimulatedScope(
                  'ADMIN_WILAYAH',
                  e.target.value,
                  prov?.name || 'Jawa Barat',
                  'ALL',
                  'Seluruh Kabupaten'
                );
              }}
              className="bg-white border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="32">32 - JAWA BARAT</option>
              <option value="31">31 - DKI JAKARTA</option>
              <option value="33">33 - JAWA TENGAH</option>
              <option value="35">35 - JAWA TIMUR</option>
              <option value="51">51 - BALI</option>
            </select>

            <select
              value={scopeRegencyId}
              onChange={(e) => {
                const reg = regenciesForJabar.find((r) => r.code === e.target.value);
                setSimulatedScope(
                  'ADMIN_WILAYAH',
                  scopeProvinceId,
                  scopeProvinceName,
                  e.target.value,
                  reg?.name || 'Seluruh Kabupaten'
                );
              }}
              className="bg-white border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Kabupaten/Kota Binaan</option>
              {regenciesForJabar.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.code} - {r.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[11px] text-emerald-700 ml-auto italic">
            *Regional Scoping Middleware aktif: Hanya menampilkan anggota di wilayah ini.
          </span>
        </div>
      )}

      {/* Super Admin Developer Console Banner Shortcut */}
      {simulatedScope === 'SUPER_ADMIN' && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-purple-50/70 p-3 rounded-xl border border-purple-200/80">
          <div className="flex items-center gap-2 text-purple-900 font-semibold">
            <Code2 className="w-4 h-4 text-purple-700" />
            <span>Phase 7.1: SPWN Code Registry & GAS Export Management</span>
            <span className="bg-purple-200 text-purple-800 text-[10px] px-2 py-0.5 rounded font-mono">
              SUPER_ADMIN ONLY
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('/superadmin/developer/code-manager')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all cursor-pointer shadow-xs text-xs"
          >
            <span>Buka Developer Console</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
