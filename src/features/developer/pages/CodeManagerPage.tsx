/**
 * SPWN Apps 2.0 - Super Admin Developer Console (Phase 7.1)
 * Route: /superadmin/developer/code-manager
 * Access: SUPER_ADMIN Only
 */

import React, { useState } from 'react';
import {
  FileCode,
  GitBranch,
  ShieldCheck,
  Copy,
  Check,
  Search,
  Download,
  Plus,
  History,
  Eye,
  CheckCircle2,
  Clock,
  Database,
  RefreshCw,
  FileCheck,
  Code2,
  Terminal,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useCodeRegistryStore } from '../stores/codeRegistryStore';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';
import { ROLES } from '../../../config/constants';
import { Button, Badge, Modal, Input, Select } from '../../../components/ui';
import { CodeRegistryRecord } from '../types/codeRegistry.types';

export const CodeManagerPage: React.FC = () => {
  const { currentUser, switchRole } = useAuthStore();
  const { addToast } = useUIStore();
  const {
    files,
    history,
    auditLogs,
    selectedFileId,
    activeConsoleTab,
    diffVersionA,
    diffVersionB,
    searchQuery,
    filterModule,
    filterStatus,
    setSelectedFileId,
    setActiveConsoleTab,
    setSearchQuery,
    setFilterModule,
    setFilterStatus,
    registerCodeFile,
    updateCodeContent,
    approveVersion,
    recordCopyAction,
    compareVersions,
    setDiffVersions,
  } = useCodeRegistryStore();

  // Modal States
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form New File
  const [newFileName, setNewFileName] = useState('');
  const [newFilePath, setNewFilePath] = useState('');
  const [newModule, setNewModule] = useState('SERVICES');
  const [newVersion, setNewVersion] = useState('1.0.0');
  const [newContent, setNewContent] = useState('');
  const [newChangeNote, setNewChangeNote] = useState('');

  // Form Update Revision
  const [updateVersion, setUpdateVersion] = useState('');
  const [updateChangeNote, setUpdateChangeNote] = useState('');
  const [editingContent, setEditingContent] = useState('');

  // Selected file reference
  const selectedFile = files.find((f) => f.id === selectedFileId) || files[0];

  // RBAC Guard: Strictly Super Admin Only
  if (currentUser.role !== ROLES.SUPER_ADMIN) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center px-4 space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Akses Terbatas: Super Admin Console</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Halaman <strong>SPWN Code Registry & GAS Export Management</strong> hanya dapat diakses oleh akun dengan peran <strong>SUPER_ADMIN</strong>.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-800 text-left space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-amber-900">
            <span>🛡️ Kebijakan Keamanan Sistem (Developer Audit Log)</span>
          </div>
          <p>
            Semua aktivitas pembacaan kode, penyalinan, dan persetujuan versi akan otomatis tercatat pada tabel <strong>Developer_Audit_Log</strong> di <strong>SPWN_SYSTEM_DATABASE</strong>.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Button
            size="sm"
            variant="primary"
            onClick={() => switchRole(ROLES.SUPER_ADMIN)}
          >
            Beralih ke Super Admin
          </Button>
        </div>
      </div>
    );
  }

  // Filtered files
  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.file_path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.change_note.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = filterModule === 'ALL' || file.module === filterModule;
    const matchesStatus = filterStatus === 'ALL' || file.status === filterStatus;
    return matchesSearch && matchesModule && matchesStatus;
  });

  // Handle Copy Code with Audit Log
  const handleCopyCode = (file: CodeRegistryRecord) => {
    navigator.clipboard.writeText(file.code_content);
    recordCopyAction(file.id, { name: currentUser.fullName, role: currentUser.role });
    setCopiedId(file.id);
    addToast({ type: 'success', title: 'Kode berhasil disalin & dicatat ke Developer_Audit_Log' });
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Handle Download Single File
  const handleDownloadFile = (file: CodeRegistryRecord) => {
    const blob = new Blob([file.code_content], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({ type: 'info', title: `Berkas ${file.file_name} berhasil diunduh` });
  };

  // Handle Create New File
  const handleCreateNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName || !newFilePath) {
      addToast({ type: 'error', title: 'Nama berkas dan jalur berkas wajib diisi' });
      return;
    }

    registerCodeFile(
      {
        file_name: newFileName,
        file_path: newFilePath,
        module: newModule,
        version: newVersion,
        code_content: newContent || `// ${newFileName}\n// SPWN Apps 2.0\n`,
        status: 'APPROVED',
        change_note: newChangeNote || 'Pendaftaran awal berkas kode baru',
      },
      { name: currentUser.fullName, role: currentUser.role }
    );

    setIsNewFileModalOpen(false);
    setNewFileName('');
    setNewFilePath('');
    setNewContent('');
    setNewChangeNote('');
    addToast({ type: 'success', title: 'Berkas kode berhasil didaftarkan ke Code_Registry' });
  };

  // Open Update Modal
  const openUpdateModal = (file: CodeRegistryRecord) => {
    const parts = file.version.split('.').map(Number);
    const nextVer = parts.length === 3 ? `${parts[0]}.${parts[1]}.${parts[2] + 1}` : `${file.version}.1`;
    setUpdateVersion(nextVer);
    setEditingContent(file.code_content);
    setUpdateChangeNote('');
    setIsUpdateModalOpen(true);
  };

  // Handle Save Update
  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    updateCodeContent(
      selectedFile.id,
      editingContent,
      updateVersion,
      updateChangeNote,
      { name: currentUser.fullName, role: currentUser.role }
    );

    setIsUpdateModalOpen(false);
    addToast({ type: 'success', title: `Versi baru v${updateVersion} berhasil dirilis & diarsipkan ke Code_Version_History` });
  };

  // Diff calculation
  const diffResult = diffVersionA && diffVersionB && selectedFile
    ? compareVersions(selectedFile.id, diffVersionA, diffVersionB)
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner & Context Info */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Database Connected
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SUPER_ADMIN Security Level
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Route: /superadmin/developer/code-manager
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Code2 className="w-7 h-7 text-emerald-400" />
              SPWN Code Registry & GAS Export Management
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Pusat pengelolaan dan orkestrasi dinamis seluruh berkas Google Apps Script SPWN Apps 2.0.
              Dilengkapi versioning otomatis, audit log mutasi, dan integrasi <strong>SPWN_SYSTEM_DATABASE</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white text-xs"
              onClick={() => setIsNewFileModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Daftarkan Berkas (.gs)
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
              onClick={() => {
                setActiveConsoleTab('export');
                addToast({ type: 'info', title: 'Membuka panel ekspor paket deployment Google Apps Script' });
              }}
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Deployment Packager
            </Button>
          </div>
        </div>

        {/* Database Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
            <div className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-blue-400" /> Target Database
            </div>
            <div className="font-semibold text-slate-200 mt-1">SPWN_SYSTEM_DATABASE</div>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
            <div className="text-slate-400 flex items-center gap-1.5 font-medium">
              <FileCode className="w-3.5 h-3.5 text-emerald-400" /> Code_Registry
            </div>
            <div className="font-semibold text-slate-200 mt-1">{files.length} Berkas Terdaftar</div>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
            <div className="text-slate-400 flex items-center gap-1.5 font-medium">
              <History className="w-3.5 h-3.5 text-purple-400" /> Code_Version_History
            </div>
            <div className="font-semibold text-slate-200 mt-1">
              {Object.values(history).reduce((acc, curr) => acc + curr.length, 0)} Riwayat Revisi
            </div>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
            <div className="text-slate-400 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Developer_Audit_Log
            </div>
            <div className="font-semibold text-slate-200 mt-1">{auditLogs.length} Audit Entries</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl px-2 shadow-sm">
        <button
          onClick={() => setActiveConsoleTab('registry')}
          className={`flex items-center gap-2 py-3.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeConsoleTab === 'registry'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Code Registry ({files.length})
        </button>

        <button
          onClick={() => setActiveConsoleTab('editor')}
          className={`flex items-center gap-2 py-3.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeConsoleTab === 'editor'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Source Inspector & Editor
        </button>

        <button
          onClick={() => setActiveConsoleTab('history')}
          className={`flex items-center gap-2 py-3.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeConsoleTab === 'history'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          Version History & Diff
        </button>

        <button
          onClick={() => setActiveConsoleTab('audit')}
          className={`flex items-center gap-2 py-3.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeConsoleTab === 'audit'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Developer Audit Log ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveConsoleTab('export')}
          className={`flex items-center gap-2 py-3.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeConsoleTab === 'export'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Download className="w-4 h-4" />
          Export Management
        </button>
      </div>

      {/* TAB 1: CODE REGISTRY TABLE */}
      {activeConsoleTab === 'registry' && (
        <div className="space-y-4">
          {/* Filters and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari berkas, lokasi path, atau catatan perubahan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="ALL">Semua Modul</option>
                <option value="CORE">CORE</option>
                <option value="SERVICES">SERVICES</option>
                <option value="CONTROLLERS">CONTROLLERS</option>
                <option value="CONFIG">CONFIG</option>
                <option value="REPOSITORIES">REPOSITORIES</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="ALL">Semua Status</option>
                <option value="APPROVED">APPROVED</option>
                <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>
          </div>

          {/* Files Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nama Berkas & Jalur</th>
                    <th className="py-3 px-3">Modul</th>
                    <th className="py-3 px-3">Versi</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Checksum (SHA-256)</th>
                    <th className="py-3 px-3">Pembaruan Terakhir</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredFiles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Tidak ada berkas yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <FileCode className="w-4 h-4 text-emerald-600 shrink-0" />
                            {file.file_name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {file.file_path}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">
                            {file.change_note}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            {file.module}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            v{file.version}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {file.status === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> APPROVED
                            </span>
                          )}
                          {file.status === 'PENDING_APPROVAL' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" /> PENDING
                            </span>
                          )}
                          {file.status === 'DRAFT' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              DRAFT
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60" title={file.checksum}>
                            {file.checksum.substring(0, 16)}...
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-[11px] font-medium text-slate-800">
                            {new Date(file.updated_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-[10px] text-slate-400">Oleh: {file.created_by}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedFileId(file.id, currentUser.fullName);
                                setActiveConsoleTab('editor');
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                              title="Buka Source Inspector"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleCopyCode(file)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition-colors"
                              title="Salin Kode (Otomatis Audit Log COPY_CODE)"
                            >
                              {copiedId === file.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDownloadFile(file)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                              title="Unduh Berkas .gs"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {file.status === 'PENDING_APPROVAL' && (
                              <Button
                                size="sm"
                                variant="primary"
                                className="text-[11px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500"
                                onClick={() => {
                                  approveVersion(file.id, file.version, { name: currentUser.fullName, role: currentUser.role });
                                  addToast({ type: 'success', title: `Versi ${file.version} telah disetujui (APPROVED)` });
                                }}
                              >
                                Setujui
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOURCE INSPECTOR & LIVE EDITOR */}
      {activeConsoleTab === 'editor' && selectedFile && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Selector Sidebar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Daftar Berkas Registry
            </h3>
            <div className="space-y-1">
              {files.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFileId(f.id, currentUser.fullName)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                    selectedFile.id === f.id
                      ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="truncate font-medium">{f.file_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{f.module}</div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-white rounded border border-slate-200 shrink-0">
                    v{f.version}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Code View */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Header bar */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-900">{selectedFile.file_name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                    v{selectedFile.version}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                    {selectedFile.module}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-1">
                  Path: {selectedFile.file_path}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs bg-white"
                  onClick={() => handleCopyCode(selectedFile)}
                >
                  {copiedId === selectedFile.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Disalin
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" /> Salin Kode
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs bg-white"
                  onClick={() => handleDownloadFile(selectedFile)}
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Unduh
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  className="text-xs bg-emerald-600 hover:bg-emerald-500"
                  onClick={() => openUpdateModal(selectedFile)}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Rilis Versi Baru
                </Button>
              </div>
            </div>

            {/* Checksum & Status Bar */}
            <div className="px-4 py-2 bg-slate-900 text-slate-300 text-[11px] font-mono flex items-center justify-between border-b border-slate-800">
              <div>SHA-256 Checksum: {selectedFile.checksum}</div>
              <div>{selectedFile.code_content.split('\n').length} baris kode • UTF-8</div>
            </div>

            {/* Code Content Display */}
            <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto min-h-[420px] max-h-[600px]">
              <pre className="leading-relaxed">
                {selectedFile.code_content.split('\n').map((line, idx) => (
                  <div key={idx} className="table-row hover:bg-slate-900/60">
                    <span className="table-cell text-slate-600 pr-4 select-none text-right w-10">
                      {idx + 1}
                    </span>
                    <span className="table-cell text-slate-100 whitespace-pre">{line}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VERSION HISTORY & DIFF */}
      {activeConsoleTab === 'history' && selectedFile && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-purple-600" />
                Riwayat Versi Kode: {selectedFile.file_name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Jalur: {selectedFile.file_path}
              </p>
            </div>

            {/* Diff Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Bandingkan:</span>
              <select
                value={diffVersionA || selectedFile.version}
                onChange={(e) => setDiffVersions(selectedFile.id, e.target.value, diffVersionB || '1.0.0')}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white font-mono"
              >
                <option value={selectedFile.version}>v{selectedFile.version} (Aktif)</option>
                {(history[selectedFile.id] || []).map((h) => (
                  <option key={h.id} value={h.version}>v{h.version}</option>
                ))}
              </select>
              <span className="text-xs text-slate-400">vs</span>
              <select
                value={diffVersionB || ((history[selectedFile.id] && history[selectedFile.id][0]?.version) || '1.0.0')}
                onChange={(e) => setDiffVersions(selectedFile.id, diffVersionA || selectedFile.version, e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white font-mono"
              >
                {(history[selectedFile.id] || []).map((h) => (
                  <option key={h.id} value={h.version}>v{h.version}</option>
                ))}
                <option value={selectedFile.version}>v{selectedFile.version} (Aktif)</option>
              </select>
            </div>
          </div>

          {/* Timeline of Revisions */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Arsip Revisi Code_Version_History
            </h4>

            <div className="divide-y divide-slate-100">
              {/* Active Version */}
              <div className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        v{selectedFile.version}
                      </span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        VERSI AKTIF
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{selectedFile.change_note}</p>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">
                      Checksum: {selectedFile.checksum} • Diperbarui: {new Date(selectedFile.updated_at).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs shrink-0"
                  onClick={() => handleCopyCode(selectedFile)}
                >
                  Salin
                </Button>
              </div>

              {/* Historical records */}
              {(history[selectedFile.id] || []).map((hist) => (
                <div key={hist.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-xs shrink-0 mt-0.5">
                      REV
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          v{hist.version}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          oleh {hist.changed_by}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{hist.change_note}</p>
                      <div className="text-[11px] text-slate-400 font-mono mt-1">
                        Checksum: {hist.checksum} • Tanggal: {new Date(hist.changed_at).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(hist.code_content);
                      addToast({ type: 'info', title: `Revisi v${hist.version} berhasil disalin` });
                    }}
                  >
                    Salin Revisi
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DEVELOPER AUDIT LOG */}
      {activeConsoleTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Developer Audit Log Trail (Live Database Audit)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tercatat di tabel <strong>Developer_Audit_Log</strong> pada <strong>SPWN_SYSTEM_DATABASE</strong>. Menjamin akuntabilitas dan jejak digital pengembang.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              Total Entri: {auditLogs.length}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Waktu (WIB)</th>
                    <th className="py-3 px-3">Aksi</th>
                    <th className="py-3 px-3">Pengembang / Pengguna</th>
                    <th className="py-3 px-3">Target Berkas</th>
                    <th className="py-3 px-4">Rincian / Metadata</th>
                    <th className="py-3 px-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3">
                        {log.action === 'VIEW_CODE' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            VIEW_CODE
                          </span>
                        )}
                        {log.action === 'COPY_CODE' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            COPY_CODE
                          </span>
                        )}
                        {log.action === 'APPROVE_VERSION' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            APPROVE_VERSION
                          </span>
                        )}
                        {log.action === 'REGISTER_CODE' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            REGISTER_CODE
                          </span>
                        )}
                        {log.action === 'UPDATE_CODE' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            UPDATE_CODE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{log.user_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.user_role}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {log.target_file}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs">
                        {log.details}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {log.ip_address}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EXPORT MANAGEMENT */}
      {activeConsoleTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              Google Apps Script Export & Deployment Packager
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              Gunakan perkakas ini untuk mengekspor seluruh kode sumber Google Apps Script terpusat ke dalam format siap pasang pada Google Apps Script Web App Editor (<span className="font-mono text-emerald-700">script.google.com</span>) atau konfigurasi bundle clasp.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-semibold text-slate-800">Petunjuk Deployment Google Apps Script:</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                <li>Buka editor proyek Google Apps Script pada akun Google Workspace Kwarnas/Pariwisata.</li>
                <li>Buat berkas sesuai struktur path atau salin berkas terdaftar di bawah ini.</li>
                <li>Pastikan Script Properties memiliki: <code className="bg-slate-200 px-1 rounded">SYSTEM_SPREADSHEET_ID</code>, <code className="bg-slate-200 px-1 rounded">MEMBER_SPREADSHEET_ID</code>, dll.</li>
                <li>Lakukan Deploy as Web App dengan akses <code className="bg-slate-200 px-1 rounded">Anyone</code> (akses dibatasi token Authorization).</li>
              </ol>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-500 text-xs"
                onClick={() => {
                  const combined = files
                    .map((f) => `// ==========================================\n// FILE: ${f.file_path} (v${f.version})\n// CHECKSUM: ${f.checksum}\n// ==========================================\n\n${f.code_content}\n\n`)
                    .join('\n');
                  navigator.clipboard.writeText(combined);
                  addToast({ type: 'success', title: 'Seluruh berkas kode SPWN berhasil digabung dan disalin ke clipboard!' });
                }}
              >
                <Copy className="w-4 h-4 mr-1.5" />
                Salin Seluruh Proyek (.gs) ke Clipboard
              </Button>
            </div>
          </div>

          {/* Quick list of files for export */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((f) => (
              <div key={f.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="truncate pr-2">
                  <div className="font-semibold text-xs text-slate-800 truncate">{f.file_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{f.file_path}</div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mt-1 inline-block">
                    v{f.version}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs shrink-0"
                  onClick={() => handleDownloadFile(f)}
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: DAFTARKAN BERKAS BARU */}
      <Modal
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        title="Daftarkan Berkas Google Apps Script (.gs)"
      >
        <form onSubmit={handleCreateNewFile} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Berkas</label>
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="contoh: audit.service.gs"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jalur Lokasi (file_path)</label>
            <Input
              value={newFilePath}
              onChange={(e) => setNewFilePath(e.target.value)}
              placeholder="contoh: backend/google-apps-script/services/audit.service.gs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Modul</label>
              <Select
                value={newModule}
                onChange={(e) => setNewModule(e.target.value)}
                options={[
                  { value: 'CORE', label: 'CORE' },
                  { value: 'SERVICES', label: 'SERVICES' },
                  { value: 'CONTROLLERS', label: 'CONTROLLERS' },
                  { value: 'CONFIG', label: 'CONFIG' },
                  { value: 'REPOSITORIES', label: 'REPOSITORIES' },
                ]}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Versi Awal</label>
              <Input
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                placeholder="1.0.0"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Perubahan (Change Note)</label>
            <Input
              value={newChangeNote}
              onChange={(e) => setNewChangeNote(e.target.value)}
              placeholder="Inisialisasi modul baru"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Isi Kode (Source Code)</label>
            <textarea
              rows={8}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Tulis atau tempel kode Google Apps Script di sini..."
              className="w-full font-mono text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewFileModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-500">
              Daftarkan ke Registry
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: UPDATE / RILIS VERSI BARU */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Rilis Versi Baru: ${selectedFile?.file_name}`}
      >
        <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Versi Baru</label>
              <Input
                value={updateVersion}
                onChange={(e) => setUpdateVersion(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Versi Sebelumnya</label>
              <Input value={selectedFile?.version || ''} disabled className="bg-slate-100" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Perubahan (Change Note)</label>
            <Input
              value={updateChangeNote}
              onChange={(e) => setUpdateChangeNote(e.target.value)}
              placeholder="Rincian perubahan pada versi ini..."
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Isi Kode Terkini</label>
            <textarea
              rows={12}
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="w-full font-mono text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUpdateModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-500">
              Simpan & Arsipkan Revisi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
