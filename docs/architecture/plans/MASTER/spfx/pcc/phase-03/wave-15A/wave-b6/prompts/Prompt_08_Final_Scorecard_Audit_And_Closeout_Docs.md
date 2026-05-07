# Prompt 08 — Final Scorecard Audit and Closeout Documentation

## Role

You are the local code agent working in the `hb-intel` repository. You are implementing a controlled Project Home flagship remediation for the PCC SPFx application.

## Non-negotiable agent instructions

- Do not re-read files that are still within your current context or memory. Only re-open a file when you need to verify stale, missing, contradictory, or newly changed repo truth.
- Start with `git status --short` and `git branch --show-current`; do not touch unrelated dirty files.
- Treat `17e4273ebd070dd62ca477297393e6c787441111` and `docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/` as the baseline evidence named by this package.
- Use the canonical scorecard path: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`. Do not reference the old `_v2` scorecard filename.
- Preserve the Project Home two-path contract:
  - fixture-only path remains deterministic and no-read-model;
  - read-model-driven path remains opt-in through `readModelClient`.
- Preserve bento direct-child behavior: every rendered `[data-pcc-card]` must have `parentElement === [data-pcc-bento-grid]`.
- Do not nest `PccDashboardCard` inside another `PccDashboardCard`.
- Do not introduce live writes, uploads, syncs, approvals, deletes, saves, external launches, or mutation side effects.
- Keep HBI advisory. HBI may summarize, explain, ground, and route attention; HBI must not claim autonomous decision, approval, writeback, or mutation authority.
- Keep Procore/Sage/SharePoint/PCC source-of-record boundaries explicit. Do not imply PCC owns records that remain external-system-owned.
- Do not edit `package.json`, `pnpm-lock.yaml`, package-solution files, or manifests unless the prompt explicitly authorizes it. This package does not authorize those edits.
- Do not modify shared primitives (`PccBentoGrid`, `PccDashboardCard`, `footprints.ts`, shell/tabs/hero primitives) unless a blocking validation failure proves the Project Home remediation cannot be completed otherwise. Stop and report the exact blocker before touching primitives.
- Prefer Project Home-local view-model, adapter, component, CSS, and test changes.
- Run the validation commands named in the prompt before closeout. If a command cannot run, report why and what evidence remains missing.

## Objective

Produce final Project Home closeout documentation and scorecard-evidence mapping for expert review. This prompt should avoid product behavior changes unless a blocking documentation/test inconsistency is found.

## Required repo check

Before editing:

```bash
git status --short
git branch --show-current
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Primary files

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/
docs/architecture/evidence/pcc-live/
```

## Objective detail

This prompt is a closeout/audit prompt. It should document what changed, what evidence improved, and what residual risks remain. It must not claim final scoring authority.

## Documentation requirements

Create or update a Project Home remediation closeout document in the appropriate Wave 15A planning/blueprint location selected by repo-truth.

Recommended location if no existing wave folder is specified:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/project-home-flagship-remediation/
```

Include:

1. objective;
2. baseline evidence;
3. commits/prompts executed;
4. files changed by prompt;
5. final card order;
6. first-fold hierarchy summary;
7. Priority Actions compression summary;
8. HBI/source authority summary;
9. accessibility closeout;
10. responsive closeout;
11. screenshot evidence closeout;
12. validation command results;
13. residual risk register;
14. scorecard pillar impact mapping;
15. no-claims statement.

## Scorecard mapping

Map the remediation to:

- P1 command-center clarity;
- P2 mold-breaker differentiation;
- P4 layout/hierarchy/density;
- P5 workflow/next-action clarity;
- P6 state/source/HBI boundaries;
- P7 responsive/field/host fit;
- P8 accessibility;
- P9 evidence/validation.

Map hard-stop posture:

- HS-02 command-center failure;
- HS-03 cognitive overload;
- HS-04 false affordance;
- HS-05 field-office divergence;
- HS-06 state model;
- HS-07 accessibility;
- HS-09 evidence;
- HS-10 HBI authority.

Use careful language:

```text
Improved posture
Evidence-supported improvement
Residual operator-review item
Not final hard-stop closure
```

## Validation

Run documentation-focused validation:

```bash
pnpm exec prettier --check <new-or-updated-docs>
git diff --check
git status --short
```

If product files changed unexpectedly, run the full required validation block from this package.

## Closeout response

Return:

```text
Closeout docs created/updated:
Evidence path:
Scorecard pillar mapping:
Hard-stop posture:
Validation:
Residual risks:
```

## Closeout response

Return:

```text
Files changed:
Repo-truth confirmed:
Implementation summary:
Tests run:
Validation results:
Lockfile/package/manifest status:
Known residual risks:
```
