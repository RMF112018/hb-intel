# Prompt 05 — SPFX Responsibility Matrix Surface Shell

## Objective

Implement the user-facing read-only/safe-action Responsibility Matrix surface shell with eight lanes and flagship control-center UX, using the read model and client from prior prompts.

## Required Instruction

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```

## Global Guardrails

You must preserve these guardrails throughout this prompt:

- Do not edit `docs/architecture/plans/**` unless separately authorized.
- Do not run broad formatting across the repo.
- Do not change dependencies, package manifests, lockfiles, workflows, CI, SPFx packaging, deployment files, app settings, or secrets unless this prompt explicitly authorizes a narrow change and you can justify it.
- Do not add runtime calls to Graph, PnP, SharePoint REST, Procore, Sage, AHJ portals, Document Crunch, Adobe Sign, or other external systems.
- Do not add backend write routes.
- Do not mutate Team & Access state.
- Do not execute approvals/checkpoints owned by Wave 14.
- Do not implement evidence file upload/download/sync/storage behavior.
- Do not provide legal advice, infer legal obligations, create legal obligations, or replace executed contracts.
- Stop and report if local repo truth contradicts the Wave 11 documentation package or this prompt.

## Allowed / Likely Files

Use Prompt 01–04 results. Likely files include:

```text
apps/project-control-center/src/surfaces/responsibilityMatrix/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/components/
apps/project-control-center/src/fixtures/
apps/project-control-center/src/tests/
apps/project-control-center/src/App.tsx
apps/project-control-center/src/navigation or shell files if repo-consistent
```

Use existing PCC surface, bento/card, preview-state, detail-drawer, and shell conventions. Do not create an unrelated design system.

## Required UX Lanes

Implement the required eight lanes:

1. Overview
2. Matrix View
3. Item Register
4. Owner-Contract Mapping
5. My Responsibilities
6. Gaps & Conflicts
7. Handoffs
8. Template / Source Mapping Admin

## Required Global Elements

Include:

- global `Who Owns This?` lookup;
- Matrix Health Score;
- current action owner / ball-in-court indicators;
- exception cards;
- evidence-link references only;
- owner-contract placeholder/schema-only messaging;
- corrected `109 / 98 / 0` workbook posture messaging;
- source-traceability panel;
- role/person toggle where repo patterns support it;
- item detail drawer or detail region if a repo-standard pattern exists;
- disabled/inert safe action affordances for future workflow where appropriate.

## UX Standard

This must feel like a world-class project control center module, not a spreadsheet viewer.

Design for:

- fast executive summary;
- project-team daily utility;
- clear responsibility gaps;
- “who owns this now?” answers;
- handoff visibility;
- contract-party vs RACI separation;
- owner-contract ambiguity transparency;
- source-traceability confidence;
- no legal-advice posture.

## Required Messaging

Surface these statements or equivalent:

- `109` is workbook-derived task-row context, not final active assignments.
- `98` is strict marked assignment-row posture.
- Owner-contract active default obligations are `0`.
- Owner-contract workbook remains placeholder/schema-only until populated obligations exist.
- Source marks such as `X`, `Support`, `Review`, and `Sign-Off` require explicit mapping policy / human review.
- Contract-party `C = Contractor` is not RACI `C = Consulted`.
- Evidence files remain owned by HB Document Control Center.
- Approval execution remains owned by Wave 14.
- Team & Access remains roster/access owner.

## Prohibited UI Behavior

Do not add:

- live edit persistence;
- workflow execution;
- approval execution;
- file upload/storage;
- external-system sync/writeback;
- direct Graph/PnP/SharePoint REST/Procore/Sage/AHJ runtime interactions;
- legal-interpretation text.

## Tests

Add tests to prove:

- all eight lanes render;
- global lookup renders safe results;
- count posture appears correctly;
- owner-contract placeholder message appears;
- evidence is reference-only;
- action buttons are disabled/inert/preview-only unless an existing safe framework explicitly permits them;
- no spreadsheet-launcher-only UX;
- no forbidden runtime imports.

## Validation Commands

Run only repo-appropriate commands based on touched files and actual package scripts.

Baseline before edits:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
md5 pnpm-lock.yaml
```

Core validation after edits:

```bash
git diff --check
pnpm exec prettier --check <touched files>
git diff --cached --name-only
git status --short
md5 pnpm-lock.yaml
```

Package validation, as applicable:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
```



## Staged-File Proof Before Commit

Before committing, show:

```bash
git diff --cached --name-only
git diff --cached --stat
md5 pnpm-lock.yaml
```

If `pnpm-lock.yaml` changed, stop and report unless this prompt explicitly authorized a dependency change.

## Commit Requirements

Use this format in your final response:

```text
Commit summary:
<type(scope): concise summary>

Commit description:
<short body explaining what changed, what was validated, and what was intentionally not changed>
```

## Final Output Requirements

- State files changed.
- State validation commands run and results.
- State lockfile hash before and after.
- State guardrail confirmations.
- State residual risks or follow-up prompts.
