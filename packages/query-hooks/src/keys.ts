/**
 * Centralized query key factory — Blueprint §2g.
 *
 * Every TanStack Query cache entry uses keys produced here so that
 * invalidation is type-safe and consistent across the app.
 *
 * Domain keys use the `createQueryKeys` helper for the standard CRUD
 * set (all, lists, list, details, detail) and extend with domain-specific
 * keys where needed (search, metrics, summary, kickoff, approvals, etc.).
 *
 * BACKWARD COMPATIBILITY:
 * - `queryKeys.leads.all` is a static array `['leads'] as const` (not a function)
 * - All 5 original domains preserve their exact key shapes
 */

import { createQueryKeys } from './utils/index.js';

// ---------------------------------------------------------------------------
// Base key sets (standard CRUD pattern per domain)
// ---------------------------------------------------------------------------
const leadsBase = createQueryKeys('leads');
const scheduleBase = createQueryKeys('schedule');
const buyoutBase = createQueryKeys('buyout');
const scorecardBase = createQueryKeys('scorecard');
const projectBase = createQueryKeys<string>('project');
const estimatingBase = createQueryKeys('estimating');
const complianceBase = createQueryKeys('compliance');
const contractsBase = createQueryKeys('contracts');
const riskBase = createQueryKeys('risk');
const pmpBase = createQueryKeys('pmp');
const authBase = createQueryKeys<string>('auth');

// ---------------------------------------------------------------------------
// Exported key factory — 11 domains with domain-specific extensions
// ---------------------------------------------------------------------------
export const queryKeys = {
  // --- Leads (6 key factories) — preserved from v0.0.1 ---
  leads: {
    ...leadsBase,
    search: (query: string) => [...leadsBase.all, 'search', query] as const,
  },

  // --- Schedule (4 key factories) — preserved from v0.0.1 ---
  schedule: {
    ...scheduleBase,
    activities: (projectId: string) => [...scheduleBase.all, 'activities', projectId] as const,
    activity: (id: number) => [...scheduleBase.all, 'activity', id] as const,
    metrics: (projectId: string) => [...scheduleBase.all, 'metrics', projectId] as const,
  },

  // --- Buyout (4 key factories) — preserved from v0.0.1 ---
  buyout: {
    ...buyoutBase,
    entries: (projectId: string) => [...buyoutBase.all, 'entries', projectId] as const,
    entry: (id: number) => [...buyoutBase.all, 'entry', id] as const,
    summary: (projectId: string) => [...buyoutBase.all, 'summary', projectId] as const,
  },

  // --- Scorecard (4 key factories) — preserved from v0.0.1 ---
  scorecard: {
    ...scorecardBase,
    scorecards: (projectId: string) => [...scorecardBase.all, 'list', projectId] as const,
    versions: (scorecardId: number) => [...scorecardBase.all, 'versions', scorecardId] as const,
  },

  // --- Project (5 key factories) — preserved from v0.0.1 ---
  project: {
    ...projectBase,
    dashboard: () => [...projectBase.all, 'dashboard'] as const,
  },

  // --- Estimating (NEW — 7 key factories) ---
  estimating: {
    ...estimatingBase,
    trackers: (opts?: Record<string, unknown>) => [...estimatingBase.all, 'trackers', opts] as const,
    tracker: (id: number) => [...estimatingBase.all, 'tracker', id] as const,
    kickoff: (projectId: string) => [...estimatingBase.all, 'kickoff', projectId] as const,
  },

  // --- Compliance (NEW — 5 key factories) ---
  compliance: {
    ...complianceBase,
    entries: (projectId: string) => [...complianceBase.all, 'entries', projectId] as const,
    entry: (id: number) => [...complianceBase.all, 'entry', id] as const,
    summary: (projectId: string) => [...complianceBase.all, 'summary', projectId] as const,
  },

  // --- Contracts (NEW — 6 key factories) ---
  contracts: {
    ...contractsBase,
    contracts: (projectId: string) => [...contractsBase.all, 'contracts', projectId] as const,
    contract: (id: number) => [...contractsBase.all, 'contract', id] as const,
    approvals: (contractId: number) => [...contractsBase.all, 'approvals', contractId] as const,
  },

  // --- Risk (NEW — 5 key factories) ---
  risk: {
    ...riskBase,
    items: (projectId: string) => [...riskBase.all, 'items', projectId] as const,
    item: (id: number) => [...riskBase.all, 'item', id] as const,
    management: (projectId: string) => [...riskBase.all, 'management', projectId] as const,
  },

  // --- PMP (NEW — 6 key factories) ---
  pmp: {
    ...pmpBase,
    plans: (projectId: string) => [...pmpBase.all, 'plans', projectId] as const,
    plan: (id: number) => [...pmpBase.all, 'plan', id] as const,
    signatures: (pmpId: number) => [...pmpBase.all, 'signatures', pmpId] as const,
  },

  // --- Auth (NEW — 5 key factories) ---
  auth: {
    ...authBase,
    currentUser: () => [...authBase.all, 'currentUser'] as const,
    roles: () => [...authBase.all, 'roles'] as const,
    role: (id: string) => [...authBase.all, 'role', id] as const,
    templates: () => [...authBase.all, 'templates'] as const,
  },
} as const;
