/**
 * SPWN Apps 2.0 - KTA Card Designer & Template System Types
 * Location: src/types/kta.types.ts
 * -------------------------------------------------------------
 * Mendefinisikan tipe data lengkap untuk:
 * 1. Preset ukuran kartu (CR80/ISO ID-1, KTP, SIM, Custom)
 * 2. Posisi, ukuran, font, warna, alignment, dan visibility elemen
 * 3. Structured Auto-Flow Identity Stack & KTA Layout Guard
 * 4. Dynamic Data Binding anggota (termasuk membershipLevel)
 * 5. Integrasi Dynamic QR Identity tanpa simpan gambar
 * 6. Schema database KTA_TEMPLATE (Google Sheets / Relational DB)
 */

export type KtaCardPreset = 'CR80_KTA' | 'KTP' | 'SIM' | 'CUSTOM';
export type KtaCardSide = 'FRONT' | 'BACK';

export type SakaMembershipLevel =
  | 'Anggota'
  | 'Dewan Saka'
  | 'Pamong Saka'
  | 'Pimpinan Saka'
  | 'Mabisaka';

export type KtaMemberFieldKey =
  | 'fullName'
  | 'id'
  | 'nationalMemberNumber'
  | 'membershipLevel'
  | 'currentPosition'
  | 'provinceName'
  | 'regencyName'
  | 'districtName'
  | 'kwartirName'
  | 'kwartirHierarchy'
  | 'branchName'
  | 'gugusDepan'
  | 'krida'
  | 'phone'
  | 'email'
  | 'joinYear'
  | 'status';

export interface KtaDataFieldConfig {
  id: string;
  field: KtaMemberFieldKey;
  label: string;
  side: KtaCardSide;
  visible: boolean;
  showLabel?: boolean;
  order?: number;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage (0-100)
  fontSize: number; // pt or px
  fontWeight: 'normal' | 'medium' | 'bold' | 'black';
  color: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  align?: 'left' | 'center' | 'right';
}

export interface KtaTextElement {
  id: string;
  text: string;
  side: KtaCardSide;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage (0-100)
  fontSize: number;
  fontWeight: 'normal' | 'medium' | 'bold' | 'black';
  color: string;
  align?: 'left' | 'center' | 'right';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export type KtaLogoSafePlacement = 'HEADER_LEFT' | 'HEADER_RIGHT' | 'BACKGROUND_WATERMARK' | 'CUSTOM';

export interface KtaLogoElement {
  id: string;
  name: string;
  url: string;
  side: KtaCardSide;
  placement?: KtaLogoSafePlacement;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage (0-100)
  height: number; // percentage (0-100)
  opacity?: number;
  objectFit?: 'contain' | 'cover';
  visible?: boolean;
}

export type KtaIdentityDensity = 'compact' | 'standard' | 'spacious';
export type KtaIdentityLayoutMode = 'AUTO_FLOW' | 'CUSTOM';

export interface KtaLayoutGuardStatus {
  activeFieldsCount: number;
  densityScore: number; // 0 - 100
  isOvercrowded: boolean;
  warningMessage?: string;
  recommendedFontScale: number;
  recommendedGap: number;
  suggestHideLabels?: boolean;
  availableHeightPx?: number;
  occupiedHeightPx?: number;
  recommendedDensity?: KtaIdentityDensity;
  autoAdjusted?: boolean;
}

export interface KtaCardSettings {
  id?: string;
  name?: string;
  preset: KtaCardPreset;
  widthMm: number;
  heightMm: number;
  cornerRadiusMm: number;
  frontBackgroundUrl?: string;
  backBackgroundUrl?: string;
  customBackgroundColorFront?: string;
  customBackgroundColorBack?: string;
  bgOpacity?: number;
  showBackgroundPattern?: boolean; // Pola motif latar belakang (default: false / clean)

  // Hybrid Layout Architecture
  identityLayoutMode: KtaIdentityLayoutMode; // 'AUTO_FLOW' | 'CUSTOM'
  identityDensity: KtaIdentityDensity;
  identityFontScale: number; // default 1.0
  autoArrangeEnabled: boolean;
  showFieldLabels?: boolean;
  logoSafePlacement?: KtaLogoSafePlacement;

  // Front QR Code (Zone 3 / Precision Positioning - No Effects)
  showQrCode: boolean;
  qrX?: number; // percentage (0-100)
  qrY?: number; // percentage (0-100)
  qrSize?: number; // percentage / scale
  showQrCaption?: boolean;
  qrCaptionText?: string;

  // Typography & Headers
  showFrontHeader?: boolean;
  frontOrganizationTitle?: string;
  frontOrganizationSubtitle?: string;
  showFrontValidityText?: boolean;
  frontValidityText?: string;
  showFrontMemberId?: boolean;

  // Back Side Elements: Individual Visibility & X / Y Precision Coordinates
  showBackHeaderTitle?: boolean;
  backHeaderTitle?: string;
  backHeaderTitleX?: number; // percentage (0-100)
  backHeaderTitleY?: number; // percentage (0-100)
  backHeaderTitleFontSize?: number;
  showBackHeaderDivider?: boolean;

  showBackSubTitle?: boolean;
  backSubTitle?: string;
  backSubTitleX?: number; // percentage (0-100)
  backSubTitleY?: number; // percentage (0-100)
  backSubTitleFontSize?: number;

  showTerms?: boolean;
  terms: string[];
  termsX?: number; // percentage (0-100)
  termsY?: number; // percentage (0-100)
  termsWidth?: number; // percentage (20-100)
  termsFontSize?: number;

  showBackFooter?: boolean;
  backFooterLeftText?: string;
  backFooterRightText?: string;
  backFooterX?: number;
  backFooterY?: number;

  // Dynamic Elements
  dataFields: KtaDataFieldConfig[];
  textElements: KtaTextElement[];
  logos: KtaLogoElement[];

  // Signer / Pengesah (Back Side)
  showSignerQrCode?: boolean;
  showSignerName?: boolean;
  showSignerTitle?: boolean;
  showSignerSubtitle?: boolean;
  signerMemberId?: string;
  signerName?: string;
  signerTitle?: string;
  signerSubtitle?: string;
  signerQrX?: number;
  signerQrY?: number;
  signerQrSize?: number;
  signerQrPadding?: number;
  signerX?: number;
  signerY?: number;
  signerTitleX?: number;
  signerTitleY?: number;
  signerNameX?: number;
  signerNameY?: number;
  signerSubtitleX?: number;
  signerSubtitleY?: number;
  signerTitleFontSize?: number;
  signerNameFontSize?: number;
  signerSubtitleFontSize?: number;
  signerNameXOffset?: number;
  signerNameYOffset?: number;
  showIssueLocationDate?: boolean;
  issueLocationDate?: string;
  issueLocationDateX?: number;
  issueLocationDateY?: number;
  signerQrBackgroundColor?: string;
  signerQrBorderWidth?: number;
  signerQrBorderRadius?: number;
  showSignerVerified?: boolean;
  lastUpdated?: string;
}

/**
 * Representasi database schema KTA_TEMPLATE (Google Sheets / Relational DB)
 */
export interface KtaTemplateDbRecord {
  template_id: string;
  template_name: string;
  front_background_url?: string;
  back_background_url?: string;
  card_width: number;
  card_height: number;
  front_layout_json?: string;
  back_layout_json?: string;
  identity_layout_mode?: KtaIdentityLayoutMode;
  qr_settings_json?: string;
  elements_json?: string;
  qr_position?: string;
  qr_size?: number;
  created_by: string;
  updated_at: string;
}

/**
 * Standard Member representation for KTA dynamic data binding
 */
export interface KtaMemberBindingData {
  id: string;
  fullName: string;
  nationalMemberNumber: string;
  membershipLevel?: SakaMembershipLevel | string;
  currentPosition: string;
  provinceName: string;
  provinsi_id?: string;
  regencyName: string;
  kabupaten_id?: string;
  districtName: string;
  kecamatan_id?: string;
  wilayah_kecamatan_id?: string;
  kwartirName: string;
  kwartirHierarchy: string;
  branchName?: string;
  gugusDepan?: string;
  krida?: string;
  phone?: string;
  email?: string;
  joinYear?: string;
  status: string;
  photoUrl?: string;
  qrToken?: string;
  qrUrl?: string;
}
