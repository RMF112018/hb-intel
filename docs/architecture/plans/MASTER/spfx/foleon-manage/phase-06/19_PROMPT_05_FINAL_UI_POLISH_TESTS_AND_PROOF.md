# 19 — Prompt 05: Final UI Polish, Tests, and Proof

You are working as the local code agent in the `hb-intel` repository.

## Wave

Wave 05 — Final UI Polish, Tests, and Proof

## Goal

Complete responsive polish, accessibility pass, testing, screenshot evidence, closure report, and package/version proof if source behavior changed.

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

- All files changed in Waves 01–04.
- `apps/hb-intel-foleon/src/pages/manage/**`
- `apps/hb-intel-foleon/src/pages/__tests__/**`
- `apps/hb-intel-foleon/src/runtime/**` only if touched by prior waves.
- `apps/hb-intel-foleon/config/package-solution.json` only if package/version bump is required.
- `apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json` only if package/version bump is required.
- `apps/hb-intel-foleon/src/webparts/foleon/runtimeContract.ts` only if package/version bump is required.
- `apps/hb-intel-foleon/scripts/validate-foleon-feature-assets.ts` only if repo truth requires version alignment.
- relevant docs under `docs/architecture/plans/MASTER/spfx/foleon-manage/**`

## Files Likely to Change

- CSS modules for polish.
- Tests.
- Closure report docs.
- Package/version files only if required by source behavior changes.
- No backend routes unless a prior wave explicitly proved necessity.

## Visual / UX Objective

Finalize the Manager as a polished, accessible, responsive, SharePoint-native surface.

## Final Polish Requirements

1. Confirm no horizontal overflow in SharePoint page constraints.
2. Confirm header/actions/chips wrap cleanly.
3. Confirm lane cards work at desktop, medium, and narrow widths.
4. Confirm Config diagnostics stay collapsed by default.
5. Confirm disabled action reasons are visible/accessibly described.
6. Confirm focus-visible states are clear.
7. Confirm tab keyboard behavior.
8. Confirm banner severity/announcement behavior is appropriate.
9. Confirm primary UI does not expose raw technical values.

## Required Screenshot / Proof Scenarios

Capture or document proof for:

- Homepage Foleon Content default tab.
- Three lane cards visible.
- Selected-lane workspace.
- API consent missing / limited mode.
- Config tab health summary.
- Diagnostics collapsed.
- Disabled publish/sync with reason.
- Narrow width layout.
- No horizontal overflow.

## Tests to Add / Update

Final regression coverage must include:

- default tab;
- lane cards;
- selected-lane workspace;
- config health grouping;
- diagnostics collapsed;
- disabled write reasons;
- degraded consent-required state;
- no unsafe raw values in primary UI;
- keyboard/ARIA expectations where testable.

## Acceptance Criteria

- Marketing, admin, visual, technical, accessibility, and responsive acceptance criteria in `12_TESTING_AND_ACCEPTANCE_CRITERIA.md` are satisfied or explicitly documented with accepted exceptions.
- Closure report includes command outputs and limitations.
- Package/version proof completed if source behavior changed and packaging is required.
- No broad unrelated refactors.

## Package / Version Guidance

If Waves 01–04 changed shipped SPFx source behavior, complete repo-required version bump and package proof in this wave. If earlier waves already versioned, verify consistency only. If no package/version change is required, document why.

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
SPFx Foleon Manager: finalize UI polish tests and proof
```
