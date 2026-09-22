/**
 * SPWN Apps 2.0 - Code Registry & Developer Types (Phase 7.1)
 * Location: src/features/developer/types/codeRegistry.types.ts
 */

export type CodeRegistryStatus = 'APPROVED' | 'PENDING_APPROVAL' | 'DRAFT';

export type CodeModuleType =
  | 'CORE'
  | 'SERVICES'
  | 'CONTROLLERS'
  | 'CONFIG'
  | 'REPOSITORIES'
  | 'MIDDLEWARE'
  | 'TESTS';

export interface CodeRegistryRecord {
  id: string;
  file_name: string;
  file_path: string;
  module: CodeModuleType | string;
  version: string;
  code_content: string;
  checksum: string;
  status: CodeRegistryStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  change_note: string;
}

export interface CodeVersionHistoryRecord {
  id: string;
  registry_id: string;
  version: string;
  code_content: string;
  checksum: string;
  changed_by: string;
  changed_at: string;
  change_note: string;
}

export type DeveloperAuditAction =
  | 'VIEW_CODE'
  | 'COPY_CODE'
  | 'APPROVE_VERSION'
  | 'REGISTER_CODE'
  | 'UPDATE_CODE'
  | 'COMPARE_VERSION'
  | 'EXPORT_BUNDLE';

export interface DeveloperAuditLogRecord {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: DeveloperAuditAction;
  target_file: string;
  details: string;
  ip_address: string;
}

export interface CodeComparisonResult {
  file_id: string;
  file_name: string;
  version_a: string;
  version_b: string;
  lines_a_count: number;
  lines_b_count: number;
  identical: boolean;
  content_a: string;
  content_b: string;
}
