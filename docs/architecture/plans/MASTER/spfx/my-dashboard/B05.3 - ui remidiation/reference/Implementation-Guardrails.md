# Implementation Guardrails

## 1. Do Not Reopen Locked Product Decisions

The package's target posture is final for this implementation. Do not re-litigate:

- whether tabs remain;
- whether focused Adobe route remains required;
- whether Work Summary remains;
- whether Source Readiness remains;
- whether My Projects remains full-width;
- whether a third filler module should be invented.

## 2. Do Not Re-Read Files Already in Active Context Unless Necessary

Use this exact standard:

> Do not reread files that are already in your active context unless they changed, context is stale, or scope expanded.

## 3. Preserve Source-of-Record Boundaries

- Adobe Sign actions continue in Adobe Sign.
- SharePoint and Procore launch destinations remain external handoffs.
- My Dashboard remains a read/action-launch layer, not a source-system write surface.

## 4. Preserve OAuth Integrity

- Do not alter backend token storage architecture.
- Do not invent or bypass OAuth start rules.
- Preserve the existing truthful connect action path where already wired.

## 5. No External-System Mutations

Do not:
- mutate SharePoint lists;
- call Adobe APIs beyond existing runtime/app logic required by tests;
- change tenant configuration;
- change OAuth app settings.

## 6. Avoid Unrelated Refactors

Limit edits to the UI posture reset and direct dependencies. Do not opportunistically refactor unrelated SPFx or backend domains.

## 7. Keep Accessibility Strong

Preserve or improve:
- semantic buttons/links;
- visible focus states;
- role/ARIA integrity;
- alert/status semantics in meaningful state transitions;
- keyboard access for disclosure interactions.

## 8. Keep Validation Real

Do not claim:
- hosted screenshot proof;
- tenant validation;
- package deployment success

unless actually performed.

## 9. Remove Obsolete Runtime Product Model, Not Necessarily Every Historical Document

Runtime UI artifacts that enforce the old product posture must be removed or de-rendered. Historical plan documents may remain as historical artifacts unless actively misleading or referenced as current operating truth.

## 10. Final Acceptance Overrides Convenience

If a simpler edit preserves old fragmentation or old telemetry surface posture, it is not acceptable.
