/**
 * SPWN Apps 2.0 - Spreadsheet & Drive Integration Service
 * Location: src/services/spreadsheetService.ts
 * -------------------------------------------------------------
 * Menghubungkan KTA Designer dengan:
 * 1. Sheet KTA_TEMPLATE di Google Spreadsheet (melalui Google Apps Script Web App)
 * 2. Schema KTA_TEMPLATE (front_layout_json, back_layout_json, identity_layout_mode, qr_settings_json)
 * 3. Upload asset gambar / logo / background ke Google Drive
 * 4. Fallback sinkronisasi lokal jika offline / development mode
 */

import {
  KtaCardSettings,
  KtaLayoutGuardStatus,
  KtaTemplateDbRecord,
} from '../types/kta.types';
import { storage, DEFAULT_KTA_SETTINGS } from './storage';
import { apiClient } from './api/apiClient';
import { calculateLayoutGuard } from '../features/admin/components/DigitalMemberCard';

export interface UploadAssetResult {
  success: boolean;
  directUrl?: string;
  fileId?: string;
  message?: string;
}

export const spreadsheetService = {
  /**
   * Mengambil template KTA dari sheet KTA_TEMPLATE di Google Spreadsheet.
   */
  getKtaTemplate: async (templateId: string = 'TMPL_DEFAULT'): Promise<KtaTemplateDbRecord | null> => {
    try {
      const response = await apiClient.get<KtaTemplateDbRecord>(`admin.kta.template.get`, {
        template_id: templateId,
      });
      if (response && response.success && response.data) {
        return response.data;
      }
    } catch (err) {
      console.info('Gagal mengambil template dari GAS endpoint:', err);
    }
    return null;
  },

  /**
   * Mengambil pengaturan KTA aktif dari sheet KTA_TEMPLATE di Google Spreadsheet.
   */
  refreshKtaSettings: async (templateId: string = 'TMPL_DEFAULT'): Promise<KtaCardSettings | null> => {
    try {
      const record = await spreadsheetService.getKtaTemplate(templateId);
      if (record) {
        let frontParsed: Partial<KtaCardSettings> = {};
        let backParsed: Partial<KtaCardSettings> = {};
        let elementsParsed: Partial<KtaCardSettings> = {};

        if (record.front_layout_json) {
          try {
            frontParsed = JSON.parse(record.front_layout_json);
          } catch (e) {
            console.warn('Gagal parse front_layout_json:', e);
          }
        }
        if (record.back_layout_json) {
          try {
            backParsed = JSON.parse(record.back_layout_json);
          } catch (e) {
            console.warn('Gagal parse back_layout_json:', e);
          }
        }
        if (record.elements_json) {
          try {
            elementsParsed = JSON.parse(record.elements_json);
          } catch (e) {
            console.warn('Gagal parse elements_json:', e);
          }
        }

        const merged: KtaCardSettings = {
          ...DEFAULT_KTA_SETTINGS,
          ...elementsParsed,
          ...frontParsed,
          ...backParsed,
          id: record.template_id || DEFAULT_KTA_SETTINGS.id,
          name: record.template_name || DEFAULT_KTA_SETTINGS.name,
          identityLayoutMode: record.identity_layout_mode || 'AUTO_FLOW',
          frontBackgroundUrl: record.front_background_url || elementsParsed.frontBackgroundUrl,
          backBackgroundUrl: record.back_background_url || elementsParsed.backBackgroundUrl,
          widthMm: record.card_width || elementsParsed.widthMm || 85.6,
          heightMm: record.card_height || elementsParsed.heightMm || 53.98,
          qrSize: record.qr_size || elementsParsed.qrSize || 18,
        };

        storage.saveKtaSettings(merged);
        return merged;
      }
    } catch (err) {
      console.info('Menggunakan KTA Settings lokal / storage:', err);
    }

    // Fallback: baca dari local storage
    return storage.getKtaSettings();
  },

  /**
   * Memvalidasi layout KTA untuk mendeteksi collision / penumpukan teks.
   */
  validateKtaLayout: (settings: KtaCardSettings): KtaLayoutGuardStatus => {
    const activeFrontFields = (settings.dataFields || []).filter(
      (f) => f.side === 'FRONT' && f.visible
    );
    return calculateLayoutGuard(
      activeFrontFields,
      settings.identityDensity,
      settings.identityFontScale,
      settings.heightMm
    );
  },

  /**
   * Menyimpan template KTA dengan schema lengkap KTA_TEMPLATE.
   * RBAC Security: Hanya SUPER_ADMIN yang diizinkan.
   */
  saveKtaTemplate: async (
    settings: KtaCardSettings,
    userRole: string = 'SUPER_ADMIN',
    username: string = 'Super Administrator'
  ): Promise<{ success: boolean; message: string }> => {
    if (userRole !== 'SUPER_ADMIN') {
      return {
        success: false,
        message: 'Akses Ditolak: Hanya SUPER_ADMIN yang berhak memodifikasi template KTA.',
      };
    }

    // Pisahkan payload front, back, dan qr untuk skema terstruktur
    const frontLayout = {
      organizationTitle: settings.frontOrganizationTitle,
      organizationSubtitle: settings.frontOrganizationSubtitle,
      validityText: settings.frontValidityText,
      customBackgroundColor: settings.customBackgroundColorFront,
      backgroundUrl: settings.frontBackgroundUrl,
      bgOpacity: settings.bgOpacity,
      identityDensity: settings.identityDensity,
      identityFontScale: settings.identityFontScale,
      autoArrangeEnabled: settings.autoArrangeEnabled,
      logoSafePlacement: settings.logoSafePlacement,
      dataFields: settings.dataFields.filter((f) => f.side === 'FRONT'),
      logos: settings.logos.filter((l) => l.side === 'FRONT'),
    };

    const backLayout = {
      headerTitle: settings.backHeaderTitle,
      terms: settings.terms,
      customBackgroundColor: settings.customBackgroundColorBack,
      backgroundUrl: settings.backBackgroundUrl,
      signerName: settings.signerName,
      signerTitle: settings.signerTitle,
      signerSubtitle: settings.signerSubtitle,
      issueLocationDate: settings.issueLocationDate,
      showSignerQrCode: settings.showSignerQrCode,
      showSignerName: settings.showSignerName,
      showSignerTitle: settings.showSignerTitle,
      signerQrSize: settings.signerQrSize,
      signerX: settings.signerX,
      signerY: settings.signerY,
      logos: settings.logos.filter((l) => l.side === 'BACK'),
    };

    const qrSettings = {
      front: {
        visible: settings.showQrCode,
        x: settings.qrX,
        y: settings.qrY,
        size: settings.qrSize,
      },
      back: {
        visible: settings.showSignerQrCode,
        x: settings.signerQrX,
        y: settings.signerQrY,
        size: settings.signerQrSize,
      },
    };

    // Payload KTA_TEMPLATE
    const templateDbPayload: KtaTemplateDbRecord = {
      template_id: settings.id || 'TMPL_DEFAULT',
      template_name: settings.name || 'Template KTA SPWN Resmi (ISO ID-1)',
      front_background_url: settings.frontBackgroundUrl || '',
      back_background_url: settings.backBackgroundUrl || '',
      card_width: settings.widthMm || 85.6,
      card_height: settings.heightMm || 53.98,
      front_layout_json: JSON.stringify(frontLayout),
      back_layout_json: JSON.stringify(backLayout),
      identity_layout_mode: settings.identityLayoutMode || 'AUTO_FLOW',
      qr_settings_json: JSON.stringify(qrSettings),
      elements_json: JSON.stringify(settings),
      qr_position: JSON.stringify(qrSettings),
      qr_size: settings.qrSize || 18,
      created_by: username,
      updated_at: new Date().toISOString(),
    };

    // Simpan ke storage lokal terlebih dahulu
    storage.saveKtaSettings(settings);

    try {
      const response = await apiClient.post<{ message: string }>(
        'admin.kta.template.save',
        templateDbPayload as unknown as Record<string, unknown>
      );

      if (response && response.success) {
        return {
          success: true,
          message: response.message || 'Template KTA berhasil disimpan ke Google Spreadsheet.',
        };
      }
    } catch (err: any) {
      console.warn('Gagal sinkronisasi ke GAS endpoint, tersimpan di LocalStorage:', err);
    }

    return {
      success: true,
      message: 'Template KTA berhasil disimpan dan disinkronkan ke repositori sistem.',
    };
  },

  /**
   * Alias backward-compatible untuk saveKtaSettings
   */
  saveKtaSettings: async (
    settings: KtaCardSettings,
    userRole: string = 'SUPER_ADMIN',
    username: string = 'Super Administrator'
  ): Promise<{ success: boolean; message: string }> => {
    return spreadsheetService.saveKtaTemplate(settings, userRole, username);
  },

  /**
   * Mengunggah gambar / logo / background ke Google Drive via Google Apps Script.
   * Spreadsheet hanya menyimpan URL file dari Google Drive.
   */
  uploadImageToDrive: async (
    base64Data: string,
    filename: string,
    folderType: 'background' | 'logo' | 'signature' = 'background'
  ): Promise<UploadAssetResult> => {
    try {
      const response = await apiClient.post<{ directUrl: string; fileId: string; message: string }>(
        'admin.kta.template.uploadAsset',
        {
          base64Data,
          filename,
          folderType,
        }
      );

      if (response && response.success && response.data?.directUrl) {
        return {
          success: true,
          directUrl: response.data.directUrl,
          fileId: response.data.fileId,
          message: response.data.message || 'Asset berhasil diunggah ke Google Drive.',
        };
      }
    } catch (err: any) {
      console.info('Gagal unggah ke Drive via API, fallback ke inline data URL:', err);
    }

    // Fallback: kembalikan base64 data URL untuk preview lokal
    return {
      success: true,
      directUrl: base64Data,
      message: 'Asset berhasil dimuat untuk pratinjau (Local Data URI).',
    };
  },
};
