import { z } from 'zod';
import { LeadStage } from '../leads/index.js';
import type { ILead, ILeadFormData } from '../leads/index.js';

// ─── Lead Entity Schema ─────────────────────────────────────────────────────

export const LeadSchema = z.object({
  id: z.number(),
  title: z.string(),
  stage: z.nativeEnum(LeadStage),
  clientName: z.string(),
  estimatedValue: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const LeadFormDataSchema = z.object({
  title: z.string(),
  stage: z.nativeEnum(LeadStage),
  clientName: z.string(),
  estimatedValue: z.number(),
});

// ─── Type Conformance (compile-time drift detection) ─────────────────────────

type Lead = z.infer<typeof LeadSchema>;
type _LeadCheck = ILead extends Lead ? (Lead extends ILead ? true : never) : never;

type LeadFormData = z.infer<typeof LeadFormDataSchema>;
type _FormCheck = ILeadFormData extends LeadFormData ? (LeadFormData extends ILeadFormData ? true : never) : never;
