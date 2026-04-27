# 17 — Prompt 03: Config Tab Redesign

You are working as the local code agent in the `hb-intel` repository.

## Wave

Wave 03 — Config Tab Redesign

## Goal

Redesign Config as a task-oriented admin console with grouped readiness, required admin actions, plain-language labels, and collapsed diagnostics.

## Standing Instruction

Do not re-read files that are still within your current context or memory unless needed to verify current repo truth, line-level details, contradictions, dependencies, or drift after changes.

## Non-Negotiable Architecture Guardrails

- Preserve the registry-first architecture.
- Preserve split readiness states; do not collapse readiness into one boolean.
- Preserve degraded consent-required rendering.
- Preserve backend route boundaries; do not add routes unless repo truth proves they are required.
- Preserve redacted diagnostics; never surface raw secrets, tokens, backend URLs, API resources, or list GUIDs in the primary UI.
- Preserve existing content workflows: save, validate, publish, suppress, placement, sync.
- Do not change package/version files as part of the audit/planning package.
- If shipped SPFx behavior changes in implementation, versioning must be handled only in the relevant implementation wave and documented in closure.
- Do not re-read files that remain in active local-agent context unless needed to verify drift, contradictions, or line-level implementation details.

## Files to Inspect

- `apps/hb-intel-foleon/src/pages/manage/FoleonConfigTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageConfigViewModel.ts`
- `apps/hb-intel-foleon/src/pages/manage/ManageRegistryPanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/pages/manage/foleonManageTokens.css`
- `apps/hb-intel-foleon/src/runtime/**`
- `apps/hb-intel-foleon/src/types/foleon-management.types.ts`
- `apps/hb-intel-foleon/src/services/FoleonManagementApi.ts`
- `apps/hb-intel-foleon/src/pages/__tests__/**`
- registry/config docs under `docs/architecture/plans/MASTER/platform/config-registry/**`

## Files Likely to Change

- `FoleonConfigTab.tsx`
- `manageConfigViewModel.ts`
- `manageShell.module.css`
- tests
- optional new components:
  - `AdminHealthSummary.tsx`
  - `RequiredAdminActions.tsx`
  - `ConfigurationGroup.tsx`
  - `DiagnosticsDisclosure.tsx`

## Visual / UX Objective

Config should answer:

- Is API approval complete?
- Is the backend reachable?
- Is registry configuration valid?
- Are SharePoint lists bound?
- Is read/write/sync ready?
- What admin action is required next?
- Where is redacted proof if escalation is needed?

## Implementation Requirements

1. Build a System Health Summary with groups:
   - API approval
   - Backend connection
   - Registry connection
   - SharePoint lists
   - Publishing and sync access
   - Package governance
2. Add Required Admin Actions list ranked by operational impact.
3. Replace raw labels with plain-language labels.
4. Move `Config Source by Value` and similar raw proof tables into collapsed diagnostics.
5. Redact diagnostics and preserve copy-proof behavior.
6. Preserve split readiness states:
   - token setup;
   - API approval/token acquisition;
   - backend safe config;
   - route authorization;
   - read path;
   - write path;
   - sync path.
7. Do not expose raw backend URLs, API resources, list GUIDs, secrets, or tokens in primary UI.

## Acceptance Criteria

- Config tab reads as an admin console.
- Admin can identify top blockers within five seconds.
- Raw proof tables are collapsed by default.
- Plain-language label mapping is used.
- Diagnostics are redacted and copyable.
- Split readiness remains distinct and visible.

## Tests to Add / Update

Add or update tests proving:

- system health groups render;
- required admin actions rank API approval missing above lower-level diagnostics;
- raw labels do not render in primary UI;
- diagnostics are collapsed by default;
- copy proof action is available where supported;
- unsafe raw values are not shown;
- write/read/sync states remain separate.
## Validation Commands

Run, as repo tooling allows:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
```

If shell/runtime bridge is touched:

```bash
npx tsx tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts
```

If package proof is required for the wave:

```bash
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

Use Node 18 where SPFx tooling requires it. If Node 22 blocks SPFx build/package validation, document that limitation and run every available check.

## Versioning Guidance

Do not change package/version files unless this wave ships SPFx source behavior that repo packaging policy requires to be versioned. If versioning is required, bump the Foleon package to the next SharePoint four-part version everywhere repo truth requires and document the exact files.

## Closure Report Requirements

Create or update a closure report under:

`docs/architecture/plans/MASTER/spfx/foleon-manage/uiux-rescue/`

Include:

- summary;
- repo-truth files inspected;
- files changed;
- UI/UX changes;
- architecture guardrails preserved;
- tests added/updated;
- commands run and results;
- screenshots or hosted/local validation notes if available;
- limitations;
- commit message.

## Commit Message Target

```text
SPFx Foleon Manager: redesign config admin console
```
