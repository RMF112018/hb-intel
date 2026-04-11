# HB Kudos Photo Association Remediation Package

## Objective
Fix the current HB Kudos defect where live user search returns the correct people in the **Give Kudos** panel, but avatar photos are not associated with those results or selected chips. Deliver the fix through the correct shared-component boundary so the result is durable and reusable, not a one-off patch.

## Why this package exists
Repo-truth shows all of the following are already true:

- `HbKudos.tsx` wires `searchPeople = useSharePointPeopleSearch()` into the shared composer flow.
- `HbcKudosComposerForm` already accepts `fetchPersonPhoto?: PersonPhotoFn` and forwards it into the shared people picker bridge.
- `HbcPeoplePicker` already supports separate async photo retrieval.
- `usePersonPhotoCache` and `createGraphPersonPhotoFn` already implement the correct photo-fetch architecture using Graph `/users/{id-or-upn}/photo/$value`.
- The current HB Kudos consumer path does **not** pass `fetchPersonPhoto`, so the picker falls back to initials.

The package is targeted at closing that defect first, then tightening the shared lane so it remains platform-grade.

## Scope
In scope:

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- `packages/ui-kit/src/HbcPeoplePicker/types.ts`
- `packages/ui-kit/src/HbcPeoplePicker/useGraphPeopleSearch.ts`
- `packages/ui-kit/src/HbcPeoplePicker/usePersonPhotoCache.ts`
- `packages/ui-kit/src/homepage.ts`
- any minimal auth/token helper usage needed to create a Graph-scoped token provider for photo fetch

Out of scope unless required to make the fix work:

- broad People & Culture redesign
- unrelated Kudos governance logic
- archive/detail surface rework
- replacing the current SharePoint search adapter with a full Graph search rewrite in the same pass

## Non-goals
- Do **not** create a second or third people picker implementation.
- Do **not** move tenant-specific SharePoint request-digest logic into `@hbc/ui-kit`.
- Do **not** assume avatar data is inline on the search result.
- Do **not** block the production defect fix on a larger search refactor.

## Execution order
1. Read the plan summary and audit summary.
2. Execute Prompt 01 to wire photo fetch into HB Kudos.
3. Execute Prompt 02 to harden the shared contracts only where needed.
4. Execute Prompt 03 to validate and prove the defect is closed.
5. Update README / decision notes only if implementation truth changed materially.

## Expected deliverables
- HB Kudos consumer now passes a working `fetchPersonPhoto` adapter into `HbcKudosComposerForm`.
- Give Kudos live results render real photos when available.
- Selected chips render real photos when available.
- Missing-photo users render initials without error or broken image behavior.
- Shared people-picker contract remains reusable and boundary-correct.
- Verification evidence captured in code comments, validation notes, or brief implementation summary.

## Closure standard
The package is only complete when all of the following are true:

- search results still resolve live users
- photo fetch is wired through the shared picker seam, not a local ad hoc image hack
- no regression to typed recipient selection
- no regression to text fallback mode when `searchPeople` is unavailable
- missing-photo behavior is treated as normal and renders initials cleanly
- code placement respects package boundaries
- validation is run at the smallest credible scope and results are recorded

## Mandatory working rules for the local code agent
- Do not reread files that are already in current context or memory unless they changed, your context is stale, or scope expanded.
- Read the smallest authoritative set needed.
- Favor modification of the existing shared lane over creation of new parallel utilities.
- Make the production defect fix first; keep the second-pass hardening tightly scoped.
