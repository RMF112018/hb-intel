# Prompt 03 — Backend Scope Alignment and Orphaned Call Removal

You are continuing the **HB Intel Estimating / Project Setup SPFx** Phase 1 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Align the backend and runtime expectations to the newly isolated Project Setup frontend surface.

This prompt is about **scope control**, not full backend redesign.

## Critical instructions

- Use the Phase 1 scope matrix and the frontend isolation changes from Prompt 02 as governing truth.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** expand this prompt into full auth redesign, list remapping, or infrastructure modernization unless a narrowly scoped enabling change is unavoidable.
- If a capability is out of scope for this package, prefer removing the frontend expectation over keeping an unsupported backend dependency alive.

## Required working approach

1. Reconcile the isolated frontend surface against the active backend route surface.
2. Identify any remaining frontend calls that no longer belong.
3. Remove, disable, or clearly gate unsupported expectations.
4. Review backend startup/registration posture and determine what is actually required for the isolated package.
5. Reduce accidental deployment coupling where practical within Phase 1 boundaries.

## Required decisions

For each of the following, classify as:
- `Retain for isolated Project Setup`
- `Remove from package scope`
- `Gate behind later-phase implementation`

Evaluate at minimum:
- project requests routes
- provisioning status routes
- provisioning retry/escalation routes
- signalR negotiate
- preferences
- user groups
- notifications
- proxy behavior

## Required implementation outputs

Make the code changes necessary to:
- eliminate remaining orphaned frontend calls
- align backend-scope assumptions with the isolated package
- document any retained backend features that are still part of Project Setup scope
- document any intentionally deferred backend features

Create or update a markdown file containing:
- allowed backend surface for Phase 1
- removed/gated calls
- backend-scope notes
- unresolved items pushed to later phases

## Acceptance criteria

- No known orphaned frontend API call remains in the isolated package.
- The backend surface required by Project Setup is explicit.
- Unrelated scope is either removed, gated, or documented as deferred.
- No change in this prompt broadens package scope.

## Required summary back to me

When done, report:
- remaining allowed routes
- removed/gated calls
- any backend startup areas still broader than desired
- what must be addressed next in Prompt 04
