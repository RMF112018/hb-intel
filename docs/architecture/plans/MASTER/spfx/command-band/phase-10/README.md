# Priority Actions Homepage Launcher — Enhanced Combined Audit + Prompt Package

## Purpose

This package supersedes the attached audit package and implementation-prompt package.

It is a **repo-truth reconciliation package**, not a rewrite of prior wording.
It treats the live `main` branch as source of truth, treats doctrine and benchmark files as binding authority, and folds in external subject-matter research where that research materially improves remediation quality.

## What this package does

This package:

- preserves the prior findings that are still correct
- corrects package assumptions that are now stale or incomplete
- adds newly discovered issues still present in `main`
- raises the specificity and closure standard of the local-code-agent prompts
- removes in-scope ambiguity that would otherwise let weak launcher outcomes survive

## Live repo truth used to generate this package

The real hosted homepage launcher path is now governed primarily by:

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/*`

The standalone / non-homepage rail path still exists, but it is **not** the homepage runtime authority.

## Binding governing authority

This package treats the following as controlling:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/reference/spfx-surfaces/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

Other benchmark documents may still be useful, but the above are the minimum controlling authorities for the launcher scope addressed here.

## Package contents

### Core files

- `README.md`
- `Plan-Summary.md`

### Audit files

- `Audit-00-Executive-Summary.md`
- `Audit-01-Package-vs-Repo-Reconciliation.md`
- `Audit-02-Live-Implementation-Map.md`
- `Audit-03-Standards-Compliance-Assessment.md`
- `Audit-04-Enhanced-Issues-Register.md`
- `Audit-05-Enhanced-Remediation-Strategy.md`
- `Audit-06-Required-Implementation-Waves.md`
- `Audit-07-External-Research-Basis.md`

### Prompt files

- `Prompt-01-Re-anchor-Homepage-Runtime-and-Retire-Stale-Seam-Language.md`
- `Prompt-02-Reconcile-Authoring-Contract-and-Dead-Homepage-Knobs.md`
- `Prompt-03-Expand-Homepage-Launcher-Model-Beyond-Five-Fields.md`
- `Prompt-04-Rebuild-Icon-Semantics-Around-IconKey-and-Service-Identity.md`
- `Prompt-05-Replace-Flex-Stretch-Chips-With-A-Variable-Width-Launcher-Primitive.md`
- `Prompt-06-Redesign-Overflow-Into-A-Grouped-Secondary-Launcher.md`
- `Prompt-07-Reconcile-Visible-Count-Governance-and-Short-Height-Rules.md`
- `Prompt-08-Restore-Label-Clarity-Truncation-Handling-and-Accessibility.md`
- `Prompt-09-Harden-Host-Fit-and-Shell-Integration-Without-Regressing-Data-Seams.md`
- `Prompt-10-Add-Regression-Tests-Packaged-Proof-and-Hosted-Cutover-Checks.md`

## Package posture

This package does **not** defer meaningful in-scope work.

If the launcher is still weak because:

- the adapter is too lossy,
- the icon semantics are still wrong,
- the overflow surface is still flat,
- the visible-count rules are internally inconsistent,
- or the shell-fit proof is still too soft,

then those problems are addressed here directly.

## Expected use

1. Read `Plan-Summary.md`.
2. Read the audit set in order.
3. Execute the prompt files in numeric order unless repo conditions justify batching adjacent prompts.
4. Require proof of closure after each prompt.
5. Do not accept visual-only closure where contract, governance, accessibility, or hosted-proof gaps remain.
