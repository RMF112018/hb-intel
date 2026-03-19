import { z } from 'zod';
import type { IProjectManagementPlan, IPMPSignature } from '../pmp/index.js';

export const ProjectManagementPlanSchema = z.object({
  id: z.number(),
  projectId: z.string(),
  version: z.number(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PMPSignatureSchema = z.object({
  id: z.number(),
  pmpId: z.number(),
  signerName: z.string(),
  role: z.string(),
  signedAt: z.string(),
  status: z.string(),
});

type PMP = z.infer<typeof ProjectManagementPlanSchema>;
type _PMPCheck = IProjectManagementPlan extends PMP ? (PMP extends IProjectManagementPlan ? true : never) : never;

type Signature = z.infer<typeof PMPSignatureSchema>;
type _SigCheck = IPMPSignature extends Signature ? (Signature extends IPMPSignature ? true : never) : never;
