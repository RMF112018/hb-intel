/**
 * @hbc/ai-assist — AiAuditWriter (D-SF15-T01 scaffold)
 *
 * Writes IAiAuditRecord through the versioned-record path.
 * Full implementation in SF15-T03.
 */

import type { IAiAuditRecord } from '../types/index.js';

/** Audit writer for persisting AI action invocation records. */
export const AiAuditWriter = {
  write: (_record: IAiAuditRecord): void => {
    // Stub — full implementation in SF15-T03
  },
} as const;
