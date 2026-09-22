/**
 * LegacyKtaPreview
 * -----------------------------------------------------------------
 * Mempertahankan 100% spesifikasi dan desain KTA lama (ISO/IEC 7810 ID-1)
 * untuk preview KTA existing, template lama, dan generator cetak.
 * Dipisahkan secara arsitektural sesuai mandat Refinement 1.
 */

import React from 'react';
import { Shield, QrCode, Download, Printer } from 'lucide-react';
import { Button } from '../ui/Button';
import { DynamicQrCode } from './DynamicQrCode';
import { ktaService } from '../../services/ktaService';

export interface LegacyKtaMemberData {
  fullName: string;
  noKta: string;
  membershipLevel: string;
  kridaName: string;
  province: string;
  city?: string;
  joinedDate?: string;
  photoUrl?: string;
  verificationToken?: string;
  qrToken?: string;
  qrUrl?: string;
  status: string;
}

export interface LegacyKtaPreviewProps {
  memberData: LegacyKtaMemberData;
  onDownloadPDF?: () => void;
  onPrint?: () => void;
  showActions?: boolean;
}

export const LegacyKtaPreview: React.FC<LegacyKtaPreviewProps> = ({
  memberData,
  onDownloadPDF,
  onPrint,
  showActions = true,
}) => {
  return (
    <div className="flex flex-col items-center gap-4 w-full" id="legacy-kta-preview-container">
      {/* LOCKED CARD CONTAINER (ISO/IEC 7810 ID-1 Ratio: 85.6mm x 53.98mm) */}
      <div 
        id="legacy-kta-card"
        className="w-full max-w-sm sm:max-w-md aspect-[1.586/1] rounded-2xl p-5 text-white shadow-xl relative overflow-hidden bg-gradient-to-br from-[#0066B3] via-[#004C85] to-[#0B1F33] border-2 border-white/20 select-none"
      >
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
                GERAKAN PRAMUKA INDONESIA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full border border-white/20 text-[10px] font-semibold tracking-wide">
            <Shield className="w-3 h-3 text-[#009B4D]" />
            <span>KTA RESMI</span>
          </div>
        </div>

        {/* Card Body: Photo, Info, & Signature */}
        <div className="relative z-10 grid grid-cols-[auto_1fr_auto] gap-3.5 pt-3.5 items-center">
          {/* Member Photo */}
          <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 border-white/40 bg-slate-800 shrink-0 shadow-inner">
            {memberData.photoUrl ? (
              <img
                src={memberData.photoUrl}
                alt={memberData.fullName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50 text-xs font-medium">
                PAS FOTO
              </div>
            )}
          </div>

          {/* Member Identity Details */}
          <div className="space-y-1 overflow-hidden">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-slate-300 font-medium">Nama Anggota</p>
              <h4 className="text-xs sm:text-sm font-bold truncate leading-tight">
                {memberData.fullName}
              </h4>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-wider text-slate-300 font-medium">Nomor KTA Nasional</p>
              <p className="text-xs font-mono font-bold tracking-wider text-[#F7941D] leading-tight">
                {memberData.noKta}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1 pt-0.5">
              <div>
                <p className="text-[8px] uppercase tracking-wider text-slate-300">Tingkatan</p>
                <p className="text-[10px] font-semibold truncate leading-tight">{memberData.membershipLevel}</p>
              </div>
              <div>
                <p className="text-[8px] uppercase tracking-wider text-slate-300">Krida</p>
                <p className="text-[10px] font-semibold truncate leading-tight text-[#009B4D]">{memberData.kridaName}</p>
              </div>
            </div>

            <div>
              <p className="text-[8px] uppercase tracking-wider text-slate-300">Kwartir Daerah</p>
              <p className="text-[10px] font-medium text-slate-200 truncate leading-tight">{memberData.province}</p>
            </div>
          </div>

          {/* Verification Dynamic QR Code Stamp */}
          <div className="flex flex-col items-center justify-center shrink-0 pl-1">
            <div className="w-16 h-16 sm:w-18 sm:h-18 bg-white p-0.5 rounded-xl shadow-md border border-white/50 flex flex-col items-center justify-center overflow-hidden">
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
                size={62}
                margin={0}
                errorCorrectionLevel="M"
              />
            </div>
            <span className="text-[7px] tracking-widest text-slate-300 uppercase mt-1 font-mono">
              DYNAMIC QR ID
            </span>
          </div>
        </div>

        {/* Card Footer: Microprint Watermark & Expiry */}
        <div className="absolute bottom-1.5 left-5 right-5 flex justify-between items-center text-[7.5px] text-slate-300/80 font-mono tracking-wider border-t border-white/10 pt-1">
          <span>SPWN DIGITAL TRUST ID-1 • AUTHENTICATED</span>
          <span>STATUS: {memberData.status}</span>
        </div>
      </div>

      {/* Optional Action Controls */}
      {showActions && (
        <div className="flex items-center gap-2 pt-2">
          {onDownloadPDF && (
            <Button size="sm" variant="outline" leftIcon={<Download className="w-4 h-4 text-[#0066B3]" />} onClick={onDownloadPDF}>
              Unduh KTA PDF
            </Button>
          )}
          {onPrint && (
            <Button size="sm" variant="ghost" leftIcon={<Printer className="w-4 h-4 text-slate-600" />} onClick={onPrint}>
              Cetak Kartu Fisik
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
