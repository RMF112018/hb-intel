import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  REPAIR_REQUEST_STATES,
  REPAIR_REQUEST_OWNER_PERSONAS,
  type IRepairRequest,
} from './RepairRequests.js';
import type { PccProjectId } from './types.js';

const projectId = 'proj-001' as PccProjectId;

/**
 * Strip line comments, block comments, and string literals (single-quote,
 * double-quote, backtick) from a TypeScript source string. Used by
 * forbidden-substring guards so legitimate guardrail wording in comments
 * does not trip the test.
 */
function stripCommentsAndStrings(source: string): string {
  let out = '';
  let i = 0;
  const len = source.length;
  while (i < len) {
    const ch = source[i];
    const next = source[i + 1];
    if (ch === '/' && next === '/') {
      while (i < len && source[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < len && !(source[i] === '*' && source[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      i++;
      while (i < len && source[i] !== quote) {
        if (source[i] === '\\') i += 2;
        else i++;
      }
      i++;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

describe('PCC repair requests', () => {
  it('REPAIR_REQUEST_STATES matches the locked literal set with no duplicates', () => {
    expect([...REPAIR_REQUEST_STATES]).toEqual([
      'requested',
      'triage',
      'in-progress',
      'completed',
      'rejected',
      'cancelled',
    ]);
    expect(new Set(REPAIR_REQUEST_STATES).size).toBe(REPAIR_REQUEST_STATES.length);
  });

  it('REPAIR_REQUEST_OWNER_PERSONAS restricts ownership to PCC/IT admin', () => {
    expect([...REPAIR_REQUEST_OWNER_PERSONAS]).toEqual(['pcc-admin', 'it-admin']);
  });

  it('IRepairRequest accepts the documented shape', () => {
    const req: IRepairRequest = {
      id: 'rr-1',
      projectId,
      siteHealthCheckId: 'sh-7',
      requestedByUpn: 'pm@example.com',
      requestedByPersona: 'project-manager',
      requestedAtUtc: '2026-04-28T12:00:00Z',
      severity: 'Repair Required',
      summary: 'Permission inheritance broken on 02_Contracts_and_Compliance',
      evidenceSummary: 'M365 audit log entry id 12345',
      ownerPersona: 'it-admin',
      state: 'triage',
    };
    expect(req.id).toBe('rr-1');
    expect(REPAIR_REQUEST_OWNER_PERSONAS).toContain(req.ownerPersona);
    expect(REPAIR_REQUEST_STATES).toContain(req.state);
  });

  it('source contains no secret-like or sync/mirror/write-back tokens (after stripping comments + strings)', () => {
    const sourcePath = fileURLToPath(new URL('./RepairRequests.ts', import.meta.url));
    const stripped = stripCommentsAndStrings(readFileSync(sourcePath, 'utf8'));
    const forbidden = [
      /secret/i,
      /token/i,
      /bearer/i,
      /apikey/i,
      /api[-_]key/i,
      /authorization/i,
      /password/i,
      /sync/i,
      /mirror/i,
      /writeBack/i,
      /writeback/i,
      /write-back/i,
    ];
    for (const pattern of forbidden) {
      expect(stripped).not.toMatch(pattern);
    }
  });
});
