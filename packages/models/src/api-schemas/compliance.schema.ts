import { z } from 'zod';
import type { IComplianceEntry, IComplianceSummary } from '../compliance/index.js';

export const ComplianceEntrySchema = z.object({
  id: z.number(),
  projectId: z.string(),
  vendorName: z.string(),
  requirementType: z.string(),
  status: z.string(),
  expirationDate: z.string(),
});

export const ComplianceSummarySchema = z.object({
  projectId: z.string(),
  totalEntries: z.number(),
  compliant: z.number(),
  nonCompliant: z.number(),
  expiringSoon: z.number(),
});

type ComplianceEntry = z.infer<typeof ComplianceEntrySchema>;
type _EntryCheck = IComplianceEntry extends ComplianceEntry ? (ComplianceEntry extends IComplianceEntry ? true : never) : never;

type ComplianceSummary = z.infer<typeof ComplianceSummarySchema>;
type _SummaryCheck = IComplianceSummary extends ComplianceSummary ? (ComplianceSummary extends IComplianceSummary ? true : never) : never;
