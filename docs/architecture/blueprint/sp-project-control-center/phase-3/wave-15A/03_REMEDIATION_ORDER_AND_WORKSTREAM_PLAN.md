# 03 — Remediation Order and Workstream Plan

## 1. Purpose

This file defines the mandatory execution order for Wave 15A. The order matters. Surface-level styling before shared-system correction will not reach 56/56.

## 2. Execution Rule

Do not remediate individual pages first.

Begin with doctrine, shell, host fit, grid, card, state, and project context. Then remediate surfaces.

## 3. Workstream Overview

| Workstream | Name                                     | Primary Outcome                                               |
| ---------- | ---------------------------------------- | ------------------------------------------------------------- |
| A          | Baseline and Doctrine Contract           | Scorecard and evidence rules locked.                          |
| B          | Shell, Host Fit, and Navigation          | PCC frame becomes tenant-aware and command-centered.          |
| C          | Project Context and Surface Header       | Every surface becomes project-specific.                       |
| D          | Grid, Bento, and Card Hierarchy          | Layout system supports product-grade surfaces.                |
| E          | State Model and Product Language         | Preview/read-only/degraded states become operationally clear. |
| F          | First-Impression Surfaces                | Home, Team & Access, Documents, Readiness corrected.          |
| G          | Governance / Risk / Integration Surfaces | Site Health, Settings, Approvals, External Systems corrected. |
| H          | Validation and Closeout                  | 56/56 evidence package completed.                             |

## 4. Detailed Sequence

### Step 1 — Repo Truth Audit

Required actions:

- Inspect current PCC source.
- Inventory actual current surfaces.
- Inventory shell, nav, grid, card, state, and style components.
- Inspect UI doctrine files.
- Inspect scorecard/checklist/evidence files.
- Inspect current Wave 15 architecture and closeout docs.
- Inspect existing screenshots.

Exit criteria:

- Source file map is complete.
- Existing shared primitive ownership is understood.
- No implementation begins until the file map is documented.

### Step 2 — Scorecard Contract

Required actions:

- Create adapted PCC scorecard.
- Define 4/4 criteria for each category.
- Define evidence required for each category.
- Record current baseline score.

Exit criteria:

- Scorecard contract approved.
- Hard gates identified.

### Step 3 — Shared Shell and Host Fit

Required actions:

- Reduce shell dominance.
- Create project context band.
- Reposition preview diagnostics.
- Improve nav active/hover/focus states.
- Validate against SharePoint chrome.

Exit criteria:

- PCC content becomes primary.
- Header/nav no longer overpower content.
- Screenshots demonstrate fit.

### Step 4 — Surface Header Standard

Required actions:

- Create or update shared surface header.
- Add project identity to every surface.
- Add purpose, state, next action, and data confidence fields.

Exit criteria:

- Every surface starts with a consistent project-specific operational header.

### Step 5 — Grid and Card System

Required actions:

- Define Tier 1/Tier 2/Tier 3 card patterns.
- Fix bento/grid span behavior.
- Eliminate narrow-column failures.
- Add layout tests.
- Validate responsive collapse.

Exit criteria:

- No surface has unusable layout or excessive dead canvas.

### Step 6 — State Model

Required actions:

- Replace generic preview/unavailable language.
- Define state variants.
- Add operational consequence and next-step language.
- Update state components and tests.

Exit criteria:

- No primary surface is dominated by generic unavailable placeholders.

### Step 7 — Remediate First-Impression Surfaces

Priority order:

1. Project Home.
2. Team & Access.
3. Documents.
4. Project Readiness.

Exit criteria:

- These surfaces collectively score at flagship baseline.
- User can understand project status, access posture, document posture, and readiness posture without confusion.

### Step 8 — Remediate Remaining Surfaces

Priority order:

1. Site Health.
2. Control Center Settings.
3. Approvals.
4. External Systems.

Exit criteria:

- Risk/governance/integration surfaces are coherent and preview-safe.

### Step 9 — Tenant Validation

Required actions:

- Build and deploy to non-production SharePoint tenant.
- Capture screenshots.
- Validate edit and published modes.
- Validate keyboard and accessibility basics.
- Re-score.

Exit criteria:

- Final scorecard is 56/56.
- No hard gates remain.

## 5. Prompt-by-Prompt Suggested Execution

### Prompt 01 — Repo Truth and Scorecard Contract

No implementation. Produce source inventory, doctrine matrix, and 56/56 acceptance contract.

### Prompt 02 — Shared Shell and Host Fit

Implement shell/nav/project-context changes and tests.

### Prompt 03 — Grid, Card, and Layout Primitives

Implement card tiering, grid rules, responsive behavior, and Team & Access layout correction.

### Prompt 04 — State Model and Product Language

Implement state taxonomy, preview language, disabled-action explanations, and tests.

### Prompt 05 — Project Home and Team & Access

Remediate the first two highest-impact surfaces.

### Prompt 06 — Documents and Project Readiness

Remediate operational control and lifecycle readiness surfaces.

### Prompt 07 — Site Health and Settings

Remediate governance/risk surfaces.

### Prompt 08 — Approvals and External Systems

Remediate workflow/integration surfaces.

### Prompt 09 — Tenant Validation and 56/56 Closeout

Capture evidence, score, close, and hand off.

## 6. Dependency Notes

- Do not run Prompt 05 before Prompt 02–04 are complete.
- Do not claim surface completion before shared state and card primitives exist.
- Do not close Wave 15A before tenant screenshots exist.
