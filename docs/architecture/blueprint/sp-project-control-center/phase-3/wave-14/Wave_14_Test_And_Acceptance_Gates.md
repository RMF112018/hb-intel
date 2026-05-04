# Wave 14 Test and Acceptance Gates

## Purpose

Define acceptance gates for Wave 14 architecture/contract completeness and no-runtime guardrail compliance.

## Contract Coverage Gates

1. Canonical states and terminal/non-terminal posture documented.
2. Transition table documented with actor classes and required controls.
3. Approval modes documented with completion semantics.
4. Decision-action catalog and reason-code families documented.
5. Reviewer vs approver vs admin-verification distinctions documented.
6. HBI no-authority documented.
7. Ball-in-court/current-action-owner model documented.
8. Stale-source and supersession rules documented.
9. Policy versioning documented.
10. Evidence requirements and command validation layers documented.

## Consistency Gates

- Wave 14 source-module integration contract aligns with ownership boundaries.
- Wave 14 Wave13G checkpoint contract preserves authority split.
- HBI guardrail doc and storage/read-model posture docs do not contradict no-runtime/no-writeback policy.

## Validation Gates

- JSON artifacts parse with `python3 -m json.tool`.
- Touched markdown/json pass Prettier check.
- `pnpm-lock.yaml` MD5 remains unchanged.
- `git diff --check` returns clean.
- Consistency scan for contradictory markers is reviewed.

## Failure Conditions

Fail Prompt 03 closeout when any of the following occur:

- missing required architecture coverage;
- contradictory authority boundaries;
- runtime implementation claims;
- writeback authorization claims;
- tenant mutation authorization claims.

## Prompt 03 Scope Lock

Prompt 03 defines architecture and implementation contracts only. It does not create or modify TypeScript runtime models, backend routes, command handlers, SPFx components, SharePoint lists, package files, lockfiles, tenant resources, Procore/Sage/Power Automate integrations, deployment artifacts, or production rollout posture.
