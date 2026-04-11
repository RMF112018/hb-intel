# Prompt — Property Pane and Role Assignment Closure

## Objective
Implement real property-pane authoring for HB Kudos Companion so Kudos admin/reviewer assignment is configurable from the SharePoint page instance on `HBCentral/SitePages/HR-Admin.aspx`, and ensure the runtime role model is actually usable in live SharePoint execution.

## Repo truth
Work directly against the live repo:
- `https://github.com/RMF112018/hb-intel`

Do not re-read files that are already in your current context or memory.

## Governing authority
Use repo truth and at minimum:
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
- current live `@hbc/ui-kit`
- current live `docs/reference/ui-kit/`
- the Decision Lock requirement: role assignment mechanism must be configurable webpart properties managed by an existing SharePoint admin
- the audit requirement that companion admin users be assignable from the property pane on `HR-Admin.aspx`

## Scope
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`
- `apps/hb-webparts/src/homepage/helpers/kudosRoleResolver.ts`
- `apps/hb-webparts/src/homepage/helpers/kudosCapabilities.ts`
- any shared shell/property-pane utilities needed to support validated Kudos configuration

## Non-negotiable requirements
- Do not leave the companion with an empty property pane.
- Expose authorable fields for `kudosAdminsGroup` and `kudosReviewersGroup`.
- Prefer a validated SharePoint-group picker/dropdown or equivalent over loose raw text if feasible within the current architecture.
- If raw text is temporarily unavoidable, add strong validation, operator guidance, and explicit misconfiguration states.
- Do not rely on `simulatedRole` in a live SharePoint-hosted page where `siteUrl` exists.
- Add an explicit runtime empty-config state when no group assignment is present.
- Ensure UI gating and writer-level authorization still honor the same resolved role model.

## Guardrails
- Repo truth first.
- Do not accept comments, manifest descriptions, or stale reports as proof by themselves.
- Do not leave “writer support exists” as a substitute for a runtime-complete workflow.
- Do not preserve weak bespoke local UI where shared homepage-safe promotion is warranted.
- Do not claim closure unless code, runtime behavior, tests, and documentation align.

## Required outputs
- code changes implementing companion property-pane authoring
- runtime handling for missing/invalid group assignments
- updated documentation/comments where current assumptions are stale
- brief report of how the property-pane data flows from SharePoint page authoring into runtime resolution

## Verification
- show the specific property-pane branch added for the companion webpart ID
- show the exact persisted properties expected on the page instance
- prove the companion no longer silently self-locks when page authors configure it correctly
- prove the runtime fails closed with a clear operator message when not configured
- run relevant typecheck/lint/tests for touched scope
