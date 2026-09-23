/**
 * LOCKED COMPONENT: Digital KTA Card Preview
 * -------------------------------------------------------------
 * Sesuai dengan instruksi arsitektur SPWN Apps 2.0:
 * Komponen ini adalah LOCKED COMPONENT.
 * Desain kartu, template rasio, penempatan elemen identitas,
 * QR code, dan styling cetak KTA dipertahankan 100%.
 * -------------------------------------------------------------
 */

import React from 'react';
import { Shield, QrCode, Download, Printer } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { DynamicQrCode } from '../../../../components/display/DynamicQrCode';
import { useUIStore } from '../../../../stores/uiStore';
import { ktaService } from '../../../../services/ktaService';

export interface DigitalKTACardProps {
  memberData: {
    fullName: string;
    noKta: string;
    membershipLevel: string;
    kridaName: string;
    province: string;
    city: string;
    kecamatan?: string;
    levelOrganisasi?: 'KWARTIR_NASIONAL' | 'WILAYAH';
    kodeProvinsi?: string;
    kodeKabupaten?: string;
    kodeKecamatan?: string;
    joinedDate: string;
    photoUrl?: string;
    verificationToken?: string;
    qrToken?: string;
    qrUrl?: string;
    status: string;
  };
  onDownloadPDF?: () => void;
  onPrint?: () => void;
}

export const DigitalKTACard: React.FC<DigitalKTACardProps> = ({
  memberData,
  onDownloadPDF,
  onPrint,
}) => {
  const isKwarnas =
    memberData.levelOrganisasi === 'KWARTIR_NASIONAL' ||
    (memberData.noKta && memberData.noKta.startsWith('00.') && memberData.noKta.split('.').length === 2);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* LOCKED CARD CONTAINER (ISO/IEC 7810 ID-1 Ratio: 85.6mm x 53.98mm) */}
      <div className="w-full max-w-sm sm:max-w-md aspect-[1.586/1] rounded-2xl p-5 text-white shadow-xl relative overflow-hidden bg-gradient-to-br from-[#0066B3] via-[#004C85] to-[#0B1F33] border-2 border-white/20 select-none">
        {/* Card Background Motifs (Batik Garis & Sapta Pesona Emblem) */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:12px_12px] pointer-events-none" />
        <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full bg-[#009B4D]/20 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-44 h-44 rounded-full bg-[#F7941D]/15 blur-xl pointer-events-none" />

        {/* Card Header: Logos & Organization */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-xs flex items-center justify-center font-bold text-xs border border-white/30 text-white">
              SP
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase leading-none">
                SAKA PARIWISATA
              </h3>
              <p className="text-[9px] text-slate-200 uppercase tracking-widest mt-0.5 font-medium">
                {isKwarnas ? 'KWARTIR NASIONAL GERAKAN PRAMUKA' : 'GERAKAN PRAMUKA INDONESIA'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                isKwarnas ? 'bg-[#E6A100] text-slate-900' : 'bg-[#009B4D] text-white'
              }`}
            >
              {isKwarnas ? 'KWARNAS PUSAT' : 'KTA WILAYAH'}
            </span>
          </div>
        </div>

        {/* Card Body: Photo & Profile Information */}
        <div className="relative z-10 mt-3.5 flex items-center gap-4">
          {/* Official Member Photo */}
          <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden border-2 border-white/40 shadow-md shrink-0 bg-slate-800">
            {memberData.photoUrl ? (
              <img
                src={memberData.photoUrl}
                alt={memberData.fullName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-300">
                FOTO KTA
              </div>
            )}
          </div>

          {/* Member Credentials */}
          <div className="flex-1 min-w-0 space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-white truncate tracking-tight">
              {memberData.fullName}
            </h4>
            
            <div className="font-mono text-xs text-[#F7941D] font-bold tracking-wider">
              {memberData.noKta}
            </div>

            <div className="text-[10px] sm:text-[11px] text-slate-200 space-y-0.5 pt-0.5">
              <p className="truncate">
                <span className="text-slate-400">Tingkat:</span> {memberData.membershipLevel}
              </p>
              <p className="truncate">
                <span className="text-slate-400">Krida:</span> {memberData.kridaName}
              </p>
              <p className="truncate">
                <span className="text-slate-400">{isKwarnas ? 'Kwartir:' : 'Kwarda/Cab:'}</span>{' '}
                {isKwarnas ? 'Kwartir Nasional' : `${memberData.province} (${memberData.city})`}
              </p>
            </div>
          </div>
        </div>

        {/* Card Footer: Dynamic QR Code & Verification Token */}
        <div className="relative z-10 mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between">
          <div className="text-[9px] text-slate-300">
            <p>Bergabung: {memberData.joinedDate}</p>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px] sm:max-w-[240px]">
              {memberData.qrToken ? `QR: ${memberData.qrToken}` : `Token: ${memberData.verificationToken || '-'}`}
            </p>
          </div>

          {/* Verification Dynamic QR Code - Clean without stroke or shadow */}
          <div className="w-9 h-9 bg-white p-0.5 text-slate-900 flex items-center justify-center overflow-hidden">
            <DynamicQrCode
              value={
                memberData.qrUrl ||
                (memberData.qrToken
                  ? ktaService.generateMemberQrUrl(memberData.qrToken)
                  : memberData.verificationToken
                  ? ktaService.generateMemberQrUrl(memberData.verificationToken)
                  : memberData.noKta
                  ? ktaService.generateMemberQrUrl(memberData.noKta)
                  : '')
              }
              size={34}
              margin={0}
              errorCorrectionLevel="M"
              clean={true}
              backgroundPadding={0}
            />
          </div>
        </div>
      </div>

      {/* Action Controls for Member */}
      <div className="flex items-center gap-2.5">
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Download className="w-3.5 h-3.5" />}
          onClick={
            onDownloadPDF ||
            (() =>
              useUIStore.getState().addToast({
                type: 'success',
                title: 'Unduh KTA Digital',
                message: 'Menyiapkan berkas KTA Digital resmi dalam format PDF standar Kwarnas.',
              }))
          }
        >
          Unduh PDF KTA
        </Button>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Printer className="w-3.5 h-3.5" />}
          onClick={onPrint || (() => window.print())}
        >
          Cetak Kartu
        </Button>
      </div>
    </div>
  );
};
