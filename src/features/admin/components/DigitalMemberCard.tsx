/**
 * SPWN Apps 2.0 - Digital Member Card Dynamic Renderer
 * Location: src/features/admin/components/DigitalMemberCard.tsx
 * -------------------------------------------------------------
 * Komponen render kartu identitas KTA dinamis dengan Hybrid Layout Architecture:
 * - ZONE 1 : PHOTO AREA (0% - 26%) -> Foto Anggota Terisolasi & Anti-Overlap
 * - ZONE 2 : IDENTITY AREA (28% - 74%) -> Structured Auto-Flow Identity Stack
 * - ZONE 3 : QR AREA (76% - 96%) -> Dynamic QR Identity Auto-Sized
 * - KTA Layout Guard -> Collision Protection & Auto Scaling
 * - Logo Safe Zone -> Terisolasi di Header atau Background Watermark
 */

import React, { useState } from 'react';
import {
  RotateCcw,
  Printer,
  ShieldCheck,
  Award,
  CheckCircle2,
} from 'lucide-react';
import {
  KtaCardSettings,
  KtaCardSide,
  KtaDataFieldConfig,
  KtaLayoutGuardStatus,
  KtaMemberBindingData,
  KtaMemberFieldKey,
  SakaMembershipLevel,
} from '../../../types/kta.types';
import { DynamicQrCode } from '../../../components/display/DynamicQrCode';
import { resolveDistrictName, getProvinceByCode, getRegencyByCode } from '../../../data/wilayahData';
import { ktaService } from '../../../services/ktaService';
import { storage } from '../../../services/storage';

export interface DigitalMemberCardProps {
  member: KtaMemberBindingData | any;
  previewSettings?: KtaCardSettings;
  side?: KtaCardSide;
  showControls?: boolean;
  onSideChange?: (side: KtaCardSide) => void;
  scale?: number;
}

/**
 * Helper KTA Layout Guard: Menghitung kepadatan stack & skala adaptif
 */
export function calculateLayoutGuard(
  activeFields: KtaDataFieldConfig[],
  density: 'compact' | 'standard' | 'spacious' = 'standard',
  userFontScale: number = 1.0,
  cardHeightMm: number = 53.98
): KtaLayoutGuardStatus {
  const activeCount = activeFields.length;

  // Rasio skala tinggi kartu (relatif terhadap CR80 standar 53.98mm)
  // Pada kartu standar, tinggi area identity stack yang aman adalah ~140px
  const baseAvailableHeight = 140;
  const heightRatio = (cardHeightMm || 53.98) / 53.98;
  const availableHeightPx = Math.round(baseAvailableHeight * heightRatio);

  const currentGap = density === 'compact' ? 2 : density === 'spacious' ? 6 : 4;

  // Hitung estimasi tinggi yang dibutuhkan oleh setiap field
  let totalValuesHeight = 0;
  let totalLabelsHeight = 0;

  activeFields.forEach((field) => {
    const baseFontSize = field.fontSize || 10;
    // Tinggi baris teks nilai (line-height ~1.25)
    const lineValHeight = Math.max(9, baseFontSize * userFontScale) * 1.25;
    totalValuesHeight += lineValHeight;

    // Label tambahan jika aktif (fullName dan nationalMemberNumber tidak memakai label baris terpisah)
    if (field.showLabel && field.field !== 'fullName' && field.field !== 'nationalMemberNumber') {
      totalLabelsHeight += 9.5; // tinggi label teks kecil + margin
    }
  });

  const gapsHeight = Math.max(0, activeCount - 1) * currentGap;
  const totalOccupiedHeight = Math.round(totalValuesHeight + totalLabelsHeight + gapsHeight);

  // Kepadatan relatif (0 - 100%)
  const densityRatio = availableHeightPx > 0 ? totalOccupiedHeight / availableHeightPx : 0;
  const densityScore = Math.min(100, Math.round(densityRatio * 100));

  // Ambang batas: jika kepadatan > 82% atau totalOccupiedHeight > availableHeightPx
  const isOvercrowded = densityScore > 82 || activeCount > 6 || totalOccupiedHeight > availableHeightPx;

  let recommendedFontScale = userFontScale;
  let recommendedGap = currentGap;
  let recommendedDensity: 'compact' | 'standard' | 'spacious' = density;
  let suggestHideLabels = false;

  if (isOvercrowded) {
    suggestHideLabels = totalLabelsHeight > 0;
    recommendedDensity = 'compact';
    recommendedGap = 2;

    // Target tinggi yang aman adalah 78% dari ruang tersedia agar ada ruang bernapas
    const safeTargetHeight = availableHeightPx * 0.78;
    const safeHeightForValues = safeTargetHeight - Math.max(0, activeCount - 1) * 2;

    if (totalValuesHeight > 0) {
      const calculatedScale = safeHeightForValues / (totalValuesHeight / userFontScale);
      recommendedFontScale = Math.max(
        0.72,
        Math.min(userFontScale, Math.min(0.88, parseFloat(calculatedScale.toFixed(2))))
      );
    } else {
      recommendedFontScale = Math.min(userFontScale, 0.85);
    }
  } else if (densityScore < 55 && activeCount <= 4) {
    recommendedFontScale = Math.max(userFontScale, 1.05);
    recommendedGap = 5;
    recommendedDensity = 'standard';
    suggestHideLabels = false;
  }

  let warningMessage: string | undefined;
  if (isOvercrowded) {
    if (suggestHideLabels) {
      warningMessage =
        'Kepadatan melebihi batas area desain. Sembunyikan label tambahan dan perkecil skala font agar proporsional.';
    } else {
      warningMessage =
        'Kepadatan melebihi batas area desain. Skala font perlu disesuaikan agar teks tidak bertumpuk.';
    }
  }

  return {
    activeFieldsCount: activeCount,
    densityScore,
    isOvercrowded,
    warningMessage,
    recommendedFontScale,
    recommendedGap,
    suggestHideLabels,
    availableHeightPx,
    occupiedHeightPx: totalOccupiedHeight,
    recommendedDensity,
  };
}

export const DigitalMemberCard: React.FC<DigitalMemberCardProps> = ({
  member,
  previewSettings: propSettings,
  side = 'FRONT',
  showControls = true,
  onSideChange,
  scale = 1,
}) => {
  const [currentSide, setCurrentSide] = useState<KtaCardSide>(side);

  // Ambil settings dari KTA Designer aktif jika tidak di-pass via props
  const previewSettings: KtaCardSettings = React.useMemo(() => {
    return propSettings || storage.getKtaSettings();
  }, [propSettings]);

  // Sinkronisasi side saat props berubah
  React.useEffect(() => {
    setCurrentSide(side);
  }, [side]);

  const toggleSide = () => {
    const next = currentSide === 'FRONT' ? 'BACK' : 'FRONT';
    setCurrentSide(next);
    onSideChange?.(next);
  };

  // Helper untuk mengambil nilai dynamic data field dengan resolusi wilayah resmi
  const getFieldValue = (fieldKey: KtaMemberFieldKey): string => {
    if (!member) return '-';
    switch (fieldKey) {
      case 'fullName':
        return member.fullName || member.nama_lengkap || 'Nama Anggota';
      case 'id':
        return member.id || 'SPW-000000';
      case 'nationalMemberNumber':
        return member.nationalMemberNumber || member.nomor_kta || '00.000000';
      case 'membershipLevel':
        return (
          member.membershipLevel ||
          member.tingkat_keanggotaan ||
          'Anggota'
        );
      case 'currentPosition':
        return member.currentPosition || member.jabatan_khusus || member.tingkat_keanggotaan || 'Anggota';
      case 'provinceName': {
        const provCode = member.provinsi_id || member.provinceId || member.kodeProvinsi;
        if (provCode) {
          const provObj = getProvinceByCode(provCode);
          if (provObj) return provObj.name;
        }
        return member.provinceName || member.provinsi_nama || member.province || 'Jawa Barat';
      }
      case 'regencyName': {
        const regCode = member.kabupaten_id || member.regencyId || member.kodeKabupaten;
        if (regCode) {
          const regObj = getRegencyByCode(regCode);
          if (regObj) return regObj.name;
        }
        return member.regencyName || member.kabupaten_nama || member.city || 'Kabupaten Bogor';
      }
      case 'districtName': {
        const regCode = (member as any).kabupaten_id || (member as any).regencyId || (member as any).kodeKabupaten;
        const distCode3 = (member as any).wilayah_kecamatan_id || (member as any).districtCode3 || (member as any).kodeKecamatan;
        if (regCode && distCode3) {
          const resolved = resolveDistrictName(regCode, distCode3);
          if (resolved) return resolved;
        }
        if (member.districtName) return member.districtName;
        if ((member as any).wilayah_kecamatan_nama) return (member as any).wilayah_kecamatan_nama;
        if ((member as any).kecamatan) return (member as any).kecamatan;
        if (distCode3) {
          return resolveDistrictName(undefined, distCode3) || `Kecamatan ${distCode3}`;
        }
        return '';
      }
      case 'kwartirName':
        return member.kwartirName || (member.provinsi_nama ? `Kwarda ${member.provinsi_nama}` : 'Kwartir Nasional');
      case 'kwartirHierarchy':
        return (
          member.kwartirHierarchy ||
          (member.provinsi_nama
            ? `Kwarda ${member.provinsi_nama} • Kwarcab ${member.kabupaten_nama || 'Kab. Bogor'}`
            : 'Kwartir Nasional Gerakan Pramuka')
        );
      case 'branchName':
        return member.branchName || (member as any).pangkalan_gudep || 'Pangkalan Saka Pariwisata';
      case 'gugusDepan':
        return member.gugusDepan || (member as any).pangkalan_gudep || 'Pangkalan Saka Pariwisata';
      case 'krida':
        return member.krida || member.krida_nama || 'KRIDA PEMANDU';
      case 'phone':
        return member.phone || member.nomor_telepon || '-';
      case 'email':
        return member.email || '-';
      case 'joinYear':
        return member.joinYear || (member.tanggal_bergabung ? String(member.tanggal_bergabung).substring(0, 4) : '2024');
      case 'status':
        return member.status || member.status_anggota || 'ACTIVE';
      default:
        return '';
    }
  };

  // Dynamic QR Identity: Sumber murni dari member.qr_url atau generator token (Tanpa simpan gambar di Drive)
  const qrVerificationUrl =
    member?.qrUrl ||
    member?.qr_url ||
    (member?.qrToken || member?.qr_token
      ? ktaService.generateMemberQrUrl(member.qrToken || member.qr_token)
      : member?.id
      ? ktaService.generateMemberQrUrl(member.id)
      : 'https://spwn.id/verifikasi');

  const signerQrVerificationUrl =
    previewSettings.signerMemberId
      ? ktaService.generateMemberQrUrl(previewSettings.signerMemberId)
      : `${ktaService.generateMemberQrUrl('SIGNER-KWARNAS')}`;

  const aspectRatio =
    (previewSettings.widthMm || 85.6) / (previewSettings.heightMm || 53.98);

  const isFront = currentSide === 'FRONT';
  const bgColor = isFront
    ? previewSettings.customBackgroundColorFront || '#004C85'
    : previewSettings.customBackgroundColorBack || '#0B1F33';
  const bgImg = isFront
    ? previewSettings.frontBackgroundUrl
    : previewSettings.backBackgroundUrl;

  // Filter Active Front Data Fields (Urutan baku: Nama -> KTA -> Level -> Jabatan -> Krida -> Kwartir -> Gudep)
  const fieldOrderMap: Record<KtaMemberFieldKey, number> = {
    fullName: 1,
    nationalMemberNumber: 2,
    membershipLevel: 3,
    currentPosition: 4,
    krida: 5,
    kwartirHierarchy: 6,
    kwartirName: 6,
    gugusDepan: 7,
    branchName: 7,
    provinceName: 8,
    regencyName: 9,
    districtName: 10,
    id: 11,
    status: 12,
    phone: 13,
    email: 14,
    joinYear: 15,
  };

  const activeFrontFields = (previewSettings.dataFields || [])
    .filter((f) => f.side === 'FRONT' && f.visible)
    .sort((a, b) => {
      const orderA = a.order || fieldOrderMap[a.field] || 99;
      const orderB = b.order || fieldOrderMap[b.field] || 99;
      return orderA - orderB;
    });

  // Collision Protection (KTA Layout Guard)
  const layoutGuard = calculateLayoutGuard(
    activeFrontFields,
    previewSettings.identityDensity,
    previewSettings.identityFontScale,
    previewSettings.heightMm
  );

  const effectiveScale = previewSettings.autoArrangeEnabled
    ? layoutGuard.recommendedFontScale
    : previewSettings.identityFontScale || 1.0;

  // Logo Safe Zone Resolution:
  // Logo hanya boleh di HEADER_LEFT, HEADER_RIGHT, atau BACKGROUND_WATERMARK
  const frontLogo = (previewSettings.logos || []).find(
    (l) => l.side === 'FRONT' && l.url
  );
  const backLogo = (previewSettings.logos || []).find(
    (l) => l.side === 'BACK' && l.url
  );
  const logoPlacement = previewSettings.logoSafePlacement || 'HEADER_LEFT';

  return (
    <div
      className="flex flex-col items-center gap-3 w-full select-none"
      id="digital-member-card-wrapper"
    >
      {/* CARD CONTAINER WITH CR80 RATIO & SCALING */}
      <div
        className="w-full max-w-sm sm:max-w-md relative transition-transform duration-200"
        style={{
          aspectRatio: `${aspectRatio}`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        <div
          id="digital-kta-card-body"
          className="w-full h-full relative overflow-hidden shadow-2xl border-2 border-white/20 text-white flex flex-col justify-between"
          style={{
            backgroundColor: bgColor,
            borderRadius: `${(previewSettings.cornerRadiusMm || 3.18) * 3.78}px`,
          }}
        >
          {/* Custom Background Image from Google Drive / Cloud */}
          {bgImg && (
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none"
              style={{
                backgroundImage: `url(${bgImg})`,
                opacity: (previewSettings.bgOpacity ?? 100) / 100,
              }}
            />
          )}

          {/* Background Watermark Safe Logo Layer */}
          {frontLogo && logoPlacement === 'BACKGROUND_WATERMARK' && isFront && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <img
                src={frontLogo.url}
                alt={frontLogo.name}
                className="w-1/2 h-1/2 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Aesthetic Motif Overlay - Hanya jika diaktifkan secara eksplisit */}
          {previewSettings.showBackgroundPattern && (
            <>
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1.2px,transparent_1.2px)] [background-size:10px_10px] pointer-events-none" />
              <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-[#009B4D]/15 blur-2xl pointer-events-none" />
              <div className="absolute -left-12 -top-12 w-40 h-40 rounded-full bg-[#F7941D]/15 blur-xl pointer-events-none" />
            </>
          )}

          {/* ============================================================== */}
          {/* FRONT SIDE: 3-ZONE HYBRID LAYOUT                               */}
          {/* ============================================================== */}
          {isFront && (
            <div className="relative z-10 w-full h-full p-3 sm:p-4 flex flex-col justify-between">
              {/* -------------------------------------------------------- */}
              {/* HEADER AREA: Safe Zone for Logo, Org Title & Badge      */}
              {/* -------------------------------------------------------- */}
              {(previewSettings.showFrontHeader ?? true) && (
                <div className="flex items-center justify-between border-b border-white/20 pb-2 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Safe Logo Header Placement (Hanya jika ada logo) */}
                    {frontLogo && (frontLogo.placement === 'HEADER_LEFT' || !frontLogo.placement) && frontLogo.url ? (
                      <div
                        className="rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-0.5"
                        style={{
                          width: `${(frontLogo.width || 8) * 2.5}px`,
                          height: `${(frontLogo.width || 8) * 2.5}px`,
                          opacity: (frontLogo.opacity ?? 100) / 100,
                        }}
                      >
                        <img
                          src={frontLogo.url}
                          alt={frontLogo.name || 'Logo'}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : null}

                    <div className="min-w-0">
                      <h3 className="text-[11px] sm:text-xs font-black tracking-wider uppercase leading-none truncate">
                        {previewSettings.frontOrganizationTitle || 'GERAKAN PRAMUKA INDONESIA'}
                      </h3>
                      <p className="text-[7.5px] sm:text-[8.5px] text-slate-200 uppercase tracking-wider mt-0.5 font-bold truncate">
                        {previewSettings.frontOrganizationSubtitle || 'SAKA PARIWISATA NASIONAL'}
                      </p>
                    </div>
                  </div>

                  {/* Right Header: Optional Right Logo */}
                  {frontLogo && frontLogo.placement === 'HEADER_RIGHT' && frontLogo.url ? (
                    <div
                      className="shrink-0 pl-2 flex items-center justify-center p-0.5"
                      style={{
                        width: `${(frontLogo.width || 8) * 2.5}px`,
                        height: `${(frontLogo.width || 8) * 2.5}px`,
                        opacity: (frontLogo.opacity ?? 100) / 100,
                      }}
                    >
                      <img
                        src={frontLogo.url}
                        alt={frontLogo.name || 'Logo Kanan'}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : null}
                </div>
              )}

              {/* Front Free-Positioned Logos (Posisi X, Y Bebas) */}
              {(previewSettings.logos || [])
                .filter(
                  (l) =>
                    l.side === 'FRONT' &&
                    l.visible !== false &&
                    l.url &&
                    l.placement !== 'HEADER_LEFT' &&
                    l.placement !== 'HEADER_RIGHT' &&
                    l.placement !== 'BACKGROUND_WATERMARK'
                )
                .map((logo) => (
                  <div
                    key={logo.id}
                    className="absolute pointer-events-none flex items-center justify-center"
                    style={{
                      left: `${logo.x ?? 50}%`,
                      top: `${logo.y ?? 50}%`,
                      width: `${logo.width ?? 10}%`,
                      transform: 'translate(-50%, -50%)',
                      opacity: (logo.opacity ?? 100) / 100,
                      zIndex: 20,
                    }}
                  >
                    <img
                      src={logo.url}
                      alt={logo.name || 'Logo'}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}

              {/* -------------------------------------------------------- */}
              {/* 3-ZONE CARD BODY: Photo (1) + Identity (2) + QR (3)     */}
              {/* -------------------------------------------------------- */}
              <div className="flex-1 my-2 flex items-center gap-2 sm:gap-2.5 min-h-0 overflow-hidden relative">
                {/* ------------------------------------------------------ */}
                {/* ZONE 1: PHOTO AREA (0% - 26%)                         */}
                {/* ------------------------------------------------------ */}
                <div
                  className="w-[24%] sm:w-[25%] aspect-[3/4] rounded-lg overflow-hidden border-2 border-white/40 bg-slate-900 shadow-md shrink-0 flex items-center justify-center relative"
                  title="Zone 1: Foto Anggota"
                >
                  {member?.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.fullName || 'Foto KTA'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-1 text-center">
                      <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center mb-1">
                        <Award className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                      <span className="text-[6.5px] sm:text-[7px] font-bold text-slate-300 leading-tight uppercase">
                        PAS FOTO
                      </span>
                    </div>
                  )}
                </div>

                {/* ------------------------------------------------------ */}
                {/* ZONE 2: IDENTITY AREA                                 */}
                {/* Structured Auto-Flow Identity Stack (Flex Column)      */}
                {/* ------------------------------------------------------ */}
                <div
                  className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden"
                  style={{
                    gap: `${layoutGuard.recommendedGap}px`,
                    paddingRight: previewSettings.showQrCode && (previewSettings.qrX ?? 84) > 65 ? '23%' : '0%',
                  }}
                  title="Zone 2: Structured Auto-Flow Identity Stack"
                >
                  {activeFrontFields.map((field) => {
                    const val = getFieldValue(field.field);
                    const isName = field.field === 'fullName';
                    const isKta = field.field === 'nationalMemberNumber';
                    const isLevel = field.field === 'membershipLevel';

                    // Kontrol visibilitas label tambahan: disembunyikan jika layout padat atau showFieldLabels nonaktif
                    const shouldDisplayLabel =
                      field.showLabel &&
                      previewSettings.showFieldLabels !== false &&
                      !isName &&
                      !isKta &&
                      !layoutGuard.isOvercrowded;

                    return (
                      <div key={field.id} className="min-w-0 leading-tight">
                        {/* Tampilkan label jika showLabel diaktifkan DAN bukan layout padat */}
                        {shouldDisplayLabel && (
                          <span className="block text-[6.5px] uppercase tracking-wider text-slate-300/85 font-medium leading-none mb-0.5">
                            {field.label}
                          </span>
                        )}

                        {/* Rendering khusus per field key untuk hierarki tipografi visual */}
                        {isName ? (
                          <h4
                            className="font-black text-white truncate tracking-tight uppercase"
                            style={{
                              fontSize: `${Math.max(9, (field.fontSize || 12) * effectiveScale)}px`,
                              color: field.color || '#FFFFFF',
                            }}
                          >
                            {val}
                          </h4>
                        ) : isKta ? (
                          <div
                            className="font-mono font-bold tracking-wider truncate"
                            style={{
                              fontSize: `${Math.max(8, (field.fontSize || 10) * effectiveScale)}px`,
                              color: field.color || '#F7941D',
                            }}
                          >
                            {val}
                          </div>
                        ) : isLevel ? (
                          <div className="flex items-center gap-1 truncate">
                            <span
                              className="inline-flex items-center px-1.5 py-0.2 rounded font-bold uppercase tracking-wider truncate bg-white/15 border border-white/25 text-amber-200 shadow-2xs"
                              style={{
                                fontSize: `${Math.max(7, (field.fontSize || 8.5) * effectiveScale)}px`,
                              }}
                            >
                              {val}
                            </span>
                          </div>
                        ) : (
                          <p
                            className="truncate leading-tight"
                            style={{
                              fontSize: `${Math.max(7, (field.fontSize || 8) * effectiveScale)}px`,
                              fontWeight:
                                field.fontWeight === 'bold'
                                  ? 700
                                  : field.fontWeight === 'medium'
                                  ? 500
                                  : 400,
                              color: field.color || '#E2E8F0',
                              textTransform: field.textTransform || 'none',
                            }}
                          >
                            {shouldDisplayLabel && (
                              <span className="text-slate-400 font-normal mr-1">
                                {field.label}:
                              </span>
                            )}
                            {val}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ------------------------------------------------------ */}
                {/* ZONE 3: DYNAMIC QR CODE - TANPA EFEK & BISA DIATUR X/Y */}
                {/* ------------------------------------------------------ */}
                {previewSettings.showQrCode && (
                  <div
                    className="absolute flex flex-col items-center justify-center select-none"
                    style={{
                      left: `${previewSettings.qrX ?? 84}%`,
                      top: `${previewSettings.qrY ?? 50}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 20,
                    }}
                    title="QR Code Identitas Anggota"
                  >
                    {/* Flat Clean Container - NO STROKE / NO SHADOW (Clean Barcode + Adjustable Background) */}
                    <div
                      className="flex items-center justify-center select-none"
                      style={{
                        padding: `${previewSettings.qrBackgroundPadding ?? 2}px`,
                        backgroundColor:
                          (previewSettings.qrBackgroundPadding ?? 2) === 0
                            ? 'transparent'
                            : (previewSettings.qrBackgroundColor || '#FFFFFF'),
                        opacity: ((previewSettings.qrBackgroundOpacity ?? 100) / 100),
                        boxShadow: 'none',
                        border: 'none',
                        outline: 'none',
                        filter: 'none',
                        borderRadius: '0px',
                      }}
                    >
                      <DynamicQrCode
                        value={qrVerificationUrl}
                        size={Math.max(20, Math.round((previewSettings.qrSize ?? 18) * 2.5) - 4)}
                        margin={0}
                        errorCorrectionLevel="M"
                        clean={true}
                        backgroundPadding={0}
                      />
                    </div>
                    {previewSettings.showQrCaption && (
                      <span className="text-[6px] text-slate-300 font-mono tracking-tighter mt-0.5 text-center truncate">
                        {previewSettings.qrCaptionText || 'VERIFIKASI QR'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* -------------------------------------------------------- */}
              {/* FOOTER AREA: Validity & Reference System                */}
              {/* -------------------------------------------------------- */}
              {((previewSettings.showFrontValidityText ?? true) || (previewSettings.showFrontMemberId ?? true)) && (
                <div className="pt-1.5 border-t border-white/20 flex items-center justify-between text-[6.5px] sm:text-[7px] text-slate-300 shrink-0">
                  {(previewSettings.showFrontValidityText ?? true) ? (
                    <span className="truncate">
                      {previewSettings.frontValidityText || 'Berlaku Selama Menjadi Anggota Aktif'}
                    </span>
                  ) : <span />}
                  {(previewSettings.showFrontMemberId ?? true) && (
                    <span className="font-mono text-slate-400 shrink-0 pl-2">
                      {member?.id || 'SPWN-MEMBER'}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* BACK SIDE RENDERING (SEMUA ELEMEN DAPAT DIATUR X, Y & ON/OFF)  */}
          {/* ============================================================== */}
          {!isFront && (
            <div className="relative z-10 w-full h-full overflow-hidden p-3 sm:p-3.5 select-none">
              {/* Back Logos (Hanya muncul jika ditambahkan melalui KTA Desainer, dengan posisi X, Y bebas diatur) */}
              {(previewSettings.logos || [])
                .filter((l) => l.side === 'BACK' && l.visible !== false && l.url)
                .map((logo) => (
                  <div
                    key={logo.id}
                    className="absolute flex items-center justify-center pointer-events-none"
                    style={{
                      left: `${logo.x ?? 85}%`,
                      top: `${logo.y ?? 10}%`,
                      width: `${logo.width ?? 8}%`,
                      height: logo.height ? `${logo.height}%` : 'auto',
                      transform: 'translate(-50%, -50%)',
                      opacity: (logo.opacity ?? 100) / 100,
                      zIndex: 20,
                    }}
                  >
                    <img
                      src={logo.url}
                      alt={logo.name || 'Logo Belakang'}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}

              {/* 1. Header Judul Belakang (Aktif/Nonaktif & X, Y) */}
              {(previewSettings.showBackHeaderTitle ?? true) && (
                <div
                  className="absolute max-w-[80%] leading-tight pointer-events-none"
                  style={{
                    left: `${previewSettings.backHeaderTitleX ?? 4}%`,
                    top: `${previewSettings.backHeaderTitleY ?? 6}%`,
                  }}
                >
                  <h4
                    className="font-black tracking-wider uppercase text-white truncate"
                    style={{
                      fontSize: `${previewSettings.backHeaderTitleFontSize || 9.5}px`,
                    }}
                  >
                    {previewSettings.backHeaderTitle || 'KETENTUAN KARTU TANDA ANGGOTA'}
                  </h4>
                </div>
              )}

              {/* 2. Subjudul Organisasi Belakang (Aktif/Nonaktif & X, Y) */}
              {(previewSettings.showBackSubTitle ?? true) && (
                <div
                  className="absolute max-w-[80%] leading-tight pointer-events-none"
                  style={{
                    left: `${previewSettings.backSubTitleX ?? 4}%`,
                    top: `${previewSettings.backSubTitleY ?? 13}%`,
                  }}
                >
                  <p
                    className="text-slate-300 uppercase tracking-wider truncate"
                    style={{
                      fontSize: `${previewSettings.backSubTitleFontSize || 6.5}px`,
                    }}
                  >
                    {previewSettings.backSubTitle || 'SAKA PARIWISATA GERAKAN PRAMUKA INDONESIA'}
                  </p>
                </div>
              )}

              {/* Garis Pemisah Header Belakang */}
              {(previewSettings.showBackHeaderDivider ?? true) &&
                ((previewSettings.showBackHeaderTitle ?? true) || (previewSettings.showBackSubTitle ?? true)) && (
                <div
                  className="absolute border-b border-white/20 pointer-events-none"
                  style={{
                    left: '4%',
                    top: '19%',
                    right: '4%',
                  }}
                />
              )}

              {/* 3. Butir-butir Ketentuan / Syarat KTA (Aktif/Nonaktif & X, Y, Width) */}
              {(previewSettings.showTerms ?? true) && (
                <div
                  className="absolute space-y-1 leading-tight pointer-events-none"
                  style={{
                    left: `${previewSettings.termsX ?? 4}%`,
                    top: `${previewSettings.termsY ?? 24}%`,
                    maxWidth: `${previewSettings.termsWidth ?? 54}%`,
                  }}
                >
                  {(previewSettings.terms || []).map((term, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-1 leading-tight text-slate-200"
                      style={{
                        fontSize: `${previewSettings.termsFontSize || 6.5}px`,
                      }}
                    >
                      <span className="text-amber-400 font-bold shrink-0">
                        {idx + 1}.
                      </span>
                      <span>{term}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. Tempat & Tanggal Penerbitan (Aktif/Nonaktif & X, Y) */}
              {(previewSettings.showIssueLocationDate ?? true) && (
                <div
                  className="absolute text-center pointer-events-none"
                  style={{
                    left: `${previewSettings.issueLocationDateX ?? 74}%`,
                    top: `${previewSettings.issueLocationDateY ?? 25}%`,
                    transform: 'translateX(-50%)',
                    width: '38%',
                  }}
                >
                  <p className="text-[6.5px] sm:text-[7px] text-slate-300 font-medium whitespace-nowrap">
                    {previewSettings.issueLocationDate || 'Jakarta, 17 Agustus 2024'}
                  </p>
                </div>
              )}

              {/* 5. QR Code Pengesah (Aktif/Nonaktif & X, Y - TANPA EFFECT) */}
              {(previewSettings.showSignerQrCode ?? true) && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: `${previewSettings.signerQrX ?? 74}%`,
                    top: `${previewSettings.signerQrY ?? 48}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {/* Clean Flat Container - NO STROKE / NO SHADOW (Clean Barcode + Adjustable Background) */}
                  <div
                    className="flex items-center justify-center select-none"
                    style={{
                      padding: `${previewSettings.signerQrBackgroundPadding ?? (previewSettings.qrBackgroundPadding ?? 2)}px`,
                      backgroundColor:
                        (previewSettings.signerQrBackgroundPadding ?? (previewSettings.qrBackgroundPadding ?? 2)) === 0
                          ? 'transparent'
                          : '#FFFFFF',
                      boxShadow: 'none',
                      border: 'none',
                      outline: 'none',
                      filter: 'none',
                      borderRadius: '0px',
                    }}
                  >
                    <DynamicQrCode
                      value={signerQrVerificationUrl}
                      size={Math.max(18, Math.round((previewSettings.signerQrSize ?? 18) * 2.2) - 4)}
                      margin={0}
                      errorCorrectionLevel="M"
                      clean={true}
                      backgroundPadding={0}
                    />
                  </div>
                </div>
              )}

              {/* 6. Jabatan Penandatangan (Aktif/Nonaktif & X, Y) */}
              {(previewSettings.showSignerTitle ?? true) && (
                <div
                  className="absolute text-center pointer-events-none"
                  style={{
                    left: `${previewSettings.signerTitleX ?? 74}%`,
                    top: `${previewSettings.signerTitleY ?? 68}%`,
                    transform: 'translateX(-50%)',
                    width: '42%',
                  }}
                >
                  <p
                    className="font-bold text-slate-200 uppercase leading-none truncate"
                    style={{
                      fontSize: `${previewSettings.signerTitleFontSize || 6.5}px`,
                    }}
                  >
                    {previewSettings.signerTitle || 'Pimpinan Saka Pariwisata'}
                  </p>
                </div>
              )}

              {/* 7. Nama Penandatangan (Aktif/Nonaktif & X, Y) */}
              {(previewSettings.showSignerName ?? true) && (
                <div
                  className="absolute text-center pointer-events-none"
                  style={{
                    left: `${previewSettings.signerNameX ?? 74}%`,
                    top: `${previewSettings.signerNameY ?? 76}%`,
                    transform: 'translateX(-50%)',
                    width: '42%',
                  }}
                >
                  <p
                    className="font-black text-amber-300 underline leading-none truncate"
                    style={{
                      fontSize: `${previewSettings.signerNameFontSize || 7.5}px`,
                    }}
                  >
                    {previewSettings.signerName || 'Dr. H. Budi Santoso, M.Si.'}
                  </p>
                </div>
              )}

              {/* 8. Keterangan / Subtitle Penandatangan (Aktif/Nonaktif & X, Y) */}
              {(previewSettings.showSignerSubtitle ?? true) && (
                <div
                  className="absolute text-center pointer-events-none"
                  style={{
                    left: `${previewSettings.signerSubtitleX ?? 74}%`,
                    top: `${previewSettings.signerSubtitleY ?? 83}%`,
                    transform: 'translateX(-50%)',
                    width: '42%',
                  }}
                >
                  <p
                    className="text-slate-400 font-medium leading-none truncate"
                    style={{
                      fontSize: `${previewSettings.signerSubtitleFontSize || 6.2}px`,
                    }}
                  >
                    {previewSettings.signerSubtitle || 'Kwartir Nasional Gerakan Pramuka'}
                  </p>
                </div>
              )}

              {/* 9. Back Footer (Aktif/Nonaktif & X, Y) */}
              {(previewSettings.showBackFooter ?? true) && (
                <div
                  className="absolute pt-1 border-t border-white/20 flex items-center justify-between text-[6px] sm:text-[6.5px] text-slate-400 pointer-events-none"
                  style={{
                    left: `${previewSettings.backFooterX ?? 4}%`,
                    top: `${previewSettings.backFooterY ?? 92}%`,
                    right: '4%',
                  }}
                >
                  <span className="truncate">
                    {previewSettings.backFooterLeftText || 'Sekretariat SAKA Pariwisata Nasional • spwn.id'}
                  </span>
                  <span className="shrink-0 pl-1 font-mono">
                    {previewSettings.backFooterRightText || 'ISO/IEC 7810 ID-1 Standard'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CARD ACTION CONTROLS */}
      {showControls && (
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={toggleSide}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
            <span>Lihat Sisi {currentSide === 'FRONT' ? 'Belakang' : 'Depan'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Kartu</span>
          </button>
        </div>
      )}
    </div>
  );
};
