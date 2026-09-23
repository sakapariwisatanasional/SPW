/**
 * SPWN Apps 2.0 - KTA Card Template Designer Modal
 * Location: src/features/admin/components/KtaCardCustomizerModal.tsx
 * -------------------------------------------------------------
 * Modul terintegrasi KTA Designer Saka Pariwisata Nasional:
 * 1. Hybrid Layout Architecture (Structured Auto-Flow Identity Stack)
 * 2. 3-Zone Protection: Photo (0-26%), Identity Stack (28-74%), Dynamic QR (76-96%)
 * 3. KTA Layout Guard: Real-time collision detection, density meter, auto-scaling
 * 4. Logo Safe Zone: Terisolasi di Header atau Background Watermark (Zero Photo Collision)
 * 5. Dynamic Data Binding Anggota (termasuk membershipLevel)
 * 6. Dynamic QR Identity System (Direct URL verification, zero Drive image)
 * 7. RBAC Security: Hanya SUPER_ADMIN yang berhak mengedit (Admin lain Read-Only)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sliders,
  Palette,
  CreditCard,
  QrCode,
  Layers,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Upload,
  UserCheck,
  Shield,
  FileText,
  Lock,
  Sparkles,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Info,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  KtaCardSettings,
  KtaCardPreset,
  KtaCardSide,
  KtaDataFieldConfig,
  KtaMemberFieldKey,
  KtaMemberBindingData,
  KtaLogoElement,
  KtaLogoSafePlacement,
  KtaIdentityDensity,
  SakaMembershipLevel,
} from '../../../types/kta.types';
import { storage, DEFAULT_KTA_SETTINGS, DEFAULT_KTA_DATA_FIELDS } from '../../../services/storage';
import { spreadsheetService } from '../../../services/spreadsheetService';
import { DigitalMemberCard, calculateLayoutGuard } from './DigitalMemberCard';
import { useAdminStore } from '../stores/adminStore';

interface KtaCardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionUserName?: string;
  userRole?: string;
  onSaved?: (settings: KtaCardSettings) => void;
}

export const KtaCardCustomizerModal: React.FC<KtaCardCustomizerModalProps> = ({
  isOpen,
  onClose,
  sessionUserName = 'Super Administrator',
  userRole = 'SUPER_ADMIN',
  onSaved,
}) => {
  // Store & RBAC
  const { simulatedScope } = useAdminStore();
  const effectiveRole = userRole || simulatedScope;
  const isSuperAdmin = effectiveRole === 'SUPER_ADMIN';

  // State Settings
  const [settings, setSettings] = useState<KtaCardSettings>(DEFAULT_KTA_SETTINGS);
  const [previewSide, setPreviewSide] = useState<KtaCardSide>('FRONT');
  const [activeTab, setActiveTab] = useState<'size' | 'front' | 'back' | 'data' | 'signer'>('data');
  const [membersList, setMembersList] = useState<KtaMemberBindingData[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Load Settings & Sample Members
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    // 1. Ambil data anggota untuk Dynamic Data Binding
    const members = storage.getMembers();
    setMembersList(members);
    if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].id);
    }

    // 2. Ambil KTA settings dari spreadsheet / local storage
    try {
      const current = await spreadsheetService.refreshKtaSettings();
      if (current) {
        setSettings(current);
      } else {
        setSettings(storage.getKtaSettings());
      }
    } catch {
      setSettings(storage.getKtaSettings());
    }
  };

  // Preview Member terpilih
  const previewMember = useMemo(() => {
    if (!membersList || membersList.length === 0) {
      return storage.getMembers()[0];
    }
    const found = membersList.find((m) => m.id === selectedMemberId);
    return found || membersList[0];
  }, [membersList, selectedMemberId]);

  // Collision Guard real-time calculations
  const activeFrontFields = useMemo(() => {
    return (settings.dataFields || []).filter((f) => f.side === 'FRONT' && f.visible);
  }, [settings.dataFields]);

  const layoutGuard = useMemo(() => {
    return calculateLayoutGuard(
      activeFrontFields,
      settings.identityDensity,
      settings.identityFontScale,
      settings.heightMm
    );
  }, [activeFrontFields, settings.identityDensity, settings.identityFontScale, settings.heightMm]);

  // Handle Preset Change
  const handlePresetChange = (preset: KtaCardPreset) => {
    if (!isSuperAdmin) return;
    let w = 85.6;
    let h = 53.98;
    let r = 3.18;

    if (preset === 'KTP') {
      w = 85.6;
      h = 53.98;
      r = 3.18;
    } else if (preset === 'SIM') {
      w = 86.0;
      h = 54.0;
      r = 3.0;
    } else if (preset === 'CR80_KTA') {
      w = 85.6;
      h = 53.98;
      r = 3.18;
    }

    setSettings((prev) => ({
      ...prev,
      preset,
      widthMm: w,
      heightMm: h,
      cornerRadiusMm: r,
    }));
  };

  // Auto-Guard Real-Time Engine:
  // Secara otomatis memantau kepadatan elemen dan menyesuaikan ukuran font atau
  // menyembunyikan label tambahan jika melebihi batas area desain kartu.
  useEffect(() => {
    if (!isOpen || !settings.autoArrangeEnabled || !isSuperAdmin) return;

    if (layoutGuard.isOvercrowded) {
      const needsScaleAdj =
        Math.abs((settings.identityFontScale || 1.0) - layoutGuard.recommendedFontScale) > 0.02;
      const needsDensityAdj =
        settings.identityDensity !== (layoutGuard.recommendedDensity || 'compact');
      const hasLabelsShown =
        settings.showFieldLabels !== false &&
        settings.dataFields.some(
          (f) =>
            f.side === 'FRONT' &&
            f.visible &&
            f.showLabel &&
            f.field !== 'fullName' &&
            f.field !== 'nationalMemberNumber'
        );

      if (needsScaleAdj || needsDensityAdj || hasLabelsShown) {
        setSettings((prev) => ({
          ...prev,
          identityFontScale: layoutGuard.recommendedFontScale,
          identityDensity: layoutGuard.recommendedDensity || 'compact',
          showFieldLabels: false,
          dataFields: prev.dataFields.map((f) =>
            f.side === 'FRONT' && f.field !== 'fullName' && f.field !== 'nationalMemberNumber'
              ? { ...f, showLabel: false }
              : f
          ),
        }));
      }
    }
  }, [
    isOpen,
    settings.autoArrangeEnabled,
    isSuperAdmin,
    layoutGuard.isOvercrowded,
    layoutGuard.recommendedFontScale,
    layoutGuard.recommendedDensity,
  ]);

  // Auto Arrange / Collision Optimizer
  const handleAutoArrange = () => {
    if (!isSuperAdmin) return;
    setSettings((prev) => ({
      ...prev,
      autoArrangeEnabled: true,
      identityDensity: layoutGuard.recommendedDensity || (activeFrontFields.length > 5 ? 'compact' : 'standard'),
      identityFontScale: layoutGuard.recommendedFontScale,
      showFieldLabels: false,
      dataFields: prev.dataFields.map((f) =>
        f.side === 'FRONT' && f.field !== 'fullName' && f.field !== 'nationalMemberNumber'
          ? { ...f, showLabel: false }
          : f
      ),
    }));
    setNotification({
      type: 'success',
      message: 'KTA Layout Guard: Tata letak & font berhasil disesuaikan otomatis pas ke batas area desain.',
    });
  };

  // Reset Tata Letak & Skala ke Standar
  const handleResetLayoutGuard = () => {
    if (!isSuperAdmin) return;
    setSettings((prev) => ({
      ...prev,
      identityFontScale: 1.0,
      identityDensity: 'standard',
      showFieldLabels: true,
    }));
    setNotification({
      type: 'info',
      message: 'Skala font dan kepadatan dikembalikan ke nilai standar.',
    });
  };

  // Handle Field Updates
  const updateDataField = (id: string, updates: Partial<KtaDataFieldConfig>) => {
    if (!isSuperAdmin) return;
    setSettings((prev) => ({
      ...prev,
      dataFields: prev.dataFields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  // Handle Reorder Field within Stack
  const moveFieldOrder = (index: number, direction: 'UP' | 'DOWN') => {
    if (!isSuperAdmin) return;
    const fields = [...settings.dataFields];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const temp = fields[index];
    fields[index] = fields[targetIndex];
    fields[targetIndex] = temp;

    // Update order numbers
    fields.forEach((f, idx) => {
      f.order = idx + 1;
    });

    setSettings((prev) => ({
      ...prev,
      dataFields: fields,
    }));
  };

  // Handle Image Upload to Google Drive
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'frontBg' | 'backBg' | 'logo'
  ) => {
    if (!isSuperAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setNotification({
        type: 'error',
        message: 'Ukuran berkas melebihi batas 2MB. Gunakan berkas gambar yang lebih ringkas.',
      });
      return;
    }

    setIsUploading(true);
    setNotification(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const folderType = target === 'logo' ? 'logo' : 'background';
      const filename = `kta_${target}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      const res = await spreadsheetService.uploadImageToDrive(base64, filename, folderType);

      if (res.success && res.directUrl) {
        if (target === 'frontBg') {
          setSettings((prev) => ({ ...prev, frontBackgroundUrl: res.directUrl }));
        } else if (target === 'backBg') {
          setSettings((prev) => ({ ...prev, backBackgroundUrl: res.directUrl }));
        } else if (target === 'logo') {
          setSettings((prev) => {
            const existingLogos = prev.logos || [];
            const otherLogos = existingLogos.filter((l) => l.side !== previewSide);
            const newLogo = {
              id: `logo-${Date.now()}`,
              name: file.name,
              url: res.directUrl!,
              side: previewSide,
              placement: prev.logoSafePlacement || 'HEADER_LEFT',
              x: 4,
              y: 4,
              width: 8,
              height: 8,
              opacity: 100,
              objectFit: 'contain' as const,
            };
            return {
              ...prev,
              logos: [...otherLogos, newLogo],
            };
          });
        }

        setNotification({
          type: 'success',
          message: res.message || 'Gambar berhasil diunggah ke Google Drive.',
        });
      } else {
        setNotification({
          type: 'error',
          message: res.message || 'Gagal mengunggah berkas ke Drive.',
        });
      }
      setIsUploading(false);
    };

    reader.onerror = () => {
      setIsUploading(false);
      setNotification({
        type: 'error',
        message: 'Gagal membaca berkas gambar lokal.',
      });
    };

    reader.readAsDataURL(file);
  };

  // Tambah Logo Baru (Bebas Koordinat X, Y)
  const addLogo = (side: 'FRONT' | 'BACK') => {
    if (!isSuperAdmin) return;
    const newLogo: KtaLogoElement = {
      id: `logo-${Date.now()}`,
      name: side === 'FRONT' ? 'Logo Depan' : 'Logo Belakang',
      url: '',
      side,
      placement: side === 'FRONT' ? 'HEADER_LEFT' : undefined,
      x: side === 'FRONT' ? 10 : 85,
      y: side === 'FRONT' ? 10 : 10,
      width: 10,
      height: 10,
      opacity: 100,
      objectFit: 'contain',
      visible: true,
    };
    setSettings((prev) => ({
      ...prev,
      logos: [...(prev.logos || []), newLogo],
    }));
  };

  const updateLogo = (id: string, updates: Partial<KtaLogoElement>) => {
    if (!isSuperAdmin) return;
    setSettings((prev) => ({
      ...prev,
      logos: (prev.logos || []).map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  };

  const removeLogo = (id: string) => {
    if (!isSuperAdmin) return;
    setSettings((prev) => ({
      ...prev,
      logos: (prev.logos || []).filter((l) => l.id !== id),
    }));
  };

  // Upload Logo Spesifik untuk Sisi Tertentu
  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'FRONT' | 'BACK',
    logoId?: string
  ) => {
    if (!isSuperAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setNotification({
        type: 'error',
        message: 'Ukuran berkas melebihi batas 2MB. Gunakan berkas gambar yang lebih ringkas.',
      });
      return;
    }

    setIsUploading(true);
    setNotification(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const filename = `kta_logo_${side.toLowerCase()}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const res = await spreadsheetService.uploadImageToDrive(base64, filename, 'logo');

      if (res.success && res.directUrl) {
        setSettings((prev) => {
          const existingLogos = prev.logos || [];
          if (logoId) {
            return {
              ...prev,
              logos: existingLogos.map((l) =>
                l.id === logoId ? { ...l, url: res.directUrl!, name: file.name } : l
              ),
            };
          } else {
            const newLogo: KtaLogoElement = {
              id: `logo-${Date.now()}`,
              name: file.name,
              url: res.directUrl!,
              side,
              placement: side === 'FRONT' ? 'HEADER_LEFT' : undefined,
              x: side === 'FRONT' ? 10 : 85,
              y: side === 'FRONT' ? 10 : 10,
              width: 10,
              height: 10,
              opacity: 100,
              objectFit: 'contain',
              visible: true,
            };
            return {
              ...prev,
              logos: [...existingLogos, newLogo],
            };
          }
        });
        setNotification({
          type: 'success',
          message: 'Logo berhasil diunggah ke Google Drive.',
        });
      } else {
        setNotification({
          type: 'error',
          message: res.message || 'Gagal mengunggah logo ke Google Drive.',
        });
      }
      setIsUploading(false);
    };

    reader.onerror = () => {
      setIsUploading(false);
      setNotification({
        type: 'error',
        message: 'Gagal membaca berkas gambar.',
      });
    };

    reader.readAsDataURL(file);
  };

  // Save Settings to Spreadsheet / Storage
  const handleSaveSettings = async () => {
    if (!isSuperAdmin) {
      setNotification({
        type: 'error',
        message: 'Akses Ditolak: Hanya SUPER_ADMIN yang berhak menyimpan template KTA.',
      });
      return;
    }

    setIsSaving(true);
    setNotification(null);

    try {
      const res = await spreadsheetService.saveKtaTemplate(settings, effectiveRole, sessionUserName);
      if (res.success) {
        setNotification({
          type: 'success',
          message: res.message || 'Konfigurasi template KTA berhasil disimpan.',
        });
        onSaved?.(settings);
      } else {
        setNotification({
          type: 'error',
          message: res.message || 'Gagal menyimpan konfigurasi ke spreadsheet.',
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Terjadi kesalahan saat menyimpan pengaturan.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to Default Template
  const handleResetDefault = () => {
    if (!isSuperAdmin) return;
    if (window.confirm('Kembalikan seluruh tata letak KTA ke pengaturan standar resmi SPWN?')) {
      setSettings(DEFAULT_KTA_SETTINGS);
      storage.saveKtaSettings(DEFAULT_KTA_SETTINGS);
      setNotification({
        type: 'info',
        message: 'Pengaturan KTA telah dikembalikan ke standar baku resmi SPWN Apps 2.0.',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* ============================================================== */}
        {/* MODAL HEADER                                                   */}
        {/* ============================================================== */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0066B3]/10 flex items-center justify-center text-[#0066B3]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Desainer KTA Digital Saka Pariwisata
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0066B3]/10 text-[#0066B3]">
                  Hybrid 3-Zone
                </span>
                {!isSuperAdmin && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    <Lock className="w-3 h-3" /> Read Only
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Layout Anti-Collision dengan Structured Auto-Flow Identity Stack & Dynamic QR Identity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : notification.type === 'info'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : notification.type === 'info' ? (
                <Info className="w-4 h-4 text-blue-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* RBAC Warning Banner for Non Super Admin */}
        {!isSuperAdmin && (
          <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-800">
            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              Anda sedang melihat dalam <b>Mode Pratinjau</b>. Hanya Super Administrator yang memiliki wewenang memodifikasi tata letak dan menyimpan template KTA ke Spreadsheet.
            </span>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL MAIN CONTENT (2 PANELS: PREVIEW & SETTINGS)              */}
        {/* ============================================================== */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* LEFT PANEL: LIVE PREVIEW & MEMBER SELECTOR (5 cols) */}
          <div className="lg:col-span-5 border-r border-slate-200 bg-slate-50/50 p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              {/* Member Selector for Dynamic Data Binding */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#0066B3]" />
                    Pratinjau Data Anggota:
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {membersList.length} Anggota Tersedia
                  </span>
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066B3]/20 shadow-2xs cursor-pointer"
                >
                  {membersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.membershipLevel || 'Anggota'} - {m.nationalMemberNumber || m.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Digital Card Preview Component */}
              <div className="pt-2">
                <DigitalMemberCard
                  member={previewMember}
                  previewSettings={settings}
                  side={previewSide}
                  showControls={false}
                  onSideChange={setPreviewSide}
                />
              </div>

              {/* Sisi & Ukuran Quick Controls */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewSide('FRONT')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      previewSide === 'FRONT'
                        ? 'bg-white text-[#0066B3] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Depan (3-Zone)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewSide('BACK')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      previewSide === 'BACK'
                        ? 'bg-white text-[#0066B3] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Belakang (Pengesah)
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {settings.widthMm} × {settings.heightMm} mm
                </div>
              </div>

              {/* KTA Layout Guard Live Collision & Density Protection System */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`p-1.5 rounded-lg ${
                        settings.autoArrangeEnabled
                          ? 'bg-blue-50 text-[#0066B3]'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block leading-tight">
                        KTA Layout Guard
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Sistem Proteksi Kepadatan Desain
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      layoutGuard.isOvercrowded
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : layoutGuard.densityScore > 65
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    Kepadatan: {layoutGuard.densityScore}%{' '}
                    {layoutGuard.isOvercrowded ? '(Padat)' : '(Aman)'}
                  </span>
                </div>

                {/* Progress bar kepadatan */}
                <div className="space-y-1">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
                    {/* Batas aman marker at 82% */}
                    <div className="absolute top-0 bottom-0 left-[82%] w-0.5 bg-rose-400 z-10 opacity-70" />
                    <div
                      className={`h-full transition-all duration-300 ${
                        layoutGuard.densityScore > 82
                          ? 'bg-rose-500'
                          : layoutGuard.densityScore > 65
                          ? 'bg-[#0066B3]'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, layoutGuard.densityScore)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>0% (Lapang)</span>
                    <span className="text-amber-600 font-semibold">Batas Aman 82%</span>
                    <span>100% (Maksimal)</span>
                  </div>
                </div>

                {/* Grid Rincian Metrik & Status Elemen */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Tinggi Area Terpakai</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {layoutGuard.occupiedHeightPx || 0}px / {layoutGuard.availableHeightPx || 140}px
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Label Tambahan</span>
                    <span
                      className={`font-semibold font-mono ${
                        layoutGuard.suggestHideLabels || settings.showFieldLabels === false
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {layoutGuard.suggestHideLabels || settings.showFieldLabels === false
                        ? 'Disembunyikan'
                        : 'Ditampilkan'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Skala Font Terpasang</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {(settings.identityFontScale || 1.0).toFixed(2)}x
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Rekomendasi Font</span>
                    <span className="font-semibold text-[#0066B3] font-mono">
                      {(layoutGuard.recommendedFontScale || 1.0).toFixed(2)}x
                    </span>
                  </div>
                </div>

                {/* Auto-Guard Toggle Switch */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/60 border border-blue-200/70">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#0066B3] shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-blue-950 block leading-tight">
                        Proteksi Otomatis (Auto-Guard)
                      </span>
                      <span className="text-[10px] text-blue-700 block">
                        Otomatis kecilkan font & sembunyikan label saat melebihi batas
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!isSuperAdmin}
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        autoArrangeEnabled: !prev.autoArrangeEnabled,
                      }))
                    }
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.autoArrangeEnabled ? 'bg-[#0066B3]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.autoArrangeEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Collision Warning Message or Safe Confirmation */}
                {layoutGuard.isOvercrowded ? (
                  <div className="flex items-start gap-2 text-xs text-rose-900 bg-rose-50/80 p-2.5 rounded-xl border border-rose-200">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{layoutGuard.warningMessage}</p>
                      <button
                        type="button"
                        onClick={handleAutoArrange}
                        disabled={!isSuperAdmin}
                        className="mt-1.5 text-[11px] font-bold text-[#0066B3] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Terapkan Penyesuaian Otomatis Sekarang
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 text-[11px] text-emerald-800 bg-emerald-50/60 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Layout Aman & Proporsional. Bebas penumpukan teks.</span>
                    </div>
                    {(settings.identityFontScale || 1.0) !== 1.0 && (
                      <button
                        type="button"
                        onClick={handleResetLayoutGuard}
                        disabled={!isSuperAdmin}
                        className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                      >
                        Reset Standar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick 3-Zone Architecture Visual Guide */}
            <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">Arsitektur 3-Zona Baku SPWN 2.0:</p>
              <div className="grid grid-cols-3 gap-1 text-center font-mono">
                <span className="p-1 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  Z1: Foto (0-26%)
                </span>
                <span className="p-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Z2: Stack (28-74%)
                </span>
                <span className="p-1 rounded bg-purple-50 text-purple-800 border border-purple-200">
                  Z3: QR (76-96%)
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: SETTINGS TABS (7 cols) */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-white">
            {/* TAB NAVIGATION BAR */}
            <div className="flex items-center border-b border-slate-200 px-4 pt-2 bg-slate-50/70 overflow-x-auto gap-1">
              <button
                onClick={() => {
                  setActiveTab('data');
                  setPreviewSide('FRONT');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'data'
                    ? 'border-[#0066B3] text-[#0066B3] bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Identity Stack</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('front');
                  setPreviewSide('FRONT');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'front'
                    ? 'border-[#0066B3] text-[#0066B3] bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Sisi Depan</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('back');
                  setPreviewSide('BACK');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'back'
                    ? 'border-[#0066B3] text-[#0066B3] bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Sisi Belakang</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('signer');
                  setPreviewSide('BACK');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'signer'
                    ? 'border-[#0066B3] text-[#0066B3] bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pengesahan</span>
              </button>

              <button
                onClick={() => setActiveTab('size')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'size'
                    ? 'border-[#0066B3] text-[#0066B3] bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Ukuran Kartu</span>
              </button>
            </div>

            {/* TAB CONTENT BODY */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5">
              {/* ========================================================= */}
              {/* TAB 1: IDENTITY STACK & DATA (ANTI-COLLISION SYSTEM)      */}
              {/* ========================================================= */}
              {activeTab === 'data' && (
                <div className="space-y-4">
                  {/* Header info & Auto Arrange CTA */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-white to-blue-50/30 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                    <div>
                      <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#0066B3]" />
                        Structured Auto-Flow Identity Stack
                      </h4>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        Field identitas mengalir vertikal rapi tanpa koordinat manual X/Y, menjamin zero collision dan presisi cetak kartu.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoArrange}
                      disabled={!isSuperAdmin}
                      className="px-3.5 py-2 rounded-xl bg-[#0066B3] text-white border-2 border-[#0066B3] hover:bg-white hover:text-[#0066B3] hover:border-[#0066B3] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Auto Arrange</span>
                    </button>
                  </div>

                  {/* Kepadatan & Skala Slider */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          Tingkat Kepadatan Teks (Density)
                        </label>
                        {settings.autoArrangeEnabled && layoutGuard.isOvercrowded && (
                          <span className="text-[9px] font-bold text-[#0066B3] bg-blue-50 px-1.5 py-0.5 rounded">
                            Auto-Guard Aktif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {(['compact', 'standard', 'spacious'] as KtaIdentityDensity[]).map((d) => (
                          <button
                            key={d}
                            type="button"
                            disabled={!isSuperAdmin}
                            onClick={() =>
                              setSettings((prev) => ({ ...prev, identityDensity: d }))
                            }
                            className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all capitalize cursor-pointer ${
                              settings.identityDensity === d
                                ? 'bg-white text-[#0066B3] border-[#0066B3] shadow-xs'
                                : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                        <span>Skala Ukuran Huruf (Font Scale)</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-[#0066B3]">
                            {(settings.identityFontScale || 1.0).toFixed(2)}x
                          </span>
                          {layoutGuard.recommendedFontScale !== (settings.identityFontScale || 1.0) && (
                            <span className="text-[10px] text-slate-400">
                              (Rek: {layoutGuard.recommendedFontScale.toFixed(2)}x)
                            </span>
                          )}
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0.70"
                        max="1.25"
                        step="0.02"
                        disabled={!isSuperAdmin}
                        value={settings.identityFontScale || 1.0}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            identityFontScale: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full accent-[#0066B3] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Toggle Global Label Field & Keterangan KTA Layout Guard */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Tampilkan Label Field Tambahan
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Label teks bantu (misal: "Jabatan:", "Gugus Depan:"). Otomatis disembunyikan jika area kartu padat.
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={!isSuperAdmin}
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          showFieldLabels: prev.showFieldLabels === false ? true : false,
                        }))
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.showFieldLabels !== false ? 'bg-[#0066B3]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          settings.showFieldLabels !== false ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Field List (Urutan Default 7 Field Utama) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Urutan & Konfigurasi Field ({activeFrontFields.length} Aktif)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Urutan: Nama → KTA → Level → Jabatan → Krida → Kwartir → Gudep
                      </span>
                    </div>

                    <div className="space-y-2">
                      {settings.dataFields.map((field, idx) => (
                        <div
                          key={field.id}
                          className={`p-3 rounded-2xl border transition-all ${
                            field.visible
                              ? 'bg-white border-slate-200 shadow-2xs'
                              : 'bg-slate-50 border-slate-200/80 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <input
                                type="checkbox"
                                disabled={!isSuperAdmin}
                                checked={field.visible}
                                onChange={(e) =>
                                  updateDataField(field.id, { visible: e.target.checked })
                                }
                                className="w-4 h-4 rounded text-[#0066B3] cursor-pointer"
                              />

                              <div className="min-w-0">
                                <span className="text-xs font-bold text-slate-800 block truncate">
                                  {idx + 1}. {field.label}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 block truncate">
                                  key: {field.field}
                                </span>
                              </div>
                            </div>

                            {/* Controls per field: Reorder, Font Size, Show Label */}
                            <div className="flex items-center gap-2 shrink-0">
                              {/* Show Label Toggle */}
                              <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  disabled={!isSuperAdmin || !field.visible}
                                  checked={field.showLabel ?? false}
                                  onChange={(e) =>
                                    updateDataField(field.id, { showLabel: e.target.checked })
                                  }
                                  className="rounded text-[#0066B3]"
                                />
                                <span>Label</span>
                              </label>

                              {/* Font Size Input */}
                              <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg text-slate-700">
                                <span className="text-[10px]">Ukuran:</span>
                                <input
                                  type="number"
                                  min="6"
                                  max="16"
                                  step="0.5"
                                  disabled={!isSuperAdmin || !field.visible}
                                  value={field.fontSize || 8}
                                  onChange={(e) =>
                                    updateDataField(field.id, {
                                      fontSize: parseFloat(e.target.value) || 8,
                                    })
                                  }
                                  className="w-10 bg-transparent text-xs font-bold text-center focus:outline-none"
                                />
                              </div>

                              {/* Color Picker */}
                              <input
                                type="color"
                                disabled={!isSuperAdmin || !field.visible}
                                value={field.color || '#FFFFFF'}
                                onChange={(e) =>
                                  updateDataField(field.id, { color: e.target.value })
                                }
                                className="w-6 h-6 rounded-md border border-slate-300 cursor-pointer"
                                title="Warna Teks"
                              />

                              {/* Up / Down Reorder */}
                              <div className="flex items-center gap-0.5">
                                <button
                                  type="button"
                                  disabled={!isSuperAdmin || idx === 0}
                                  onClick={() => moveFieldOrder(idx, 'UP')}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 flex items-center justify-center cursor-pointer"
                                  title="Pindahkan Ke Atas"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={!isSuperAdmin || idx === settings.dataFields.length - 1}
                                  onClick={() => moveFieldOrder(idx, 'DOWN')}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 flex items-center justify-center cursor-pointer"
                                  title="Pindahkan Ke Bawah"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: SISI DEPAN (LOGO SAFE ZONE, BACKGROUND, QR)        */}
              {/* ========================================================= */}
              {activeTab === 'front' && (
                <div className="space-y-4">
                  {/* 1. Latar Belakang & Pola Motif Depan */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <label className="block text-xs font-bold text-slate-800">
                      Warna & Latar Belakang Depan
                    </label>

                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        disabled={!isSuperAdmin}
                        value={settings.customBackgroundColorFront || '#004C85'}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            customBackgroundColorFront: e.target.value,
                          }))
                        }
                        className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        disabled={!isSuperAdmin}
                        value={settings.customBackgroundColorFront || '#004C85'}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            customBackgroundColorFront: e.target.value,
                          }))
                        }
                        className="w-28 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                      />
                      <label
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer border ${
                          isSuperAdmin
                            ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5 text-[#0066B3]" />
                        <span>Upload Background</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={!isSuperAdmin || isUploading}
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'frontBg')}
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={settings.frontBackgroundUrl || ''}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, frontBackgroundUrl: e.target.value }))
                      }
                      placeholder="URL Gambar Latar Belakang (Drive direct link)..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono"
                    />

                    {/* Toggle Pola / Motif Latar Belakang */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-bold text-slate-800">
                          Pola Motif Latar Belakang (Dot Grid & Radial Glow)
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          Nonaktifkan untuk latar polos bersih (clean), atau aktifkan jika ingin aksen visual.
                        </span>
                      </div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isSuperAdmin}
                          checked={settings.showBackgroundPattern ?? false}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              showBackgroundPattern: e.target.checked,
                            }))
                          }
                          className="rounded text-[#0066B3]"
                        />
                        <span>{settings.showBackgroundPattern ? 'Aktif' : 'Bersih (Clean)'}</span>
                      </label>
                    </div>
                  </div>

                  {/* 2. Header KTA Depan (Judul & Subjudul) */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800">
                        Header KTA Depan (Judul & Subjudul Organisasi)
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isSuperAdmin}
                          checked={settings.showFrontHeader ?? true}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              showFrontHeader: e.target.checked,
                            }))
                          }
                          className="rounded text-[#0066B3]"
                        />
                        <span>Aktif</span>
                      </label>
                    </div>

                    {(settings.showFrontHeader ?? true) && (
                      <div className="space-y-2 pt-1 border-t border-slate-200">
                        <div>
                          <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Judul Utama Organisasi:
                          </span>
                          <input
                            type="text"
                            disabled={!isSuperAdmin}
                            value={settings.frontOrganizationTitle || ''}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                frontOrganizationTitle: e.target.value,
                              }))
                            }
                            placeholder="GERAKAN PRAMUKA INDONESIA"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold uppercase"
                          />
                        </div>
                        <div>
                          <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Subjudul / Satuan Organisasi:
                          </span>
                          <input
                            type="text"
                            disabled={!isSuperAdmin}
                            value={settings.frontOrganizationSubtitle || ''}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                frontOrganizationSubtitle: e.target.value,
                              }))
                            }
                            placeholder="SAKA PARIWISATA NASIONAL"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium uppercase text-slate-700"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Logo KTA Sisi Depan (Bisa Diatur X, Y, Ukuran, Opacity) */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-[#0066B3]" />
                          Logo KTA Sisi Depan (Koordinat Bebas X & Y)
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Latar depan bersih tanpa logo bawaan. Tambahkan logo hanya jika diperlukan.
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={!isSuperAdmin}
                        onClick={() => addLogo('FRONT')}
                        className="px-3 py-1.5 rounded-xl bg-[#0066B3] hover:bg-[#005599] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Logo Depan</span>
                      </button>
                    </div>

                    {/* Daftar Logo Depan */}
                    {(!settings.logos || settings.logos.filter((l) => l.side === 'FRONT').length === 0) ? (
                      <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 text-center">
                        <p className="text-xs text-slate-600 font-medium">
                          ✨ Latar depan bersih tanpa logo (Clean).
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Klik tombol <b>Tambah Logo Depan</b> di atas jika Anda ingin menampilkan logo pada sisi depan.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {settings.logos
                          .filter((l) => l.side === 'FRONT')
                          .map((logo, lIdx) => (
                            <div
                              key={logo.id}
                              className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                                    {lIdx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    disabled={!isSuperAdmin}
                                    value={logo.name || `Logo Depan ${lIdx + 1}`}
                                    onChange={(e) => updateLogo(logo.id, { name: e.target.value })}
                                    className="text-xs font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#0066B3] focus:outline-none"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      disabled={!isSuperAdmin}
                                      checked={logo.visible ?? true}
                                      onChange={(e) =>
                                        updateLogo(logo.id, { visible: e.target.checked })
                                      }
                                      className="rounded text-[#0066B3]"
                                    />
                                    <span>Aktif</span>
                                  </label>
                                  <button
                                    type="button"
                                    disabled={!isSuperAdmin}
                                    onClick={() => removeLogo(logo.id)}
                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors"
                                    title="Hapus Logo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Upload Gambar Logo atau URL */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                                <div>
                                  <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Unggah Berkas Logo:
                                  </span>
                                  <label
                                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border ${
                                      isSuperAdmin
                                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'
                                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                    }`}
                                  >
                                    <Upload className="w-3.5 h-3.5 text-[#0066B3]" />
                                    <span>{isUploading ? 'Mengunggah...' : 'Pilih Logo'}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      disabled={!isSuperAdmin || isUploading}
                                      className="hidden"
                                      onChange={(e) => handleLogoUpload(e, 'FRONT', logo.id)}
                                    />
                                  </label>
                                </div>

                                <div>
                                  <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Penempatan:
                                  </span>
                                  <select
                                    disabled={!isSuperAdmin}
                                    value={logo.placement || 'HEADER_LEFT'}
                                    onChange={(e) =>
                                      updateLogo(logo.id, {
                                        placement: e.target.value as KtaLogoSafePlacement,
                                      })
                                    }
                                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                                  >
                                    <option value="HEADER_LEFT">Header Kiri</option>
                                    <option value="HEADER_RIGHT">Header Kanan</option>
                                    <option value="BACKGROUND_WATERMARK">Watermark Tengah</option>
                                    <option value="CUSTOM">Bebas (Koordinat X, Y)</option>
                                  </select>
                                </div>
                              </div>

                              <input
                                type="text"
                                disabled={!isSuperAdmin}
                                value={logo.url || ''}
                                onChange={(e) => updateLogo(logo.id, { url: e.target.value })}
                                placeholder="URL Logo (Drive / gambar langsung)..."
                                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-mono"
                              />

                              {/* Koordinat X, Y jika Penempatan Bebas */}
                              {logo.placement === 'CUSTOM' && (
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                  <div>
                                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                                      <span>Posisi Horizontal (X)</span>
                                      <span className="font-mono text-[#0066B3]">{logo.x ?? 10}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        disabled={!isSuperAdmin}
                                        value={logo.x ?? 10}
                                        onChange={(e) =>
                                          updateLogo(logo.id, { x: parseInt(e.target.value) })
                                        }
                                        className="flex-1 accent-[#0066B3]"
                                      />
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        disabled={!isSuperAdmin}
                                        value={logo.x ?? 10}
                                        onChange={(e) =>
                                          updateLogo(logo.id, { x: parseInt(e.target.value) || 0 })
                                        }
                                        className="w-12 bg-slate-50 border border-slate-300 rounded-lg px-1 py-0.5 text-xs text-center font-mono"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                                      <span>Posisi Vertikal (Y)</span>
                                      <span className="font-mono text-[#0066B3]">{logo.y ?? 10}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        disabled={!isSuperAdmin}
                                        value={logo.y ?? 10}
                                        onChange={(e) =>
                                          updateLogo(logo.id, { y: parseInt(e.target.value) })
                                        }
                                        className="flex-1 accent-[#0066B3]"
                                      />
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        disabled={!isSuperAdmin}
                                        value={logo.y ?? 10}
                                        onChange={(e) =>
                                          updateLogo(logo.id, { y: parseInt(e.target.value) || 0 })
                                        }
                                        className="w-12 bg-slate-50 border border-slate-300 rounded-lg px-1 py-0.5 text-xs text-center font-mono"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Ukuran & Opacity Logo */}
                              <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                                    <span>Ukuran / Lebar</span>
                                    <span className="font-mono text-[#0066B3]">{logo.width ?? 10}%</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="range"
                                      min="3"
                                      max="40"
                                      disabled={!isSuperAdmin}
                                      value={logo.width ?? 10}
                                      onChange={(e) =>
                                        updateLogo(logo.id, { width: parseInt(e.target.value) })
                                      }
                                      className="flex-1 accent-[#0066B3]"
                                    />
                                    <input
                                      type="number"
                                      min="3"
                                      max="50"
                                      disabled={!isSuperAdmin}
                                      value={logo.width ?? 10}
                                      onChange={(e) =>
                                        updateLogo(logo.id, { width: parseInt(e.target.value) || 10 })
                                      }
                                      className="w-12 bg-slate-50 border border-slate-300 rounded-lg px-1 py-0.5 text-xs text-center font-mono"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                                    <span>Transparansi / Opacity</span>
                                    <span className="font-mono text-[#0066B3]">{logo.opacity ?? 100}%</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="range"
                                      min="10"
                                      max="100"
                                      disabled={!isSuperAdmin}
                                      value={logo.opacity ?? 100}
                                      onChange={(e) =>
                                        updateLogo(logo.id, { opacity: parseInt(e.target.value) })
                                      }
                                      className="flex-1 accent-[#0066B3]"
                                    />
                                    <input
                                      type="number"
                                      min="10"
                                      max="100"
                                      disabled={!isSuperAdmin}
                                      value={logo.opacity ?? 100}
                                      onChange={(e) =>
                                        updateLogo(logo.id, { opacity: parseInt(e.target.value) || 100 })
                                      }
                                      className="w-12 bg-slate-50 border border-slate-300 rounded-lg px-1 py-0.5 text-xs text-center font-mono"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Footer KTA Depan (Teks Masa Berlaku & ID Anggota) */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <label className="block text-xs font-bold text-slate-800">
                      Footer KTA Depan (Masa Berlaku & ID Anggota)
                    </label>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700">Tampilkan Teks Masa Berlaku</span>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isSuperAdmin}
                          checked={settings.showFrontValidityText ?? true}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              showFrontValidityText: e.target.checked,
                            }))
                          }
                          className="rounded text-[#0066B3]"
                        />
                        <span>Aktif</span>
                      </label>
                    </div>

                    {(settings.showFrontValidityText ?? true) && (
                      <input
                        type="text"
                        disabled={!isSuperAdmin}
                        value={settings.frontValidityText || 'Berlaku Selama Menjadi Anggota Aktif'}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            frontValidityText: e.target.value,
                          }))
                        }
                        placeholder="Berlaku Selama Menjadi Anggota Aktif"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800"
                      />
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-xs text-slate-700">Tampilkan Nomor ID Anggota di Footer</span>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isSuperAdmin}
                          checked={settings.showFrontMemberId ?? true}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              showFrontMemberId: e.target.checked,
                            }))
                          }
                          className="rounded text-[#0066B3]"
                        />
                        <span>Aktif</span>
                      </label>
                    </div>
                  </div>

                  {/* Dynamic QR Identity (Tanpa Efek & Kontrol Presisi X/Y) */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Dynamic QR Code (Sisi Depan)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Clean Flat (Bebas Efek)
                        </span>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={!isSuperAdmin}
                            checked={settings.showQrCode}
                            onChange={(e) =>
                              setSettings((prev) => ({ ...prev, showQrCode: e.target.checked }))
                            }
                            className="rounded text-[#0066B3]"
                          />
                          <span>Aktif</span>
                        </label>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      QR Code dirender flat tanpa efek bayangan atau border tebal agar cepat & akurat saat dipindai. Koordinat X dan Y dapat disesuaikan secara bebas.
                    </p>

                    {settings.showQrCode && (
                      <div className="space-y-3 pt-2 border-t border-slate-200">
                        {/* Posisi X */}
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>Posisi Horizontal (X)</span>
                            <span className="font-mono text-[#0066B3]">{settings.qrX ?? 84}%</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="30"
                              max="95"
                              step="1"
                              disabled={!isSuperAdmin}
                              value={settings.qrX ?? 84}
                              onChange={(e) =>
                                setSettings((prev) => ({ ...prev, qrX: parseInt(e.target.value) }))
                              }
                              className="flex-1 accent-[#0066B3] cursor-pointer"
                            />
                            <input
                              type="number"
                              min="0"
                              max="100"
                              disabled={!isSuperAdmin}
                              value={settings.qrX ?? 84}
                              onChange={(e) =>
                                setSettings((prev) => ({ ...prev, qrX: parseInt(e.target.value) || 0 }))
                              }
                              className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-center font-mono"
                            />
                          </div>
                        </div>

                        {/* Posisi Y */}
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>Posisi Vertikal (Y)</span>
                            <span className="font-mono text-[#0066B3]">{settings.qrY ?? 50}%</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="15"
                              max="85"
                              step="1"
                              disabled={!isSuperAdmin}
                              value={settings.qrY ?? 50}
                              onChange={(e) =>
                                setSettings((prev) => ({ ...prev, qrY: parseInt(e.target.value) }))
                              }
                              className="flex-1 accent-[#0066B3] cursor-pointer"
                            />
                            <input
                              type="number"
                              min="0"
                              max="100"
                              disabled={!isSuperAdmin}
                              value={settings.qrY ?? 50}
                              onChange={(e) =>
                                setSettings((prev) => ({ ...prev, qrY: parseInt(e.target.value) || 0 }))
                              }
                              className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-center font-mono"
                            />
                          </div>
                        </div>

                        {/* Ukuran QR */}
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>Ukuran QR</span>
                            <span className="font-mono text-[#0066B3]">{settings.qrSize ?? 18}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="12"
                              max="26"
                              step="1"
                              disabled={!isSuperAdmin}
                              value={settings.qrSize ?? 18}
                              onChange={(e) =>
                                setSettings((prev) => ({ ...prev, qrSize: parseInt(e.target.value) }))
                              }
                              className="flex-1 accent-[#0066B3] cursor-pointer"
                            />
                            <input
                              type="number"
                              min="10"
                              max="35"
                              disabled={!isSuperAdmin}
                              value={settings.qrSize ?? 18}
                              onChange={(e) =>
                                setSettings((prev) => ({ ...prev, qrSize: parseInt(e.target.value) || 18 }))
                              }
                              className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-center font-mono"
                            />
                          </div>
                        </div>

                        {/* Label Keterangan QR */}
                        <div className="pt-2 flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              disabled={!isSuperAdmin}
                              checked={settings.showQrCaption ?? false}
                              onChange={(e) =>
                                setSettings((prev) => ({ ...prev, showQrCaption: e.target.checked }))
                              }
                              className="rounded text-[#0066B3]"
                            />
                            <span>Tampilkan Label Teks QR</span>
                          </label>

                          {settings.showQrCaption && (
                            <input
                              type="text"
                              disabled={!isSuperAdmin}
                              value={settings.qrCaptionText || 'VERIFIKASI QR'}
                              onChange={(e) =>
                                setSettings((prev) => ({ ...prev, qrCaptionText: e.target.value }))
                              }
                              className="w-36 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono uppercase"
                            />
                          )}
                        </div>

                        {/* Ketebalan Latar Belakang Barcode (Clean Barcode Background Padding) */}
                        <div className="pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                            <div>
                              <span>Ketebalan Latar Belakang Barcode</span>
                              <p className="text-[10px] font-normal text-slate-400">
                                Bersih tanpa efek stroke. Atur ketebalan latar agar kontras saat dipindai kamera.
                              </p>
                            </div>
                            <span className="font-mono text-[#0066B3]">{settings.qrBackgroundPadding ?? 2}px</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="12"
                              step="1"
                              disabled={!isSuperAdmin}
                              value={settings.qrBackgroundPadding ?? 2}
                              onChange={(e) =>
                                setSettings((prev) => ({ ...prev, qrBackgroundPadding: parseInt(e.target.value) }))
                              }
                              className="flex-1 accent-[#0066B3] cursor-pointer"
                            />
                            <input
                              type="number"
                              min="0"
                              max="20"
                              disabled={!isSuperAdmin}
                              value={settings.qrBackgroundPadding ?? 2}
                              onChange={(e) =>
                                setSettings((prev) => ({ ...prev, qrBackgroundPadding: parseInt(e.target.value) || 0 }))
                              }
                              className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-center font-mono"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500">
                            <button
                              type="button"
                              onClick={() => setSettings((prev) => ({ ...prev, qrBackgroundPadding: 0 }))}
                              className={`px-2 py-0.5 rounded border text-[10px] font-medium ${
                                (settings.qrBackgroundPadding ?? 2) === 0 ? 'bg-[#0066B3] text-white border-[#0066B3]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              0px (Rata Tanpa Latar)
                            </button>
                            <button
                              type="button"
                              onClick={() => setSettings((prev) => ({ ...prev, qrBackgroundPadding: 2 }))}
                              className={`px-2 py-0.5 rounded border text-[10px] font-medium ${
                                (settings.qrBackgroundPadding ?? 2) === 2 ? 'bg-[#0066B3] text-white border-[#0066B3]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              2px (Standar)
                            </button>
                            <button
                              type="button"
                              onClick={() => setSettings((prev) => ({ ...prev, qrBackgroundPadding: 5 }))}
                              className={`px-2 py-0.5 rounded border text-[10px] font-medium ${
                                (settings.qrBackgroundPadding ?? 2) === 5 ? 'bg-[#0066B3] text-white border-[#0066B3]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              5px (Tebal)
                            </button>
                          </div>
                        </div>

                        {/* Reset Posisi */}
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            disabled={!isSuperAdmin}
                            onClick={() =>
                              setSettings((prev) => ({
                                ...prev,
                                qrX: 84,
                                qrY: 50,
                                qrSize: 18,
                                showQrCaption: false,
                              }))
                            }
                            className="text-[11px] text-[#0066B3] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset Posisi QR Default (84%, 50%)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: SISI BELAKANG (KETENTUAN & LATAR BELAKANG)         */}
              {/* ========================================================= */}
              {activeTab === 'back' && (
                <div className="space-y-4">
                  {/* Warna & Latar Belakang */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <label className="block text-xs font-bold text-slate-800">
                      Warna & Background Sisi Belakang
                    </label>

                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        disabled={!isSuperAdmin}
                        value={settings.customBackgroundColorBack || '#0B1F33'}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            customBackgroundColorBack: e.target.value,
                          }))
                        }
                        className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        disabled={!isSuperAdmin}
                        value={settings.customBackgroundColorBack || '#0B1F33'}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            customBackgroundColorBack: e.target.value,
                          }))
                        }
                        className="w-28 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                      />
                      <label
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer border ${
                          isSuperAdmin
                            ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5 text-[#0066B3]" />
                        <span>Upload Background</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={!isSuperAdmin || isUploading}
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'backBg')}
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={settings.backBackgroundUrl || ''}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, backBackgroundUrl: e.target.value }))
                      }
                      placeholder="URL Gambar Latar Belakang (Drive link)..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono"
                    />
                  </div>

                  {/* Logo KTA Sisi Belakang (Koordinat Bebas X & Y - Clean Tanpa Logo Bawaan) */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-[#0066B3]" />
                          Logo KTA Sisi Belakang (Koordinat Bebas X & Y)
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Latar belakang bersih tanpa logo bawaan (tidak ada logo di pojok kanan atas). Tambahkan hanya jika diperlukan.
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={!isSuperAdmin}
                        onClick={() => addLogo('BACK')}
                        className="px-3 py-1.5 rounded-xl bg-[#0066B3] hover:bg-[#005599] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Logo Belakang</span>
                      </button>
                    </div>

                    {/* Daftar Logo Belakang */}
                    {(!settings.logos || settings.logos.filter((l) => l.side === 'BACK').length === 0) ? (
                      <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 text-center">
                        <p className="text-xs text-slate-600 font-medium">
                          ✨ Latar belakang bersih tanpa logo (Clean).
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Pojok kanan atas dan seluruh area belakang bersih tanpa atribut logo tak teredit. Gunakan tombol di atas jika ingin menyematkan logo resmi.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {settings.logos
                          .filter((l) => l.side === 'BACK')
                          .map((logo, lIdx) => (
                            <div
                              key={logo.id}
                              className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                                    {lIdx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    disabled={!isSuperAdmin}
                                    value={logo.name || `Logo Belakang ${lIdx + 1}`}
                                    onChange={(e) => updateLogo(logo.id, { name: e.target.value })}
                                    className="text-xs font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#0066B3] focus:outline-none"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      disabled={!isSuperAdmin}
                                      checked={logo.visible ?? true}
                                      onChange={(e) =>
                                        updateLogo(logo.id, { visible: e.target.checked })
                                      }
                                      className="rounded text-[#0066B3]"
                                    />
                                    <span>Aktif</span>
                                  </label>
                                  <button
                                    type="button"
                                    disabled={!isSuperAdmin}
                                    onClick={() => removeLogo(logo.id)}
                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors"
                                    title="Hapus Logo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Upload Gambar Logo atau URL */}
                              <div className="pt-1 border-t border-slate-100 flex items-center gap-2">
                                <label
                                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border shrink-0 ${
                                    isSuperAdmin
                                      ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'
                                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                  }`}
                                >
                                  <Upload className="w-3.5 h-3.5 text-[#0066B3]" />
                                  <span>{isUploading ? 'Mengunggah...' : 'Pilih Logo'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={!isSuperAdmin || isUploading}
                                    className="hidden"
                                    onChange={(e) => handleLogoUpload(e, 'BACK', logo.id)}
                                  />
                                </label>
                                <input
                                  type="text"
                                  disabled={!isSuperAdmin}
                                  value={logo.url || ''}
                                  onChange={(e) => updateLogo(logo.id, { url: e.target.value })}
                                  placeholder="URL Gambar Logo (Drive direct link)..."
                                  className="flex-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-mono"
                                />
                              </div>

                              {/* Koordinat Presisi X, Y */}
                              <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                                    <span>Posisi Horizontal (X)</span>
                                    <span className="font-mono text-[#0066B3]">{logo.x ?? 85}%</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      disabled={!isSuperAdmin}
                                      value={logo.x ?? 85}
                                      onChange={(e) =>
                                        updateLogo(logo.id, { x: parseInt(e.target.value) })
                                      }
                                      className="flex-1 accent-[#0066B3]"
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      disabled={!isSuperAdmin}
                                      value={logo.x ?? 85}
                                      onChange={(e) =>
                                        updateLogo(logo.id, { x: parseInt(e.target.value) || 0 })
                                      }
                                      className="w-12 bg-slate-50 border border-slate-300 rounded-lg px-1 py-0.5 text-xs text-center font-mono"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                                    <span>Posisi Vertikal (Y)</span>
                                    <span className="font-mono text-[#0066B3]">{logo.y ?? 10}%</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      disabled={!isSuperAdmin}
                                      value={logo.y ?? 10}
                                      onChange={(e) =>
                                        updateLogo(logo.id, { y: parseInt(e.target.value) })
                                      }
                                      className="flex-1 accent-[#0066B3]"
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      disabled={!isSuperAdmin}
                                      value={logo.y ?? 10}
                                      onChange={(e) =>
                                        updateLogo(logo.id, { y: parseInt(e.target.value) || 0 })
                                      }
                                      className="w-12 bg-slate-50 border border-slate-300 rounded-lg px-1 py-0.5 text-xs text-center font-mono"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Ukuran & Opacity Logo */}
                              <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                                    <span>Ukuran / Lebar</span>
                                    <span className="font-mono text-[#0066B3]">{logo.width ?? 10}%</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="range"
                                      min="3"
                                      max="40"
                                      disabled={!isSuperAdmin}
                                      value={logo.width ?? 10}
                                      onChange={(e) =>
                                        updateLogo(logo.id, { width: parseInt(e.target.value) })
                                      }
                                      className="flex-1 accent-[#0066B3]"
                                    />
                                    <input
                                      type="number"
                                      min="3"
                                      max="50"
                                      disabled={!isSuperAdmin}
                                      value={logo.width ?? 10}
                                      onChange={(e) =>
                                        updateLogo(logo.id, { width: parseInt(e.target.value) || 10 })
                                      }
                                      className="w-12 bg-slate-50 border border-slate-300 rounded-lg px-1 py-0.5 text-xs text-center font-mono"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                                    <span>Transparansi / Opacity</span>
                                    <span className="font-mono text-[#0066B3]">{logo.opacity ?? 100}%</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="range"
                                      min="10"
                                      max="100"
                                      disabled={!isSuperAdmin}
                                      value={logo.opacity ?? 100}
                                      onChange={(e) =>
                                        updateLogo(logo.id, { opacity: parseInt(e.target.value) })
                                      }
                                      className="flex-1 accent-[#0066B3]"
                                    />
                                    <input
                                      type="number"
                                      min="10"
                                      max="100"
                                      disabled={!isSuperAdmin}
                                      value={logo.opacity ?? 100}
                                      onChange={(e) =>
                                        updateLogo(logo.id, { opacity: parseInt(e.target.value) || 100 })
                                      }
                                      className="w-12 bg-slate-50 border border-slate-300 rounded-lg px-1 py-0.5 text-xs text-center font-mono"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* 1. Judul Header Belakang */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        1. Judul Ketentuan KTA (Header)
                      </span>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isSuperAdmin}
                          checked={settings.showBackHeaderTitle ?? true}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              showBackHeaderTitle: e.target.checked,
                            }))
                          }
                          className="rounded text-[#0066B3]"
                        />
                        <span>Aktif</span>
                      </label>
                    </div>

                    {settings.showBackHeaderTitle !== false && (
                      <div className="space-y-3 pt-1 border-t border-slate-200">
                        <input
                          type="text"
                          disabled={!isSuperAdmin}
                          value={settings.backHeaderTitle ?? 'KETENTUAN KARTU TANDA ANGGOTA'}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, backHeaderTitle: e.target.value }))
                          }
                          placeholder="KETENTUAN KARTU TANDA ANGGOTA"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold uppercase"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi X</span>
                              <span className="font-mono text-[#0066B3]">{settings.backHeaderTitleX ?? 4}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="80"
                                disabled={!isSuperAdmin}
                                value={settings.backHeaderTitleX ?? 4}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    backHeaderTitleX: parseInt(e.target.value),
                                  }))
                                }
                                className="flex-1 accent-[#0066B3]"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!isSuperAdmin}
                                value={settings.backHeaderTitleX ?? 4}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    backHeaderTitleX: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi Y</span>
                              <span className="font-mono text-[#0066B3]">{settings.backHeaderTitleY ?? 6}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="50"
                                disabled={!isSuperAdmin}
                                value={settings.backHeaderTitleY ?? 6}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    backHeaderTitleY: parseInt(e.target.value),
                                  }))
                                }
                                className="flex-1 accent-[#0066B3]"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!isSuperAdmin}
                                value={settings.backHeaderTitleY ?? 6}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    backHeaderTitleY: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                            <span>Ukuran Font</span>
                            <span className="font-mono text-[#0066B3]">{settings.backHeaderTitleFontSize ?? 9.5}px</span>
                          </div>
                          <input
                            type="range"
                            min="7"
                            max="15"
                            step="0.5"
                            disabled={!isSuperAdmin}
                            value={settings.backHeaderTitleFontSize ?? 9.5}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                backHeaderTitleFontSize: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full accent-[#0066B3]"
                          />
                        </div>

                        {/* Garis Pemisah Header */}
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                          <span className="text-xs text-slate-700">Tampilkan Garis Pemisah Header</span>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              disabled={!isSuperAdmin}
                              checked={settings.showBackHeaderDivider ?? true}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  showBackHeaderDivider: e.target.checked,
                                }))
                              }
                              className="rounded text-[#0066B3]"
                            />
                            <span>Aktif</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Subjudul Organisasi Belakang */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        2. Subjudul Organisasi Belakang
                      </span>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isSuperAdmin}
                          checked={settings.showBackSubTitle ?? true}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              showBackSubTitle: e.target.checked,
                            }))
                          }
                          className="rounded text-[#0066B3]"
                        />
                        <span>Aktif</span>
                      </label>
                    </div>

                    {settings.showBackSubTitle !== false && (
                      <div className="space-y-3 pt-1 border-t border-slate-200">
                        <input
                          type="text"
                          disabled={!isSuperAdmin}
                          value={settings.backSubTitle ?? 'SATUAN KARYA PRAMUKA PARIWISATA TINGKAT NASIONAL'}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, backSubTitle: e.target.value }))
                          }
                          placeholder="SATUAN KARYA PRAMUKA PARIWISATA TINGKAT NASIONAL"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi X</span>
                              <span className="font-mono text-[#0066B3]">{settings.backSubTitleX ?? 4}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="80"
                                disabled={!isSuperAdmin}
                                value={settings.backSubTitleX ?? 4}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    backSubTitleX: parseInt(e.target.value),
                                  }))
                                }
                                className="flex-1 accent-[#0066B3]"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!isSuperAdmin}
                                value={settings.backSubTitleX ?? 4}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    backSubTitleX: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi Y</span>
                              <span className="font-mono text-[#0066B3]">{settings.backSubTitleY ?? 13}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="50"
                                disabled={!isSuperAdmin}
                                value={settings.backSubTitleY ?? 13}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    backSubTitleY: parseInt(e.target.value),
                                  }))
                                }
                                className="flex-1 accent-[#0066B3]"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!isSuperAdmin}
                                value={settings.backSubTitleY ?? 13}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    backSubTitleY: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                            <span>Ukuran Font</span>
                            <span className="font-mono text-[#0066B3]">{settings.backSubTitleFontSize ?? 6.5}px</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="12"
                            step="0.5"
                            disabled={!isSuperAdmin}
                            value={settings.backSubTitleFontSize ?? 6.5}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                backSubTitleFontSize: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full accent-[#0066B3]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Butir-butir Ketentuan KTA */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        3. Butir-butir Ketentuan Kartu
                      </span>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isSuperAdmin}
                          checked={settings.showTerms ?? true}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              showTerms: e.target.checked,
                            }))
                          }
                          className="rounded text-[#0066B3]"
                        />
                        <span>Aktif</span>
                      </label>
                    </div>

                    {settings.showTerms !== false && (
                      <div className="space-y-3 pt-1 border-t border-slate-200">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi X</span>
                              <span className="font-mono text-[#0066B3]">{settings.termsX ?? 4}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="60"
                                disabled={!isSuperAdmin}
                                value={settings.termsX ?? 4}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    termsX: parseInt(e.target.value),
                                  }))
                                }
                                className="flex-1 accent-[#0066B3]"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!isSuperAdmin}
                                value={settings.termsX ?? 4}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    termsX: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi Y</span>
                              <span className="font-mono text-[#0066B3]">{settings.termsY ?? 24}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="10"
                                max="60"
                                disabled={!isSuperAdmin}
                                value={settings.termsY ?? 24}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    termsY: parseInt(e.target.value),
                                  }))
                                }
                                className="flex-1 accent-[#0066B3]"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!isSuperAdmin}
                                value={settings.termsY ?? 24}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    termsY: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Lebar Area Maksimal</span>
                              <span className="font-mono text-[#0066B3]">{settings.termsWidth ?? 54}%</span>
                            </div>
                            <input
                              type="range"
                              min="30"
                              max="90"
                              disabled={!isSuperAdmin}
                              value={settings.termsWidth ?? 54}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    termsWidth: parseInt(e.target.value),
                                }))
                              }
                              className="w-full accent-[#0066B3]"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Ukuran Font</span>
                              <span className="font-mono text-[#0066B3]">{settings.termsFontSize ?? 6.5}px</span>
                            </div>
                            <input
                              type="range"
                              min="5"
                              max="10"
                              step="0.5"
                              disabled={!isSuperAdmin}
                              value={settings.termsFontSize ?? 6.5}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  termsFontSize: parseFloat(e.target.value),
                                }))
                              }
                              className="w-full accent-[#0066B3]"
                            />
                          </div>
                        </div>

                        {/* List Butir */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[11px] font-bold text-slate-700 block">
                            Daftar Butir Ketentuan:
                          </span>
                          {(settings.terms || []).map((term, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-5 text-xs font-bold text-slate-500">{idx + 1}.</span>
                              <input
                                type="text"
                                disabled={!isSuperAdmin}
                                value={term}
                                onChange={(e) => {
                                  const updated = [...settings.terms];
                                  updated[idx] = e.target.value;
                                  setSettings((prev) => ({ ...prev, terms: updated }));
                                }}
                                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs"
                              />
                              {isSuperAdmin && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = settings.terms.filter((_, i) => i !== idx);
                                    setSettings((prev) => ({ ...prev, terms: updated }));
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition cursor-pointer"
                                  title="Hapus butir ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}

                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...(settings.terms || []), 'Butir ketentuan baru...'];
                                setSettings((prev) => ({ ...prev, terms: updated }));
                              }}
                              className="flex items-center gap-1.5 text-xs text-[#0066B3] hover:underline font-bold pt-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambah Butir Ketentuan</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Footer Belakang */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        4. Catatan Kaki / Footer Belakang
                      </span>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isSuperAdmin}
                          checked={settings.showBackFooter ?? true}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              showBackFooter: e.target.checked,
                            }))
                          }
                          className="rounded text-[#0066B3]"
                        />
                        <span>Aktif</span>
                      </label>
                    </div>

                    {settings.showBackFooter !== false && (
                      <div className="space-y-3 pt-1 border-t border-slate-200">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                              Teks Sisi Kiri (Website / Info):
                            </span>
                            <input
                              type="text"
                              disabled={!isSuperAdmin}
                              value={settings.backFooterLeftText ?? 'www.sakapariwisatanasional.id'}
                              onChange={(e) =>
                                setSettings((prev) => ({ ...prev, backFooterLeftText: e.target.value }))
                              }
                              placeholder="www.sakapariwisatanasional.id"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono"
                            />
                          </div>

                          <div>
                            <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                              Teks Sisi Kanan (Property of):
                            </span>
                            <input
                              type="text"
                              disabled={!isSuperAdmin}
                              value={settings.backFooterRightText ?? 'Property of Saka Pariwisata'}
                              onChange={(e) =>
                                setSettings((prev) => ({ ...prev, backFooterRightText: e.target.value }))
                              }
                              placeholder="Property of Saka Pariwisata"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi X</span>
                              <span className="font-mono text-[#0066B3]">{settings.backFooterX ?? 4}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="30"
                              disabled={!isSuperAdmin}
                              value={settings.backFooterX ?? 4}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  backFooterX: parseInt(e.target.value),
                                }))
                              }
                              className="w-full accent-[#0066B3]"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi Y</span>
                              <span className="font-mono text-[#0066B3]">{settings.backFooterY ?? 92}%</span>
                            </div>
                            <input
                              type="range"
                              min="75"
                              max="98"
                              disabled={!isSuperAdmin}
                              value={settings.backFooterY ?? 92}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  backFooterY: parseInt(e.target.value),
                                }))
                              }
                              className="w-full accent-[#0066B3]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 4: PENGESAHAN & SIGNER (BACK SIDE)                     */}
              {/* ========================================================= */}
              {activeTab === 'signer' && (
                <div className="space-y-4">
                  {/* 1. Tempat & Tanggal Penerbitan */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        1. Tempat & Tanggal Penerbitan
                      </span>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isSuperAdmin}
                          checked={settings.showIssueLocationDate ?? true}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              showIssueLocationDate: e.target.checked,
                            }))
                          }
                          className="rounded text-[#0066B3]"
                        />
                        <span>Aktif</span>
                      </label>
                    </div>

                    {settings.showIssueLocationDate !== false && (
                      <div className="space-y-3 pt-1 border-t border-slate-200">
                        <input
                          type="text"
                          disabled={!isSuperAdmin}
                          value={settings.issueLocationDate || ''}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, issueLocationDate: e.target.value }))
                          }
                          placeholder="Jakarta, 17 Agustus 2024"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi X</span>
                              <span className="font-mono text-[#0066B3]">{settings.issueLocationDateX ?? 74}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="20"
                                max="95"
                                disabled={!isSuperAdmin}
                                value={settings.issueLocationDateX ?? 74}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    issueLocationDateX: parseInt(e.target.value),
                                  }))
                                }
                                className="flex-1 accent-[#0066B3]"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!isSuperAdmin}
                                value={settings.issueLocationDateX ?? 74}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    issueLocationDateX: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi Y</span>
                              <span className="font-mono text-[#0066B3]">{settings.issueLocationDateY ?? 25}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="10"
                                max="80"
                                disabled={!isSuperAdmin}
                                value={settings.issueLocationDateY ?? 25}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    issueLocationDateY: parseInt(e.target.value),
                                  }))
                                }
                                className="flex-1 accent-[#0066B3]"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!isSuperAdmin}
                                value={settings.issueLocationDateY ?? 25}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    issueLocationDateY: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. QR Code Pengesah (Clean Flat - Bebas Efek) */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-bold text-slate-800">
                          2. QR Code Pengesah Resmi
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Clean Flat (Bebas Efek)
                        </span>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={!isSuperAdmin}
                            checked={settings.showSignerQrCode ?? true}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                showSignerQrCode: e.target.checked,
                              }))
                            }
                            className="rounded text-[#0066B3]"
                          />
                          <span>Aktif</span>
                        </label>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      QR Code pengesah dirender clean flat tanpa bayangan / border berat. Posisi dan ukuran dapat diatur presisi.
                    </p>

                    {settings.showSignerQrCode !== false && (
                      <div className="space-y-3 pt-2 border-t border-slate-200">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi X</span>
                              <span className="font-mono text-[#0066B3]">{settings.signerQrX ?? 74}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="20"
                                max="95"
                                disabled={!isSuperAdmin}
                                value={settings.signerQrX ?? 74}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    signerQrX: parseInt(e.target.value),
                                  }))
                                }
                                className="flex-1 accent-[#0066B3]"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!isSuperAdmin}
                                value={settings.signerQrX ?? 74}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    signerQrX: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi Y</span>
                              <span className="font-mono text-[#0066B3]">{settings.signerQrY ?? 48}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="15"
                                max="85"
                                disabled={!isSuperAdmin}
                                value={settings.signerQrY ?? 48}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    signerQrY: parseInt(e.target.value),
                                  }))
                                }
                                className="flex-1 accent-[#0066B3]"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!isSuperAdmin}
                                value={settings.signerQrY ?? 48}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    signerQrY: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                            <span>Ukuran QR</span>
                            <span className="font-mono text-[#0066B3]">{settings.signerQrSize ?? 18}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="12"
                              max="28"
                              step="1"
                              disabled={!isSuperAdmin}
                              value={settings.signerQrSize ?? 18}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  signerQrSize: parseInt(e.target.value),
                                }))
                              }
                              className="flex-1 accent-[#0066B3]"
                            />
                            <input
                              type="number"
                              min="10"
                              max="35"
                              disabled={!isSuperAdmin}
                              value={settings.signerQrSize ?? 18}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  signerQrSize: parseInt(e.target.value) || 18,
                                }))
                              }
                              className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-center font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Jabatan Penandatangan */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        3. Jabatan Penandatangan
                      </span>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isSuperAdmin}
                          checked={settings.showSignerTitle ?? true}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              showSignerTitle: e.target.checked,
                            }))
                          }
                          className="rounded text-[#0066B3]"
                        />
                        <span>Aktif</span>
                      </label>
                    </div>

                    {settings.showSignerTitle !== false && (
                      <div className="space-y-3 pt-1 border-t border-slate-200">
                        <input
                          type="text"
                          disabled={!isSuperAdmin}
                          value={settings.signerTitle || ''}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, signerTitle: e.target.value }))
                          }
                          placeholder="Pimpinan Saka Pariwisata Nasional"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi X</span>
                              <span className="font-mono text-[#0066B3]">{settings.signerTitleX ?? 74}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="20"
                                max="95"
                                disabled={!isSuperAdmin}
                                value={settings.signerTitleX ?? 74}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    signerTitleX: parseInt(e.target.value),
                                  }))
                                }
                                className="flex-1 accent-[#0066B3]"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!isSuperAdmin}
                                value={settings.signerTitleX ?? 74}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    signerTitleX: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi Y</span>
                              <span className="font-mono text-[#0066B3]">{settings.signerTitleY ?? 68}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="40"
                                max="95"
                                disabled={!isSuperAdmin}
                                value={settings.signerTitleY ?? 68}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    signerTitleY: parseInt(e.target.value),
                                  }))
                                }
                                className="flex-1 accent-[#0066B3]"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!isSuperAdmin}
                                value={settings.signerTitleY ?? 68}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    signerTitleY: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                            <span>Ukuran Font</span>
                            <span className="font-mono text-[#0066B3]">{settings.signerTitleFontSize ?? 6.5}px</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="11"
                            step="0.5"
                            disabled={!isSuperAdmin}
                            value={settings.signerTitleFontSize ?? 6.5}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                signerTitleFontSize: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full accent-[#0066B3]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Nama Penandatangan */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        4. Nama Penandatangan
                      </span>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isSuperAdmin}
                          checked={settings.showSignerName ?? true}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              showSignerName: e.target.checked,
                            }))
                          }
                          className="rounded text-[#0066B3]"
                        />
                        <span>Aktif</span>
                      </label>
                    </div>

                    {settings.showSignerName !== false && (
                      <div className="space-y-3 pt-1 border-t border-slate-200">
                        <input
                          type="text"
                          disabled={!isSuperAdmin}
                          value={settings.signerName || ''}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, signerName: e.target.value }))
                          }
                          placeholder="Dr. H. Budi Santoso, M.Si."
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi X</span>
                              <span className="font-mono text-[#0066B3]">{settings.signerNameX ?? 74}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="20"
                                max="95"
                                disabled={!isSuperAdmin}
                                value={settings.signerNameX ?? 74}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    signerNameX: parseInt(e.target.value),
                                  }))
                                }
                                className="flex-1 accent-[#0066B3]"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!isSuperAdmin}
                                value={settings.signerNameX ?? 74}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    signerNameX: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi Y</span>
                              <span className="font-mono text-[#0066B3]">{settings.signerNameY ?? 76}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="40"
                                max="95"
                                disabled={!isSuperAdmin}
                                value={settings.signerNameY ?? 76}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    signerNameY: parseInt(e.target.value),
                                  }))
                                }
                                className="flex-1 accent-[#0066B3]"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!isSuperAdmin}
                                value={settings.signerNameY ?? 76}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    signerNameY: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                            <span>Ukuran Font</span>
                            <span className="font-mono text-[#0066B3]">{settings.signerNameFontSize ?? 7.5}px</span>
                          </div>
                          <input
                            type="range"
                            min="5.5"
                            max="13"
                            step="0.5"
                            disabled={!isSuperAdmin}
                            value={settings.signerNameFontSize ?? 7.5}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                signerNameFontSize: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full accent-[#0066B3]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5. Keterangan / Subtitle Penandatangan */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        5. Keterangan / NTA Penandatangan
                      </span>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isSuperAdmin}
                          checked={settings.showSignerSubtitle ?? true}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              showSignerSubtitle: e.target.checked,
                            }))
                          }
                          className="rounded text-[#0066B3]"
                        />
                        <span>Aktif</span>
                      </label>
                    </div>

                    {settings.showSignerSubtitle !== false && (
                      <div className="space-y-3 pt-1 border-t border-slate-200">
                        <input
                          type="text"
                          disabled={!isSuperAdmin}
                          value={settings.signerSubtitle ?? 'Kwartir Nasional Gerakan Pramuka'}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, signerSubtitle: e.target.value }))
                          }
                          placeholder="Kwartir Nasional Gerakan Pramuka"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi X</span>
                              <span className="font-mono text-[#0066B3]">{settings.signerSubtitleX ?? 74}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="20"
                                max="95"
                                disabled={!isSuperAdmin}
                                value={settings.signerSubtitleX ?? 74}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    signerSubtitleX: parseInt(e.target.value),
                                  }))
                                }
                                className="flex-1 accent-[#0066B3]"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!isSuperAdmin}
                                value={settings.signerSubtitleX ?? 74}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    signerSubtitleX: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                              <span>Posisi Y</span>
                              <span className="font-mono text-[#0066B3]">{settings.signerSubtitleY ?? 83}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="40"
                                max="95"
                                disabled={!isSuperAdmin}
                                value={settings.signerSubtitleY ?? 83}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    signerSubtitleY: parseInt(e.target.value),
                                  }))
                                }
                                className="flex-1 accent-[#0066B3]"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!isSuperAdmin}
                                value={settings.signerSubtitleY ?? 83}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    signerSubtitleY: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-14 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                            <span>Ukuran Font</span>
                            <span className="font-mono text-[#0066B3]">{settings.signerSubtitleFontSize ?? 6.2}px</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="11"
                            step="0.5"
                            disabled={!isSuperAdmin}
                            value={settings.signerSubtitleFontSize ?? 6.2}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                signerSubtitleFontSize: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full accent-[#0066B3]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 5: PRESET & UKURAN KARTU (ISO ID-1, KTP, SIM, CUSTOM) */}
              {/* ========================================================= */}
              {activeTab === 'size' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <label className="block text-xs font-bold text-slate-800">
                      Standar Rasio Ukuran Kartu
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { key: 'CR80_KTA', label: 'CR80 / ISO ID-1', desc: '85.6 × 53.98 mm' },
                        { key: 'KTP', label: 'Format KTP', desc: '85.6 × 53.98 mm' },
                        { key: 'SIM', label: 'Format SIM', desc: '86.0 × 54.00 mm' },
                        { key: 'CUSTOM', label: 'Kustom Bebas', desc: 'Ukuran Manual' },
                      ].map((p) => (
                        <button
                          key={p.key}
                          type="button"
                          disabled={!isSuperAdmin}
                          onClick={() => handlePresetChange(p.key as KtaCardPreset)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            settings.preset === p.key
                              ? 'bg-white border-[#0066B3] ring-2 ring-[#0066B3]/20 shadow-xs'
                              : 'bg-white/80 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="block text-xs font-bold text-slate-900">{p.label}</span>
                          <span className="block text-[10px] text-slate-500 mt-0.5">{p.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 grid grid-cols-3 gap-3">
                    <div>
                      <span className="block text-[11px] font-bold text-slate-700 mb-1">
                        Lebar (mm):
                      </span>
                      <input
                        type="number"
                        disabled={!isSuperAdmin || settings.preset !== 'CUSTOM'}
                        value={settings.widthMm}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            widthMm: parseFloat(e.target.value) || 85.6,
                          }))
                        }
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-slate-700 mb-1">
                        Tinggi (mm):
                      </span>
                      <input
                        type="number"
                        disabled={!isSuperAdmin || settings.preset !== 'CUSTOM'}
                        value={settings.heightMm}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            heightMm: parseFloat(e.target.value) || 53.98,
                          }))
                        }
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-slate-700 mb-1">
                        Radius Sudut (mm):
                      </span>
                      <input
                        type="number"
                        disabled={!isSuperAdmin || settings.preset !== 'CUSTOM'}
                        value={settings.cornerRadiusMm}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            cornerRadiusMm: parseFloat(e.target.value) || 3.18,
                          }))
                        }
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ============================================================== */}
            {/* MODAL FOOTER ACTIONS                                           */}
            {/* ============================================================== */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!isSuperAdmin || isSaving}
                  onClick={handleResetDefault}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  title="Kembalikan ke Pengaturan Awal SPWN"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Template</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  disabled={!isSuperAdmin || isSaving}
                  onClick={handleSaveSettings}
                  className="px-5 py-2 rounded-xl bg-[#0066B3] text-white border-2 border-[#0066B3] hover:bg-white hover:text-[#0066B3] hover:border-[#0066B3] text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Simpan Template KTA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
