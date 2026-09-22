/**
 * SPWN Apps 2.0 - Audit & Accountability Module (Module 5)
 * Location: src/features/admin/components/AuditAccountability.tsx
 */

import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  QrCode,
  Search,
  Filter,
  ArrowRight,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
} from 'lucide-react';
import { useAdminStore } from '../stores/adminStore';

export const AuditAccountability: React.FC = () => {
  const { changeHistory, publicLogs } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'changes' | 'scanner'>('changes');
  const [searchHistory, setSearchHistory] = useState('');

  const filteredHistory = changeHistory.filter((h) => {
    if (!searchHistory.trim()) return true;
    const q = searchHistory.toLowerCase();
    return (
      h.member_id.toLowerCase().includes(q) ||
      h.field_name.toLowerCase().includes(q) ||
      h.actor_id.toLowerCase().includes(q) ||
      h.reason.toLowerCase().includes(q)
    );
  });

  const filteredScannerLogs = publicLogs.filter((l) => {
    if (!searchHistory.trim()) return true;
    const q = searchHistory.toLowerCase();
    return (
      l.nomor_kta.toLowerCase().includes(q) ||
      l.nama_lengkap.toLowerCase().includes(q) ||
      l.qr_token.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('changes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'changes'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Member Change History ({changeHistory.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'scanner'
                ? 'bg-[#0066B3] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Log Verifikasi QR Scanner ({publicLogs.length})
          </button>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchHistory}
            onChange={(e) => setSearchHistory(e.target.value)}
            placeholder="Cari aktor, nomor KTA, field..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. MEMBER CHANGE HISTORY (BEFORE VS AFTER)                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'changes' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                Log Audit Rekam Jejak Perubahan Data (Member_Change_History)
              </h4>
              <p className="text-[11px] text-slate-500">
                Akuntabilitas mutlak: Setiap koreksi data wajib menyertakan perbandingan Before vs After dan alasan otorisasi
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
              {filteredHistory.length} Riwayat
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Waktu & Member ID</th>
                  <th className="py-3 px-4">Atribut / Field</th>
                  <th className="py-3 px-4">Nilai Sebelum (Before)</th>
                  <th className="py-3 px-4">Nilai Baru (After)</th>
                  <th className="py-3 px-4">Aktor & Role</th>
                  <th className="py-3 px-4">Alasan Otoritas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada riwayat perubahan yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 font-mono">{item.member_id}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.timestamp.substring(0, 16).replace('T', ' ')}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#0066B3] bg-blue-50 px-2 py-0.5 rounded-md">
                          {item.field_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-red-600 bg-red-50/40 rounded-sm">
                        {item.old_value || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700 bg-emerald-50/40 rounded-sm">
                        {item.new_value}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{item.actor_id}</p>
                        <p className="text-[10px] text-slate-500 font-mono uppercase">{item.actor_role}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-600 italic max-w-xs truncate">
                        {item.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. LOG VERIFIKASI QR SCANNER PUBLIK                           */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'scanner' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                Log Telemetri Pemindaian QR Scanner KTA Publik
              </h4>
              <p className="text-[11px] text-slate-500">
                Setiap pemindaian QR KTA oleh publik/petugas terekam secara aman dengan cap waktu dan status keabsahan
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#009B4D]" /> Real-time
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Waktu Pindai</th>
                  <th className="py-3 px-4">Nomor KTA & Nama</th>
                  <th className="py-3 px-4">QR Token</th>
                  <th className="py-3 px-4">Perangkat & IP Client</th>
                  <th className="py-3 px-4 text-right">Status Keabsahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredScannerLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">
                        {log.scanned_at.substring(0, 16).replace('T', ' ')}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{log.id}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-emerald-700">{log.nomor_kta}</p>
                      <p className="text-slate-800 font-semibold">{log.nama_lengkap}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.qr_token}</td>
                    <td className="py-3 px-4">
                      <p className="text-slate-700 flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-slate-400" />
                        {log.device_info}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">IP: {log.ip_address}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {log.verification_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
