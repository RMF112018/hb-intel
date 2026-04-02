# Prompt-02 — Phase 11 Accounting Entry Surface and Bundle Contract Reconciliation

## Objective

Reconcile the Accounting build entry, IIFE/module contract, and SPFx shell-load expectations so the repo contains one precise, tested description of how the deployed Accounting app resolves from source files into the runtime module that SharePoint loads.

The goal is to eliminate ambiguity between:
- `AccountingWebPart.tsx` as an app surface
- the Vite build entry
- the shell-wrapper load model
- the runtime `mount/unmount` contract expected by `ShellWebPart`

This prompt should end with explicit evidence of the current bundle contract and any code/doc fixes needed to keep that contract stable.

## Critical Working Rules

- Treat the packaging-truth memo from Prompt 01 as the starting point.
- Do not re-read files already in current context or memory unless needed to verify contradiction, capture exact evidence, or inspect the true entry/bundle path.
- Make narrowly scoped code changes only if the current Accounting build path is internally inconsistent or under-specified.
- Do not fold permission-model changes into this prompt.

## Required Scope

Inspect at minimum:
- `apps/accounting/vite.config.ts`
- `apps/accounting/src/webparts/accounting/AccountingWebPart.tsx`
- any Accounting entry file actually consumed by Vite
- any build output naming or global contract definitions relevant to Accounting
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- any tests or docs already covering mount/unmount / global exposure / bundle naming

## Required Work

1. Determine the actual Accounting bundle contract used by the packaging toolchain.
2. Confirm whether Accounting currently:
   - produces an IIFE/global module for shell loading, or
   - relies on a different contract that the shell wrapper is adapting.
3. If the current contract is under-documented or fragile, tighten it with:
   - comments
   - docs
   - tests
   - or small implementation fixes
4. Verify that the Accounting bundle naming, global name resolution, and runtime loader expectations are consistent end to end.

## Required Outputs

### 1. Create a reconciliation memo at:
`docs/architecture/reviews/accounting-entry-surface-and-bundle-contract-reconciliation.md`

The memo must include:
- Current Entry Path
- Build Output Contract
- Shell Loader Expectations
- Global / IIFE / mount-unmount Contract
- Fragility Points
- Any Changes Made
- Exact Files Inspected

### 2. Add or update a phase-local reference at:
`docs/architecture/plans/MASTER/spfx/accounting/phase-11/02-Entry-Surface-and-Bundle-Contract.md`

### 3. If needed, add or extend targeted tests to protect the Accounting bundle contract.

Possible targets include:
- build-time contract tests
- packaging-script checks
- runtime smoke verification related to Accounting

## Hard Requirements

- State explicitly which file is the true Accounting build entry.
- State explicitly which runtime contract `ShellWebPart` expects from the Accounting artifact.
- If the current `AccountingWebPart.tsx` name is misleading relative to the final packaged loader path, document that directly.

## Completion Standard

This prompt is complete only when there is no ambiguity about how the Accounting source turns into the deployable module loaded by SharePoint.
