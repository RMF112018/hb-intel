/**
 * P3-E4-T02 cost-code dictionary reference utilities.
 */

import { normalizeCostCode } from '../validation/index.js';

export const FINANCIAL_REFERENCE_SCOPE = 'financial/reference';

/**
 * Parse a cost-code dictionary CSV string into a normalized Set of cost codes.
 * Auto-detects format:
 * - 3 columns (stage,csi_code,csi_code_description): extract column 1, already hyphenated
 * - 2 columns (csi_code,csi_code_description): extract column 0, normalize spaces→hyphens
 */
export const parseCostCodeDictionary = (csvContent: string): Set<string> => {
  const codes = new Set<string>();
  const lines = csvContent.split(/\r?\n/);

  if (lines.length === 0) return codes;

  // Detect format from header
  const header = lines[0];
  const headerColumns = header.split(',').length;
  const codeColumnIndex = headerColumns >= 3 ? 1 : 0;

  // Process data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') continue;

    const columns = line.split(',');
    const rawCode = columns[codeColumnIndex]?.trim();
    if (rawCode) {
      codes.add(normalizeCostCode(rawCode));
    }
  }

  return codes;
};
