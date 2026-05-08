# Prompt 04 — Header A11y and Responsive Semantics

## Mandatory Efficiency Directive

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Shared Guardrails

- Work from current repo truth.
- Preserve SharePoint host-fit.
- Preserve read-only / preview / no-writeback posture.
- Preserve the distinction between PCC surfaces and work centers/modules.
- Preserve bento direct-child invariants.
- Preserve tab / tabpanel accessibility.
- Do not implement full Modules launcher behavior.
- Do not implement command routing.
- Do not introduce active module state.
- Do not remove duplicate/header cards in Phase 03.
- Do not change `pnpm-lock.yaml`, package dependencies, or SPFx package-solution files unless a prompt explicitly proves it is unavoidable and the user approves.
- Use `apps/project-control-center/config/package-solution.json` for package-solution references.

---

## Role

You are hardening Phase 03 header accessibility and responsive behavior.

## Objective

Ensure the conditional command header is accessible, compact, responsive, and clear about authority/source/read-only boundaries.

This is not a broad visual redesign.

## Likely Files to Edit

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

Edit `PccCommandSearch.tsx` only if needed to preserve truthful preview semantics or accessible copy.

## Required A11y Checks

- Region labeling is clear.
- Heading hierarchy remains logical.
- Summary/cue/read-only text is screen-reader-visible.
- Status is not color-only.
- Cues do not rely solely on visual tone.
- No clickable `div`.
- No fake enabled controls.
- No disabled action without reason copy.
- No command-search preview that looks functional but is not.
- Focus order is not harmed.
- Tablist/tab/tabpanel relationships remain intact.

## Required Responsive Checks

Validate behavior for these modes if supported by tests/fixtures:

```text
phone
tabletPortrait
tabletLandscape
smallLaptop
standardLaptop
largeLaptop
desktop
ultrawide
```

For compact modes:

- summary/cues may wrap;
- facts may compress;
- command-search may use compact preview;
- no horizontal overflow pattern;
- no clipped authority cue.

## SharePoint Host-Fit Rules

- Do not assume full browser height.
- Do not hide SharePoint chrome.
- Do not create permanent PCC sidebar.
- Do not rely on SharePoint-generated CSS class names.
- Preserve SPFx page-canvas compatibility.

## Tests Required

Add/update tests proving:

- hero region has expected label/role;
- each responsive mode preserves expected markers;
- compact modes render summary and cue zones;
- no interactive descendants exist in summary/cue/read-only zones;
- command-search preview remains non-interactive;
- active tab/tabpanel semantics still pass.

## Prohibited

- No duplicate-card removal.
- No full Modules launcher.
- No command routing.
- No active module state.
- No bento primitive changes unless a specific failing test proves they are necessary and user/auditor approves.
- No package/lockfile/manifest changes.

## Required Validation

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Optional Live Evidence

Only if Playwright/live evidence files or selectors are touched:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```

## Required Completion Response

```markdown
## Prompt 04 Complete

## Files Changed

## Accessibility Hardening Summary

## Responsive Hardening Summary

## SharePoint Host-Fit Audit

## False Affordance Audit

## Tests Added or Updated

## Validation Results

## Package / Lockfile / Manifest Audit

## Follow-Up Notes for Prompt 05
```
