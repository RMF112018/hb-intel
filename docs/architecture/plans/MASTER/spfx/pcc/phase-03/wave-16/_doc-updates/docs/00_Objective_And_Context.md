# 00 — Objective and Context

## Objective
Define implementation-ready architecture for PCC Phase 3 Wave 16 — Control Center Settings.

## Current repo-truth basis
- `control-center-settings` exists as a PCC MVP governance surface.
- The current SPFx settings surface is preview-only.
- `PccSettings.ts` has only a shallow early scope vocabulary.
- `PccReadModels.ts` has `PccSettingsReadModel`.
- The backend provider interface includes `getSettings(...)`.
- The current backend/SPFx read-route wiring needs local verification and likely completion.
- HBCentral has a platform configuration registry pattern.
- PCC has generic configuration/feature/module flag draft schemas requiring Wave 16 refinement.

## Product interpretation
Control Center Settings is the governed PCC configuration surface for project, module, integration, security, feature flag, notification, validation, Site Health, and HBI posture.

## Non-goals
No runtime writes, no direct tenant mutation, no raw secrets, no production rollout, no direct SPFx-to-Procore/Graph mutation, and no HBI decision authority.
