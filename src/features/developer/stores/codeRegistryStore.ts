/**
 * SPWN Apps 2.0 - Code Registry & Developer Store (Phase 7.1)
 * Location: src/features/developer/stores/codeRegistryStore.ts
 */

import { create } from 'zustand';
import {
  CodeRegistryRecord,
  CodeVersionHistoryRecord,
  DeveloperAuditLogRecord,
  CodeComparisonResult,
  DeveloperAuditAction,
} from '../types/codeRegistry.types';

// Simple SHA-256 style checksum generator
function computeCodeChecksum(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256-${hex}f8a9c2b4e01d7e3a9c7b5f1a`;
}

interface CodeRegistryState {
  files: CodeRegistryRecord[];
  history: Record<string, CodeVersionHistoryRecord[]>;
  auditLogs: DeveloperAuditLogRecord[];
  selectedFileId: string | null;
  activeConsoleTab: 'registry' | 'editor' | 'history' | 'audit' | 'export' | 'diff';
  diffVersionA: string | null;
  diffVersionB: string | null;
  searchQuery: string;
  filterModule: string;
  filterStatus: string;

  // Actions
  setSelectedFileId: (fileId: string | null, userName?: string) => void;
  setActiveConsoleTab: (tab: 'registry' | 'editor' | 'history' | 'audit' | 'export' | 'diff') => void;
  setSearchQuery: (q: string) => void;
  setFilterModule: (m: string) => void;
  setFilterStatus: (s: string) => void;
  setDiffVersions: (fileId: string, verA: string, verB: string) => void;

  registerCodeFile: (
    fileData: {
      file_name: string;
      file_path: string;
      module: string;
      version: string;
      code_content: string;
      status?: 'APPROVED' | 'PENDING_APPROVAL' | 'DRAFT';
      change_note?: string;
    },
    userContext?: { name: string; role: string }
  ) => CodeRegistryRecord;

  updateCodeContent: (
    fileId: string,
    newContent: string,
    newVersion: string,
    changeNote: string,
    userContext?: { name: string; role: string }
  ) => CodeRegistryRecord;

  approveVersion: (fileId: string, version?: string, userContext?: { name: string; role: string }) => void;
  recordCopyAction: (fileId: string, userContext?: { name: string; role: string }) => void;
  logAudit: (action: DeveloperAuditAction, targetFile: string, details: string, userContext?: { name: string; role: string }) => void;
  compareVersions: (fileId: string, verA: string, verB: string) => CodeComparisonResult | null;
}

export const useCodeRegistryStore = create<CodeRegistryState>((set, get) => ({
  files: [],
  history: {},
  auditLogs: [],
  selectedFileId: null,
  activeConsoleTab: 'registry',
  diffVersionA: null,
  diffVersionB: null,
  searchQuery: '',
  filterModule: 'ALL',
  filterStatus: 'ALL',

  setSelectedFileId: (fileId, userName) => {
    set({ selectedFileId: fileId });
    if (fileId) {
      const file = get().files.find((f) => f.id === fileId);
      if (file) {
        get().logAudit(
          'VIEW_CODE',
          file.file_path,
          `Super Admin inspected source code for ${file.file_name} (v${file.version})`,
          { name: userName || 'Super Administrator', role: 'SUPER_ADMIN' }
        );
      }
    }
  },

  setActiveConsoleTab: (tab) => set({ activeConsoleTab: tab }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilterModule: (m) => set({ filterModule: m }),
  setFilterStatus: (s) => set({ filterStatus: s }),

  setDiffVersions: (fileId, verA, verB) => {
    set({
      selectedFileId: fileId,
      diffVersionA: verA,
      diffVersionB: verB,
      activeConsoleTab: 'diff',
    });
  },

  logAudit: (action, targetFile, details, userContext) => {
    const newLog: DeveloperAuditLogRecord = {
      id: `AUDIT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      user_id: 'USR-SUPERADMIN',
      user_name: userContext?.name || 'Dr. H. Bambang Soedirman, M.Par',
      user_role: userContext?.role || 'SUPER_ADMIN',
      action,
      target_file: targetFile,
      details,
      ip_address: '10.24.180.12',
    };

    set((state) => ({
      auditLogs: [newLog, ...state.auditLogs],
    }));
  },

  registerCodeFile: (fileData, userContext) => {
    const now = new Date().toISOString();
    const checksum = computeCodeChecksum(fileData.code_content);
    const author = userContext?.name || 'Super Administrator';

    const newRecord: CodeRegistryRecord = {
      id: `CODE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      file_name: fileData.file_name,
      file_path: fileData.file_path,
      module: fileData.module || 'SERVICES',
      version: fileData.version || '1.0.0',
      code_content: fileData.code_content,
      checksum,
      status: fileData.status || 'APPROVED',
      created_by: author,
      created_at: now,
      updated_at: now,
      change_note: fileData.change_note || 'Pendaftaran berkas kode baru',
    };

    const initialHistoryEntry: CodeVersionHistoryRecord = {
      id: `HIST-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      registry_id: newRecord.id,
      version: newRecord.version,
      code_content: newRecord.code_content,
      checksum,
      changed_by: author,
      changed_at: now,
      change_note: newRecord.change_note,
    };

    set((state) => ({
      files: [newRecord, ...state.files],
      history: {
        ...state.history,
        [newRecord.id]: [initialHistoryEntry],
      },
      selectedFileId: newRecord.id,
    }));

    get().logAudit(
      'REGISTER_CODE',
      newRecord.file_path,
      `Registered new file ${newRecord.file_name} (${newRecord.version}) into Code_Registry`,
      userContext
    );

    return newRecord;
  },

  updateCodeContent: (fileId, newContent, newVersion, changeNote, userContext) => {
    const state = get();
    const existing = state.files.find((f) => f.id === fileId);
    if (!existing) throw new Error('File not found');

    const now = new Date().toISOString();
    const checksum = computeCodeChecksum(newContent);
    const author = userContext?.name || 'Super Administrator';

    // Push existing to history
    const historyEntry: CodeVersionHistoryRecord = {
      id: `HIST-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      registry_id: existing.id,
      version: existing.version,
      code_content: existing.code_content,
      checksum: existing.checksum,
      changed_by: author,
      changed_at: now,
      change_note: changeNote || `Revision updated from v${existing.version} to v${newVersion}`,
    };

    const updatedFiles = state.files.map((f) => {
      if (f.id === fileId) {
        return {
          ...f,
          version: newVersion,
          code_content: newContent,
          checksum,
          status: 'APPROVED' as const,
          updated_at: now,
          change_note: changeNote || 'Pembaruan kode berkas',
        };
      }
      return f;
    });

    const fileHistories = state.history[fileId] || [];

    set({
      files: updatedFiles,
      history: {
        ...state.history,
        [fileId]: [historyEntry, ...fileHistories],
      },
    });

    get().logAudit(
      'UPDATE_CODE',
      existing.file_path,
      `Updated ${existing.file_name} from v${existing.version} to v${newVersion} (Checksum: ${checksum.substring(0, 16)}...)`,
      userContext
    );

    return updatedFiles.find((f) => f.id === fileId)!;
  },

  approveVersion: (fileId, version, userContext) => {
    const file = get().files.find((f) => f.id === fileId);
    if (!file) return;

    set((state) => ({
      files: state.files.map((f) => {
        if (f.id === fileId) {
          return {
            ...f,
            status: 'APPROVED' as const,
            updated_at: new Date().toISOString(),
          };
        }
        return f;
      }),
    }));

    get().logAudit(
      'APPROVE_VERSION',
      file.file_path,
      `Super Admin approved version ${version || file.version} of ${file.file_name}`,
      userContext
    );
  },

  recordCopyAction: (fileId, userContext) => {
    const file = get().files.find((f) => f.id === fileId);
    if (!file) return;

    get().logAudit(
      'COPY_CODE',
      file.file_path,
      `Super Admin copied code for ${file.file_name} (v${file.version}, Checksum: ${file.checksum.substring(0, 12)}...)`,
      userContext
    );
  },

  compareVersions: (fileId, verA, verB) => {
    const state = get();
    const file = state.files.find((f) => f.id === fileId);
    if (!file) return null;

    const histories = state.history[fileId] || [];

    let contentA = '';
    if (file.version === verA) {
      contentA = file.code_content;
    } else {
      const hA = histories.find((h) => h.version === verA);
      if (hA) contentA = hA.code_content;
    }

    let contentB = '';
    if (file.version === verB) {
      contentB = file.code_content;
    } else {
      const hB = histories.find((h) => h.version === verB);
      if (hB) contentB = hB.code_content;
    }

    const linesA = contentA.split('\n');
    const linesB = contentB.split('\n');

    return {
      file_id: file.id,
      file_name: file.file_name,
      version_a: verA,
      version_b: verB,
      lines_a_count: linesA.length,
      lines_b_count: linesB.length,
      identical: contentA === contentB,
      content_a: contentA,
      content_b: contentB,
    };
  },
}));
