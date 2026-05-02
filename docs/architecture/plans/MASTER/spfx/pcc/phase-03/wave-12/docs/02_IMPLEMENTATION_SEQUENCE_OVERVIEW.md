# Implementation Sequence Overview — Wave 12 Constraints Log

## Execution Rule

Run prompts in order. Do not skip Prompt 01. Do not combine prompts unless the local agent can prove the later prompt only touches files already fully validated in the immediately prior prompt and the scope remains small.

## Prompt Dependencies

| Prompt | Stage | Depends On | Output |
| --- | --- | --- | --- |
| 01 | Readiness audit | Current local repo truth | Read-only audit report, exact file targets, validation plan |
| 02 | Models/fixtures/scoring/state | Prompt 01 | Shared model contracts, fixtures, scoring utilities, source-model mismatch correction |
| 03 | Backend GET-only mock read model | Prompt 02 | Read-model provider/route and backend tests |
| 04 | SPFx client and fixture parity | Prompt 03 if backend added; Prompt 02 for models | Typed client seam, fixture fallback, parity tests |
| 05 | SPFx surface shell | Prompt 04 | User-facing Constraints Log surface shell |
| 06 | Integration seams | Prompt 05 | Reference-only integration posture across PCC modules |
| 07 | Tests, guardrails, closeout | Prompts 02–06 | Final validation, guardrail tests, closeout doc |
| 08 | Fresh reviewer prompt | Prompt 07 | Review prompt for independent implementation audit |

## Stop Conditions

Stop and report if:

- local repo truth contradicts Wave 12 documentation in a way that changes architecture;
- `pnpm-lock.yaml` changes without explicit authorization;
- package manifests, workflows, manifests, deployment files, or tenant settings would need edits;
- implementation requires external-system credentials, writes, sync, scraping, polling, or Graph/PnP/SharePoint runtime behavior;
- a prompt would create legal/claim/delay determinations;
- backend write routes would be required;
- `docs/architecture/plans/**` would need edits without separate authorization.

## Expected Closeout

Prompt 07 must add a Wave 12 implementation closeout under the blueprint wave folder, not the canonical plans folder unless separately authorized.

Preferred path, subject to local repo truth:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Implementation_Closeout.md
```
