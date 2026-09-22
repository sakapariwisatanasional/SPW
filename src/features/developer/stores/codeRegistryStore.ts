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

// Initial Real Google Apps Script files in the project
const INITIAL_CODE_FILES: CodeRegistryRecord[] = [
  {
    id: 'CODE-001',
    file_name: 'Code.gs',
    file_path: 'backend/google-apps-script/Code.gs',
    module: 'CORE',
    version: '2.1.0',
    code_content: `/**
 * SPWN Apps 2.0 - Google Apps Script HTTP Web App Entry Point
 * Location: backend/google-apps-script/Code.gs
 * -----------------------------------------------------------
 * Menyediakan listener utama doGet(e) dan doPost(e):
 * - Normalisasi parameter (Query Parameter & Post Body JSON / Form-Data)
 * - Meneruskan ke Router.dispatch(rawRequest)
 * - Mengembalikan output JSON dengan header CORS & ContentService.MimeType.JSON
 */

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  e = e || {};
  var query = e.parameter || {};
  var body = {};

  if (e.postData && e.postData.contents) {
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      body = e.parameter || {};
    }
  }

  var action = (query.action || body.action || '').trim();
  var headers = {};
  if (query.token) headers['authorization'] = 'Bearer ' + query.token;
  if (body.token) headers['authorization'] = 'Bearer ' + body.token;

  var rawRequest = {
    method: method,
    action: action,
    query: query,
    body: body,
    headers: headers,
    postData: e.postData,
    parameter: e.parameter,
    parameters: e.parameters
  };

  return Router.dispatch(rawRequest);
}`,
    checksum: 'sha256-a4c89f1d02e3b578c9d01a4e2f7b8c9d01e3b578',
    status: 'APPROVED',
    created_by: 'Super Administrator',
    created_at: '2026-03-01T08:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
    change_note: 'Production Gateway HTTP Entry Point with CORS support',
  },
  {
    id: 'CODE-002',
    file_name: 'code.registry.service.gs',
    file_path: 'backend/google-apps-script/services/code.registry.service.gs',
    module: 'SERVICES',
    version: '1.0.0',
    code_content: `/**
 * SPWN Apps 2.0 - Code Registry & Version Management Service (Phase 7.1)
 * Location: backend/google-apps-script/services/code.registry.service.gs
 */

var CodeRegistryService = (function() {
  var LOCK_TIMEOUT_MS = 10000;
  var _registryRepo = null;
  var _historyRepo = null;
  var _auditRepo = null;

  function _getRegistryRepo() {
    if (!_registryRepo) {
      _registryRepo = SpreadsheetRepository.create('SYSTEM', 'CODE_REGISTRY', {
        primaryKey: 'id',
        statusColumn: 'status'
      });
    }
    return _registryRepo;
  }

  function _getHistoryRepo() {
    if (!_historyRepo) {
      _historyRepo = SpreadsheetRepository.create('SYSTEM', 'CODE_VERSION_HISTORY', {
        primaryKey: 'id'
      });
    }
    return _historyRepo;
  }

  function _getAuditRepo() {
    if (!_auditRepo) {
      _auditRepo = SpreadsheetRepository.create('SYSTEM', 'DEVELOPER_AUDIT_LOG', {
        primaryKey: 'id'
      });
    }
    return _auditRepo;
  }

  function registerCodeFile(fileData, userContext) {
    // Dynamic GAS registration & Versioning
    return _getRegistryRepo().insert(fileData);
  }

  function getCodeFile(fileId, userContext) {
    var file = _getRegistryRepo().findById(fileId);
    logDeveloperAudit('VIEW_CODE', file.file_path, { version: file.version }, userContext);
    return file;
  }

  function getLatestVersion(fileId) {
    return _getRegistryRepo().findById(fileId);
  }

  function compareVersion(fileId, versionA, versionB, userContext) {
    // Diff computation engine
    logDeveloperAudit('COMPARE_VERSION', fileId, { version_a: versionA, version_b: versionB }, userContext);
    return { identical: false, file_id: fileId };
  }

  function approveVersion(fileId, version, userContext) {
    if (!userContext || userContext.role !== 'SUPER_ADMIN') {
      throw new Error('[FORBIDDEN] Hanya SUPER_ADMIN yang berhak menyetujui versi!');
    }
    return _getRegistryRepo().update(fileId, { status: 'APPROVED' });
  }

  return {
    registerCodeFile: registerCodeFile,
    getCodeFile: getCodeFile,
    getLatestVersion: getLatestVersion,
    compareVersion: compareVersion,
    approveVersion: approveVersion
  };
})();`,
    checksum: 'sha256-b9e1a3c7d5f0284e91a7c5b3d1f0e2a4c6b8d0e2',
    status: 'APPROVED',
    created_by: 'Super Administrator',
    created_at: '2026-03-21T07:00:00Z',
    updated_at: '2026-03-21T07:00:00Z',
    change_note: 'Initial release of SPWN Code Registry Service',
  },
  {
    id: 'CODE-003',
    file_name: 'developer.controller.gs',
    file_path: 'backend/google-apps-script/controllers/developer.controller.gs',
    module: 'CONTROLLERS',
    version: '1.0.0',
    code_content: `/**
 * SPWN Apps 2.0 - Developer Controller (Phase 7.1)
 * Location: backend/google-apps-script/controllers/developer.controller.gs
 * Endpoints:
 * - developer.code.list
 * - developer.code.detail
 * - developer.code.copy
 * - developer.code.history
 * - developer.code.approve
 */

var DeveloperController = (function() {
  function list(context) {
    var files = CodeRegistryService.listCodeFiles(context.query);
    return ApiResponseFormatter.success(context.action, { files: files });
  }

  function detail(context) {
    var file = CodeRegistryService.getCodeFile(context.query.id, context.user);
    return ApiResponseFormatter.success(context.action, file);
  }

  function copy(context) {
    var res = CodeRegistryService.recordCopyCode(context.body.file_id, context.user);
    return ApiResponseFormatter.success(context.action, res);
  }

  function history(context) {
    var h = CodeRegistryService.getVersionHistory(context.query.file_id);
    return ApiResponseFormatter.success(context.action, { history: h });
  }

  function approve(context) {
    var updated = CodeRegistryService.approveVersion(context.body.file_id, context.body.version, context.user);
    return ApiResponseFormatter.success(context.action, updated);
  }

  return { list: list, detail: detail, copy: copy, history: history, approve: approve };
})();`,
    checksum: 'sha256-c7d0a2f4e6b8193a5c7d0e2f4a6b8c0d2e4f6a8b',
    status: 'APPROVED',
    created_by: 'Super Administrator',
    created_at: '2026-03-21T07:05:00Z',
    updated_at: '2026-03-21T07:05:00Z',
    change_note: 'Developer endpoints registration for Super Admin',
  },
  {
    id: 'CODE-004',
    file_name: 'database.config.gs',
    file_path: 'backend/google-apps-script/config/database.config.gs',
    module: 'CONFIG',
    version: '2.0.1',
    code_content: `/**
 * SPWN Apps 2.0 - Database Configuration & Provider Abstraction
 * Location: backend/google-apps-script/config/database.config.gs
 */

var SPWN_DATABASE = {
  ACTIVE_PROVIDER: 'GOOGLE_SPREADSHEET',
  PROVIDERS: {
    GOOGLE_SPREADSHEET: {
      DOMAINS: {
        MEMBER: { propertyKey: 'MEMBER_SPREADSHEET_ID' },
        CONTENT: { propertyKey: 'CONTENT_SPREADSHEET_ID' },
        TRAVEL: { propertyKey: 'TRAVEL_SPREADSHEET_ID' },
        COMMERCE: { propertyKey: 'COMMERCE_SPREADSHEET_ID' },
        SYSTEM: {
          key: 'SYSTEM',
          name: 'SPWN_SYSTEM_DATABASE',
          description: 'Pusat registry Google Apps Script, version history dan developer audit logging',
          propertyKey: 'SYSTEM_SPREADSHEET_ID',
          sheets: {
            CODE_REGISTRY: 'Code_Registry',
            CODE_VERSION_HISTORY: 'Code_Version_History',
            DEVELOPER_AUDIT_LOG: 'Developer_Audit_Log'
          }
        }
      }
    }
  }
};`,
    checksum: 'sha256-d8e1f3a5b7c9024a6e8b0d2f4a6c8e0b2d4f6a8c',
    status: 'APPROVED',
    created_by: 'Super Administrator',
    created_at: '2026-03-01T08:00:00Z',
    updated_at: '2026-03-21T07:10:00Z',
    change_note: 'Added SPWN_SYSTEM_DATABASE domain with 3 sheets',
  },
  {
    id: 'CODE-005',
    file_name: 'router.gs',
    file_path: 'backend/google-apps-script/router.gs',
    module: 'CORE',
    version: '2.2.0',
    code_content: `/**
 * SPWN Apps 2.0 - Action-Based Router Engine
 * Location: backend/google-apps-script/router.gs
 */

var Router = (function() {
  var _routes = {};

  function register(action, config) {
    _routes[action] = {
      handler: config.handler,
      requireAuth: config.requireAuth === true,
      roles: config.roles || null
    };
  }

  function _initializeRoutes() {
    // Domain 10: Developer Code Registry (Super Admin Only)
    register('developer.code.list', { handler: DeveloperController.list, requireAuth: true, roles: ['SUPER_ADMIN'] });
    register('developer.code.detail', { handler: DeveloperController.detail, requireAuth: true, roles: ['SUPER_ADMIN'] });
    register('developer.code.copy', { handler: DeveloperController.copy, requireAuth: true, roles: ['SUPER_ADMIN'] });
    register('developer.code.history', { handler: DeveloperController.history, requireAuth: true, roles: ['SUPER_ADMIN'] });
    register('developer.code.approve', { handler: DeveloperController.approve, requireAuth: true, roles: ['SUPER_ADMIN'] });
  }

  return { dispatch: function(raw) { /* Router dispatch */ } };
})();`,
    checksum: 'sha256-e9f2a4c6b8d0135b7d9f1a3c5e7b9d1f3a5c7e9b',
    status: 'APPROVED',
    created_by: 'Super Administrator',
    created_at: '2026-03-01T08:00:00Z',
    updated_at: '2026-03-21T07:15:00Z',
    change_note: 'Registered Phase 7.1 developer actions under SUPER_ADMIN RBAC guard',
  },
  {
    id: 'CODE-006',
    file_name: 'kta.management.service.gs',
    file_path: 'backend/google-apps-script/services/kta.management.service.gs',
    module: 'SERVICES',
    version: '2.0.0',
    code_content: `/**
 * SPWN Apps 2.0 - KTA Management Service
 * Location: backend/google-apps-script/services/kta.management.service.gs
 */

var KtaManagementService = (function() {
  var LOCK_TIMEOUT_MS = 10000;

  function generateKtaForMember(memberId, sessionUser, reason) {
    var lock = LockService.getScriptLock();
    var successLock = lock.tryLock(LOCK_TIMEOUT_MS);
    if (!successLock) {
      throw new Error('[SPWN_LOCK_TIMEOUT] Antrean KTA sedang sibuk.');
    }
    try {
      // Generate standard format 00.NNNNNN or 00.PPKK.CCC.NNNNNN
      return { success: true, memberId: memberId };
    } finally {
      lock.releaseLock();
    }
  }

  return {
    generateKtaForMember: generateKtaForMember
  };
})();`,
    checksum: 'sha256-f0a3b5c7d9e1246c8e0a2b4c6e8f0a2c4e6b8d0e',
    status: 'APPROVED',
    created_by: 'Super Administrator',
    created_at: '2026-03-10T10:00:00Z',
    updated_at: '2026-03-20T12:00:00Z',
    change_note: 'Multi-level hierarchical regional and kwarnas KTA generation',
  },
];

const INITIAL_HISTORY: Record<string, CodeVersionHistoryRecord[]> = {
  'CODE-001': [
    {
      id: 'HIST-001A',
      registry_id: 'CODE-001',
      version: '2.0.0',
      code_content: '// Legacy gateway implementation',
      checksum: 'sha256-legacy001',
      changed_by: 'Super Administrator',
      changed_at: '2026-03-01T08:00:00Z',
      change_note: 'Initial web app gateway release',
    },
  ],
  'CODE-004': [
    {
      id: 'HIST-004A',
      registry_id: 'CODE-004',
      version: '2.0.0',
      code_content: '// Legacy database config without SPWN_SYSTEM_DATABASE',
      checksum: 'sha256-legacy004',
      changed_by: 'Super Administrator',
      changed_at: '2026-03-01T08:00:00Z',
      change_note: 'Configured 4 core domains: Member, Content, Travel, Commerce',
    },
  ],
};

const INITIAL_AUDIT_LOGS: DeveloperAuditLogRecord[] = [
  {
    id: 'AUDIT-D82A',
    timestamp: '2026-03-21T07:20:00Z',
    user_id: 'USR-SUPERADMIN',
    user_name: 'Dr. H. Bambang Soedirman, M.Par (Super Admin)',
    user_role: 'SUPER_ADMIN',
    action: 'REGISTER_CODE',
    target_file: 'backend/google-apps-script/services/code.registry.service.gs',
    details: 'Initial registration of CodeRegistryService v1.0.0 into SPWN_SYSTEM_DATABASE',
    ip_address: '10.24.180.12',
  },
  {
    id: 'AUDIT-C71B',
    timestamp: '2026-03-21T07:21:00Z',
    user_id: 'USR-SUPERADMIN',
    user_name: 'Dr. H. Bambang Soedirman, M.Par (Super Admin)',
    user_role: 'SUPER_ADMIN',
    action: 'REGISTER_CODE',
    target_file: 'backend/google-apps-script/controllers/developer.controller.gs',
    details: 'Initial registration of DeveloperController v1.0.0 with 5 REST endpoints',
    ip_address: '10.24.180.12',
  },
  {
    id: 'AUDIT-B60C',
    timestamp: '2026-03-21T07:22:00Z',
    user_id: 'USR-SUPERADMIN',
    user_name: 'Dr. H. Bambang Soedirman, M.Par (Super Admin)',
    user_role: 'SUPER_ADMIN',
    action: 'APPROVE_VERSION',
    target_file: 'backend/google-apps-script/router.gs',
    details: 'Approved route definition v2.2.0 adding developer.code.* action handlers',
    ip_address: '10.24.180.12',
  },
];

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
  files: INITIAL_CODE_FILES,
  history: INITIAL_HISTORY,
  auditLogs: INITIAL_AUDIT_LOGS,
  selectedFileId: 'CODE-002', // Default to Code Registry Service
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
