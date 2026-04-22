/**
 * Duplicate-detection key for inspection uploads.
 *
 * `(ProjectNumber, InspectionDate, InspectionNumber, WorkbookChecksum)` →
 * high-confidence duplicate when all four match; near-duplicate when first
 * three match but checksum differs.
 */

export interface DuplicateKeyInput {
  readonly projectNumber: string;
  readonly inspectionDate: string;
  readonly inspectionNumber: string;
  readonly checksum: string;
}

export function computeDuplicateKey(input: DuplicateKeyInput): string {
  return [
    input.projectNumber.trim().toUpperCase(),
    input.inspectionDate.trim(),
    input.inspectionNumber.trim().toLowerCase(),
    input.checksum.trim().toLowerCase(),
  ].join('|');
}

export function computeBusinessKey(
  input: Omit<DuplicateKeyInput, 'checksum'>,
): string {
  return [
    input.projectNumber.trim().toUpperCase(),
    input.inspectionDate.trim(),
    input.inspectionNumber.trim().toLowerCase(),
  ].join('|');
}
