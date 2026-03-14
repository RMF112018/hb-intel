/**
 * W0-G2-T08: Validation types for provisioning correctness checks.
 * Pure data types consumed by list, department, and template validators.
 */

export interface IValidationResult {
  rule: string;
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface IAssetReport {
  present: string[];
  missing: string[];
  total: number;
  missingCount: number;
}
