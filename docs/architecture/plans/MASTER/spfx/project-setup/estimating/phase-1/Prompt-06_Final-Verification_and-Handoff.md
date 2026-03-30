# Prompt 06 — Final Verification and Handoff

You are continuing the **HB Intel Estimating / Project Setup SPFx** Phase 1 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Run the final verification pass for **Phase 1 — Scope control** and produce a clean handoff.

## Critical instructions

- Use the outputs of Prompts 01–05 as governing truth.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** reopen broad architectural debates in this prompt.
- This is a verification and handoff prompt, not a new implementation phase.

## Required working approach

1. Verify the isolated package surface against the frozen contract.
2. Verify removed scope has not reappeared.
3. Verify the backend-scope assumptions remain consistent with the isolated package.
4. Review tests and checklists for completeness.
5. Produce a concise Phase 1 handoff note.

## Required output

Create a final markdown handoff document containing:

### 1. What Phase 1 accomplished
- routes removed
- calls removed
- shell scope narrowed
- contract frozen
- tests/guards added

### 2. What remains intentionally deferred
- later-phase blockers
- later-phase auth/data/infrastructure work

### 3. Verification status
- passed
- failed
- partial
- unresolved

### 4. Recommended next phase entry point
- what should be tackled first after Phase 1

## Acceptance criteria

- There is a final Phase 1 handoff doc.
- A reviewer can understand exactly what changed and what still remains.
- Deferred items are explicit and not hidden.

## Required summary back to me

When done, report:
- handoff doc path
- whether Phase 1 is complete
- any blocking unresolved items
- the recommended first task for Phase 2
