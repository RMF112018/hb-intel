/**
 * @hbc/ai-assist — AiAuditWriter (SF15-T03)
 *
 * Writes IAiAuditRecord through the governance audit trail.
 */

import type { IAiAuditRecord } from '../types/index.js';
import { AiGovernanceApi } from './AiGovernanceApi.js';

type AuditWriteCallback = (record: IAiAuditRecord) => void;

let onWriteCallback: AuditWriteCallback | undefined;

function validateRecord(record: IAiAuditRecord): void {
  if (!record.auditId) {
    throw new Error('[ai-assist] Audit validation failed: auditId must be non-empty');
  }
  if (!record.actionKey) {
    throw new Error('[ai-assist] Audit validation failed: actionKey must be non-empty');
  }
  if (!record.recordType) {
    throw new Error('[ai-assist] Audit validation failed: recordType must be non-empty');
  }
  if (!record.recordId) {
    throw new Error('[ai-assist] Audit validation failed: recordId must be non-empty');
  }
  if (!record.invokedByUserId) {
    throw new Error('[ai-assist] Audit validation failed: invokedByUserId must be non-empty');
  }
  if (!record.invokedAtUtc) {
    throw new Error('[ai-assist] Audit validation failed: invokedAtUtc must be non-empty');
  }
}

function write(record: IAiAuditRecord): void {
  validateRecord(record);
  AiGovernanceApi.recordAudit(record);
  if (onWriteCallback) {
    onWriteCallback(record);
  }
}

function setOnWrite(callback: AuditWriteCallback | undefined): void {
  onWriteCallback = callback;
}

function _clearForTests(): void {
  onWriteCallback = undefined;
}

/** Audit writer for persisting AI action invocation records. */
export const AiAuditWriter = {
  write,
  setOnWrite,
  _clearForTests,
} as const;
