/**
 * formatModuleLabel — UIF-006
 *
 * Single source of truth for module key → human-readable display name mapping
 * within @hbc/my-work-feed.
 *
 * The map covers all moduleKey values known to be emitted by the registered
 * adapters (bic, notification, handoff, acknowledgment, draftResume) and the
 * common HBC platform module slugs that flow through BIC items.
 *
 * For unrecognised keys the fallback title-cases the slug and replaces hyphens
 * with spaces, which produces acceptable results for future module additions
 * without requiring a code change.
 *
 * Governed by: UI-Kit-Visual-Language-Guide.md §module-labels (UIF-006).
 * Consumers: HbcMyWorkFeed (table column renderer), HbcMyWorkListItem (metadata row).
 */

/**
 * Map of raw moduleKey slugs to short human-readable display names.
 *
 * Naming convention:
 * - Prefer ≤ 15 characters so labels fit in the source column without truncation.
 * - Use title case; preserve uppercase acronyms (BD, RFI, PMP, BIC).
 * - "Hub" suffix is dropped from Project Hub sub-modules — the parent project
 *   name provides enough context.
 */
export const MODULE_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  // ── BD / Pre-construction ──────────────────────────────────────────────────
  'bd-scorecard':          'BD Scorecard',
  'bd-department-sections': 'BD Sections',
  'estimating':            'Estimating',
  'estimating-pursuit':    'Est. Pursuit',

  // ── Project Hub sub-modules ────────────────────────────────────────────────
  'project-hub-pmp':           'Project Hub',
  'project-hub-health-pulse':  'Health Pulse',
  'project-hub-buyout':        'Buyout',
  'project-hub-closeout':      'Closeout',
  'project-hub-rfi':           'RFIs',
  'project-hub-submittal':     'Submittals',
  'project-hub-safety':        'Safety',
  'project-hub-quality':       'Quality',

  // ── Financial / Admin ──────────────────────────────────────────────────────
  'accounting':            'Accounting',
  'admin':                 'Admin',

  // ── Platform / Cross-module ────────────────────────────────────────────────
  'bic':                   'BIC',
  'compliance':            'Compliance',
  'handoff':               'Handoff',
  'session-state':         'Session',
};

/**
 * Returns the display name for a moduleKey.
 *
 * Falls back to title-casing the slug when the key is not in the map,
 * so newly-introduced modules degrade gracefully to readable labels
 * without requiring an immediate code change.
 *
 * @example
 *   formatModuleLabel('bd-scorecard')       // → 'BD Scorecard'
 *   formatModuleLabel('estimating-pursuit') // → 'Est. Pursuit'
 *   formatModuleLabel('new-module-xyz')     // → 'New Module Xyz'  (fallback)
 */
export function formatModuleLabel(moduleKey: string): string {
  return (
    MODULE_DISPLAY_NAMES[moduleKey] ??
    moduleKey.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
