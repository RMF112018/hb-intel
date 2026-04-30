# Phase 3 / Wave 6 Prompt Package — PCC Team & Access

Generated: 2026-04-30

Repository: `RMF112018/hb-intel`  
Local code-agent path: `/Users/bobbyfetting/hb-intel`  
Wave: Phase 3 / Wave 6 — Team & Access  
Status: **Ready for local repo-truth gate, then implementation**

## Purpose

This package instructs a local code agent to implement the Project Control Center Team & Access module in controlled prompts.

Wave 6 must build Team & Access request/review UI and read-model behavior while preserving strict non-mutation guardrails.

## Audit result

- Wave 5 is complete.
- Wave 5A is optional controlled tenant revalidation and is not required before Wave 6.
- Team & Access shared models and fixtures exist.
- Team & Access SPFx preview surface exists.
- Backend provider has `getTeamAccess(...)`, but no HTTP `team-access` route is registered.
- SPFx read-model client does not yet expose `getTeamAccess(...)`.
- All controls must remain preview/read-model/manual-IT posture unless a later gated wave authorizes execution.

## Package contents

1. `Plan-Summary.md`
2. `Repo-Truth-Audit.md`
3. `Wave-6-Scope-Lock.md`
4. `Wave-6-Closed-Decisions.md`
5. `Wave-6-Implementation-Sequence.md`
6. `Prompt-01-Wave-6-Repo-Truth-Gate-and-Scope-Lock.md`
7. `Prompt-02-Wave-6-Team-Access-View-Model-and-Adapter.md`
8. `Prompt-03-Wave-6-Team-Access-Request-Form-and-Status-UI.md`
9. `Prompt-04-Wave-6-Request-Queue-and-Detail-Review-UI.md`
10. `Prompt-05-Wave-6-Manager-Execution-Queue-and-Manual-IT-Posture.md`
11. `Prompt-06-Wave-6-Optional-Backend-Read-Model-Opt-In-Wiring.md`
12. `Prompt-07-Wave-6-Guardrails-States-and-Regression-Hardening.md`
13. `Prompt-08-Wave-6-Documentation-Closeout-and-Wave-7-Readiness.md`
14. `Fresh-Session-Reviewer-Prompt-Wave-6.md`

## Execution rule

Run prompts in order. Do not skip Prompt 01. Prompt 06 is optional and must remain read-only if executed.
