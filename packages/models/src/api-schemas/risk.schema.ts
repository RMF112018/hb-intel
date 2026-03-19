import { z } from 'zod';
import type { IRiskCostItem, IRiskCostManagement } from '../risk/index.js';

export const RiskCostItemSchema = z.object({
  id: z.number(),
  projectId: z.string(),
  description: z.string(),
  category: z.string(),
  estimatedImpact: z.number(),
  probability: z.number(),
  status: z.string(),
});

export const RiskCostManagementSchema = z.object({
  projectId: z.string(),
  totalExposure: z.number(),
  mitigatedAmount: z.number(),
  contingencyBudget: z.number(),
  items: z.array(RiskCostItemSchema),
});

type RiskItem = z.infer<typeof RiskCostItemSchema>;
type _ItemCheck = IRiskCostItem extends RiskItem ? (RiskItem extends IRiskCostItem ? true : never) : never;

type RiskManagement = z.infer<typeof RiskCostManagementSchema>;
type _MgmtCheck = IRiskCostManagement extends RiskManagement ? (RiskManagement extends IRiskCostManagement ? true : never) : never;
