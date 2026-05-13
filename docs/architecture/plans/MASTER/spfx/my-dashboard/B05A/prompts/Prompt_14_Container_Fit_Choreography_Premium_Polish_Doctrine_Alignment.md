# Prompt 14 — Container-Fit Choreography, Premium Polish, and Doctrine Alignment

## Objective

Refine the My Projects module until it meets the requested **flagship-grade** SPFx quality bar across:

- layout composition;
- breakpoint/container-fit behavior;
- motion restraint;
- action clarity;
- premium visual hierarchy;
- accessibility;
- anti-generic-card posture.

This prompt is a **beautification and resilience** pass. It must not leave the module at merely functional quality.

## Mandatory efficiency instruction

Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

## Required inputs

- Prompt 13 closeout
- UI doctrine files
- `supporting/02_Plan_Reconciliation_Updated_Closed_Decisions.md`
- `supporting/04_Risks_Prerequisites_Operator_Owned_Steps.md`

---

## Repo-truth references to inspect

### My Projects UI implementation
- files created in Prompt 12 and Prompt 13

### Layout and container primitives
- `apps/my-dashboard/src/layout/myWorkFootprints.ts`
- `apps/my-dashboard/src/layout/useMyWorkContainerBreakpoint.ts`
- `apps/my-dashboard/src/layout/MyWorkCard.tsx`
- relevant CSS modules

### Doctrine
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

---

## Implementation scope

# 1. Breakpoint/container-fit contract

The module must align with My Work responsive mode vocabulary:

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

### Expected layout posture

| Mode family | Expected My Projects posture |
|---|---|
| ultrawide / desktop | identity + role chips + dual actions in authoritative horizontal row |
| large / standard laptop | horizontal row remains credible; action cluster compresses without ambiguity |
| small laptop / tablet landscape | controlled wrapping; identity and actions remain readable |
| tablet portrait | stacked identity block + action row |
| phone | single-column launch strip; no horizontal overflow; credible tap targets |

# 2. No horizontal scrolling for primary content

Verify and remediate:

- launch rows;
- action clusters;
- role chip overflow;
- metric strip;
- degraded-state banner;
- disclosure button.

The module may not require horizontal scrolling to access critical content/actions.

# 3. Visual hierarchy and authored composition

Refine:

- module header rhythm;
- metric treatment;
- row spacing;
- source badge placement;
- role chip hierarchy;
- action affordance weight;
- unavailable-state tone;
- banner materiality.

The outcome must feel authored and premium, not default enterprise cards with small embellishments.

# 4. Motion and reduced-motion behavior

Where motion exists:

- keep it restrained;
- respect reduced-motion settings;
- avoid animation that causes focus loss or height-jank;
- ensure expand/collapse remains stable.

If the repo does not already use a motion dependency in My Dashboard and adding one would materially expand scope, keep motion CSS/native and document the decision. Do not add new dependencies symbolically.

# 5. Accessibility / keyboard / touch

Audit and remediate:

- focus-visible affordances;
- keyboard order:
  1. project context;
  2. SharePoint action;
  3. Procore action;
  4. disclosure controls;
- no hover-only critical meaning;
- disabled/unavailable actions remain interpretable;
- touch target credibility in compact modes;
- readable role overflow details.

# 6. Anti-generic-card hard stop

Review the final module against the doctrine hard stop:

- no generic card-grid posture;
- no equal-height repetitive utility-card wall;
- no low-density empty rail;
- no Project Sites clone.

Where the current Prompt 13 result still reads too generic, refine composition and styling.

# 7. Tests

Add/update tests that can be reasonably verified in unit/UI test environment, such as:

- mode-based class/data marker behavior if app conventions support it;
- disclosure retains accessible control semantics;
- compact mode variants render the action structure;
- reduced-motion class/behavior if implemented.

Do not fabricate browser-layout assertions that the test stack cannot honestly prove. Prompt 15 handles hosted evidence.

---

## Required non-goals

- Do not alter backend contracts.
- Do not add missing functional states; Prompt 13 should have completed them. If a missing state is discovered, report and fix only if tightly coupled to polish acceptance.
- Do not add gratuitous new dependencies.
- Do not redesign the entire My Dashboard shell.
- Do not turn My Projects into a separate focused route.

---

## Validation requirements

Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard lint
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
```

Use targeted search for breakpoint and surface markers relevant to your implementation:

```bash
rg -n "phone|tabletPortrait|tabletLandscape|smallLaptop|standardLaptop|largeLaptop|desktop|ultrawide|my-project" \
  apps/my-dashboard/src/modules/myProjects \
  apps/my-dashboard/src/surfaces/home \
  apps/my-dashboard/src/layout
```

---

## Evidence requirements

Closeout must include:

- breakpoint choreography summary;
- premium-composition changes made;
- accessibility/touch refinements;
- reduced-motion disposition;
- validation command outcomes;
- explicit statement of whether the module is ready for hosted evidence capture.

---

## Commit / closeout expectations

Recommended commit title:

```text
style(my-projects): refine flagship responsive composition and accessibility
```

Closeout format:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Files changed
4. Responsive choreography summary
5. Premium polish summary
6. Accessibility/touch/reduced-motion summary
7. Validation commands and outcomes
8. Hosted validation readiness
9. Recommended next prompt:
   - Prompt 15

---

## Guardrails

- Protect unrelated active work.
- No unnecessary dependency/lockfile changes.
- No speculative global theme redesign.
- Stay aligned with My Work shell constraints and non-homepage SPFx doctrine.
