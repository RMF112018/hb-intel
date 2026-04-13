/**
 * Kudos domain-adapter (Layer 2).
 *
 * Single front door for the Kudos content family. Sits above the
 * shared SharePoint platform layer (`@hbc/sharepoint-platform`) and
 * below the webpart-local orchestration layer (`webparts/hbKudos/**`,
 * `webparts/hbKudosCompanion/**`).
 *
 * Scope:
 *   - typed reads (Kudos entries, audit timeline)
 *   - draft submission
 *   - governance actions (end-to-end KudosPatch dispatcher)
 *   - binding validation
 *
 * Non-goals:
 *   - no generic "fetch any list" API,
 *   - no absorption of webpart-local queue/public orchestration,
 *   - no domain-adapter for non-Kudos homepage surfaces.
 *
 * See `docs/architecture/plans/MASTER/spfx/data/phase-01/closure-phase-03.md`
 * for the layer responsibility summary.
 */
export * from './reads.js';
export * from './submission.js';
export * from './governance.js';
export * from './validation.js';
