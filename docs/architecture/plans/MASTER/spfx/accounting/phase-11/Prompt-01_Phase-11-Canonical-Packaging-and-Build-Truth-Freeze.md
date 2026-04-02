# Prompt-01 — Phase 11 Canonical Packaging and Build Truth Freeze

## Objective

Establish one explicit, evidence-backed source of truth for how the Accounting SharePoint deployment artifact is built, packaged, versioned, and represented in repo documentation.

The purpose of this prompt is to eliminate ambiguity about whether the canonical Accounting deployment path is:

- the repo-visible `apps/accounting` SPFx entry surface,
- the `tools/spfx-shell` packaging orchestrator path,
- some hybrid of the two,
- or a stale/divergent artifact path that should no longer be trusted.

This is a truth-freeze and documentation-hardening prompt first. Only make implementation changes if the current build path is inconsistent or broken.

## Critical Working Rules

- Treat live repo code and current committed docs as authoritative for present implementation truth.
- Treat the previously audited uploaded `.sppkg` only as a comparison artifact and drift trigger.
- Do not re-read files already in current context or memory unless needed to verify contradiction, capture exact evidence, or confirm the current build path.
- Do not make broad refactors in this prompt.
- Any code changes made in this prompt must be limited to clarifying/build-truth alignment work.
- If the audit finding about `ShellWebPart` vs `AccountingWebPart` is disproven by current repo build orchestration, document that directly and correct the repo-facing narrative.

## Required Scope

Inspect at minimum:

### Accounting app surfaces
- `apps/accounting/config/package-solution.json`
- `apps/accounting/vite.config.ts`
- `apps/accounting/src/webparts/accounting/AccountingWebPart.tsx`
- `apps/accounting/src/webparts/accounting/AccountingWebPart.manifest.json`
- the actual Vite entry/bundle path used by the Accounting build

### Shared SPFx packaging path
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `tools/spfx-shell/gulpfile.js`
- any `tools/spfx-shell/config/*` files that materially govern bundle injection or manifest generation

### Current packaging/readiness docs if present
- prior SPFx packaging remediation docs
- current Accounting phase docs
- any docs that describe the shell packaging path as authoritative or transitional

## Questions You Must Answer

1. What is the canonical Accounting SPFx packaging path today?
2. Is `ShellWebPart` the intended packaging wrapper for Accounting, or evidence of drift?
3. What is the actual bundle entry contract for the Accounting deployment artifact?
4. Which repo files own:
   - package versioning
   - manifest shape
   - app bundle naming
   - runtime config injection
   - final `.sppkg` generation
5. Which statements in current docs or recent audit narrative are now misleading or incomplete?

## Required Outputs

### 1. Create a markdown truth memo at:
`docs/architecture/reviews/accounting-spfx-packaging-truth-freeze.md`

The memo must include:
- Executive Summary
- Canonical Packaging Flow
- Entry Surface / Bundle Contract
- Manifest and Version Ownership
- Shell Wrapper Role
- Known Ambiguities Resolved
- Drift Findings
- Exact Files Inspected
- Explicit Conclusion: what should be treated as canonical from this point forward

### 2. Create or update a phase-local summary file at:
`docs/architecture/plans/MASTER/spfx/accounting/phase-11/01-Canonical-Packaging-Truth-Freeze.md`

This file should be shorter and operational, suitable as a quick reference for later Phase 11 prompts.

### 3. Update any clearly stale documentation that would otherwise keep the packaging path ambiguous.

Keep doc changes narrow and factual.

## Hard Requirements

- Distinguish between:
  - source entry surface truth
  - shell wrapper truth
  - package manifest truth
  - final `.sppkg` truth
- State directly whether the prior assumption that `ShellWebPart` indicated packaging drift was correct or disproven.
- If disproven, record the corrected repo truth so this issue is not re-opened later without evidence.

## Completion Standard

This prompt is complete only when later prompts can reference one unambiguous Accounting packaging/build path without re-litigating how the `.sppkg` is created.
