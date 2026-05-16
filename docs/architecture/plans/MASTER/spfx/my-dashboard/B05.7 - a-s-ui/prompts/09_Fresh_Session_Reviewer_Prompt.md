# Prompt 09 — Fresh Session Reviewer Prompt

## Prompt to Send Local Agent

```md
# Fresh Session Prompt — Independent Re-Audit of the My Dashboard Adobe Sign Flagship Remediation

Act as a senior SPFx product-design auditor, frontend architecture reviewer, accessibility reviewer, and UI doctrine compliance specialist for HB Intel / HB Central surfaces.

You are conducting an independent, repo-truth-first re-audit of the **Adobe Sign module inside My Dashboard** after completion of the flagship UI/UX remediation package.

## Objective

Determine whether the Adobe Sign module now:

1. satisfies the implementation package’s closed decisions;
2. resolves the prior gap register AS-01 through AS-12;
3. reaches doctrine-aligned homepage-grade or flagship/benchmark-grade acceptance;
4. is supported by adequate validation and evidence.

## Required Inputs

Review:

- the current live repo state;
- the final implementation commits;
- the new closeout docs under:
  - `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.5 - a-s-flagship-uiux/`
- the attached or repo-copied audit checklist;
- the attached or repo-copied scorecard;
- current hosted screenshots if provided.

## Required Repo-Truth Preflight

Verify:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -20
```

If connector access is used instead of a local repo, provide the equivalent evidence.

## Required Source Areas

Inspect at minimum:

```text
apps/my-dashboard/src/modules/adobeSign/**
apps/my-dashboard/src/layout/MyWorkCard.tsx
apps/my-dashboard/src/layout/MyWorkCard.module.css
apps/my-dashboard/src/layout/MyWorkBentoGrid.module.css
apps/my-dashboard/src/state/myWorkCardViewModel.ts
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.5 - a-s-flagship-uiux/**
```

## Required Audit Questions

Answer:

1. Was accidental Adobe card stretch eliminated?
2. Is the card title stable and noninteractive?
3. Is the view switch a proper semantic control outside the heading?
4. Are status chip and freshness signals visible?
5. Do queue/completed rows now use premium, readable activity grammar?
6. Is `Updated date unavailable` gone from the final UX?
7. Is preview-limit context visible when applicable?
8. Does Completed retry exist and behave as scoped?
9. Are responsive modes explicitly represented and credible?
10. Are accessibility semantics and tests materially stronger?
11. Were backend/functions/package/lockfile scope boundaries preserved?
12. Does the final scorecard honestly reach 48+/56?

## Required Output Structure

## 1. Task Understanding
## 2. Repo-Truth Baseline
## 3. Implementation Package Compliance Review
## 4. Current Rendered Condition
## 5. Source Architecture Review
## 6. Accessibility and Keyboard Review
## 7. Responsive and Host-Fit Review
## 8. Gap Register Closure Assessment
## 9. Scorecard Re-Audit
## 10. Residual Risks
## 11. Final Verdict

## Final Verdict Requirements

State:

- whether the module is doctrine-compliant today;
- whether it is homepage-grade today;
- whether it is flagship / benchmark-grade today;
- whether hosted evidence is sufficient;
- the single most important remaining gap, if any.

Do not reward the module merely for compiling or passing tests. Use evidence.
```
