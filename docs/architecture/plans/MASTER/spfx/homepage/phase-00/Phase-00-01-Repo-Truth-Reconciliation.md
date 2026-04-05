# Phase-00-01 — Repo-Truth Reconciliation

## Objective
Reconcile the live `hb-intel` repo so it tells one clear and authoritative story about:

- `@hbc/ui-kit` entry-point truth
- homepage product scope vs shell-extension scope
- the current SharePoint customization posture for HB Central
- which docs are authoritative vs stale or superseded

This prompt is the first execution step of Phase 00.

---

## Context
The SharePoint shell blueprint effort is moving forward, but the repo currently contains contradictory signals across source, package contracts, READMEs, and reference docs.

That ambiguity must be removed now.

You are not being asked to begin Phase 01 or Phase 02 implementation.  
You are being asked to make the repo authoritative and safe for those later phases.

---

## Hard Rules
- Work from live repo truth first.
- Do **not** re-read files that are already in your current context or memory unless needed to verify a specific change or resolve a contradiction.
- Do **not** widen this prompt into homepage polish, shell-extension implementation, or broad refactoring.
- Do **not** preserve contradictions by softening the language; resolve them.
- Do **not** remove useful doctrine discipline in the name of speed.
- Do **not** leave behind multiple files that continue to describe the same rule differently.

---

## Primary Repo Areas In Scope
Audit and update the relevant files in these areas as needed:

- `packages/ui-kit/`
- `docs/reference/ui-kit/`
- `apps/hb-webparts/`
- root architecture or standards docs that refer to SharePoint shell/homepage boundaries
- any live repo doc that currently acts as authority for UI-kit entry points, homepage imports, or SharePoint host boundaries

---

## Tasks

### 1. Build the contradiction inventory
Audit the current repo and create a concise internal working inventory of contradictions such as:

- source entry points vs published entry points
- README guidance vs actual consumer usage
- reference docs vs package truth
- homepage guidance vs shell guidance
- outdated/stale file locations or taxonomy assumptions
- local machine path references or other non-repo-safe references in docs

You do not need to preserve this as a large report unless it helps the repo.  
Use it to drive precise remediation.

### 2. Establish authoritative boundary statements
Create or update the minimum necessary authoritative docs so the repo clearly states:

- what belongs to the homepage/page-canvas lane
- what belongs to the future shell-extension lane
- what is explicitly not the production objective
- how the current repo should be understood right now

### 3. Clean up doc authority
For any stale, overlapping, or conflicting files:
- rewrite them
- add supersession language
- or consolidate them

Do not leave shadow authority in place.

### 4. Normalize terminology
Make terminology consistent across relevant files, especially around:
- homepage product
- shell extension
- page canvas
- supported SharePoint customization
- UI-kit entry points
- import guardrails

### 5. Leave a durable repo-truth trail
The result should make it obvious to a future agent:
- which files are authoritative
- which assumptions are now locked
- which questions are intentionally deferred to later phases

---

## Required Deliverables
Produce repo-ready changes that leave behind at least the following outcomes:

1. One authoritative written statement of homepage vs shell-extension responsibilities
2. One authoritative written statement of current supported SharePoint customization posture
3. One clear statement of the UI-kit entry-point authority source
4. Supersession or cleanup of stale/conflicting docs that would otherwise mislead future work

If an ADR is the cleanest way to lock this, create one.  
If an existing authoritative doc should be updated instead, do that.  
Choose the cleanest durable structure.

---

## Acceptance Criteria
This prompt is complete only when:

- a reviewer can tell where homepage responsibilities end and shell-extension responsibilities begin
- a reviewer can tell which file now governs UI-kit entry-point truth
- conflicting legacy language no longer remains in place as apparent authority
- the repo is safer for the next prompt to lock export/import contracts

---

## Required End-of-Prompt Output
At the end of your work, provide a concise closure summary that includes:

- contradictions resolved
- files created/updated
- which file(s) are now authoritative for:
  - package entry-point truth
  - homepage vs shell-extension boundaries
  - supported SharePoint customization posture
- any intentionally deferred items that belong to Prompt 2 or Prompt 3
