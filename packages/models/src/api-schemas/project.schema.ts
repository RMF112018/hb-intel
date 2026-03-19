import { z } from 'zod';
import type { IActiveProject, IPortfolioSummary } from '../project/index.js';

// ─── Project Entity Schemas ──────────────────────────────────────────────────

export const ActiveProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  number: z.string(),
  status: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

export const PortfolioSummarySchema = z.object({
  totalProjects: z.number(),
  activeProjects: z.number(),
  totalContractValue: z.number(),
  averagePercentComplete: z.number(),
});

// ─── Type Conformance ────────────────────────────────────────────────────────

type ActiveProject = z.infer<typeof ActiveProjectSchema>;
type _ProjectCheck = IActiveProject extends ActiveProject ? (ActiveProject extends IActiveProject ? true : never) : never;

type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;
type _SummaryCheck = IPortfolioSummary extends PortfolioSummary ? (PortfolioSummary extends IPortfolioSummary ? true : never) : never;
