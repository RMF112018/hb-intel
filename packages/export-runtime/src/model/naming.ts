/**
 * SF24-T03 — Deterministic artifact file naming.
 *
 * Primitive-owned naming convention ensures consistent, traceable
 * artifact identification across all module exports.
 *
 * Governing: SF24-T03, L-01 (primitive ownership)
 */

import type { IExportRequest } from '../types/index.js';

/** File extension mapping by format. Print renders to PDF. */
const FORMAT_EXTENSIONS: Record<string, string> = {
  csv: 'csv',
  xlsx: 'xlsx',
  pdf: 'pdf',
  print: 'pdf',
};

/**
 * Sanitize a string for use in file names.
 * Keeps alphanumeric characters and hyphens; replaces others with hyphens.
 * Collapses consecutive hyphens and trims leading/trailing hyphens.
 */
function sanitize(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * Format an ISO timestamp into a compact file-name-safe string.
 * Pattern: YYYYMMDD_HHmmss
 */
function formatTimestamp(isoString: string): string {
  const d = new Date(isoString);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
}

/**
 * Generate a deterministic file name for an export artifact.
 *
 * Pattern: `{moduleKey}_{recordId}_{intent}_{YYYYMMDD_HHmmss}.{ext}`
 *
 * @param request - Export request with context and format.
 * @returns Deterministic file name string.
 */
export function generateExportFileName(request: IExportRequest): string {
  const moduleKey = sanitize(request.context.moduleKey);
  const recordId = sanitize(request.context.recordId);
  const intent = sanitize(request.intent);
  const timestamp = formatTimestamp(request.context.snapshotTimestampIso);
  const ext = FORMAT_EXTENSIONS[request.format] ?? 'bin';

  return `${moduleKey}_${recordId}_${intent}_${timestamp}.${ext}`;
}
