# Wave 1 Open Decision Register

| ID | Decision Needed | Options | Interim Position | Required Before |
|---|---|---|---|---|
| W1-ODR-001 | Exact shared model package location | `packages/models/src/pcc/`; new package such as `packages/pcc-models/`; documentation-only | Use `packages/models/src/pcc/` unless Prompt 01 proves a better repo path | Prompt 02 |
| W1-ODR-002 | Whether Wave 1 creates a new package or uses an existing package | Existing `@hbc/models`; new PCC package; no code | Existing `@hbc/models` is recommended because it is the canonical shared model package and backend-safe | Prompt 02 |
| W1-ODR-003 | Export strategy | PCC domain barrel only; root `@hbc/models` export; subpath export through existing wildcard; both root and subpath | Use `packages/models/src/pcc/index.ts` and export from `packages/models/src/index.ts` if consistent with repo conventions | Prompt 07 |
| W1-ODR-004 | Fixture location | `packages/models/src/pcc/fixtures/`; `@hbc/data-seeding`; `@hbc/project-site-template/validation/fixtures`; docs-only | Use `packages/models/src/pcc/fixtures/` for pure deterministic model fixtures | Prompt 06 |
| W1-ODR-005 | Test strategy | Type/value unit tests in `@hbc/models`; source-scan guard tests; documentation-only | Use package-local Vitest tests under `packages/models/src/pcc/**/*.test.ts` | Prompt 02 |
| W1-ODR-006 | Feature/module flag location | PCC model constants; shell runtime config; backend config; docs-only | Use model-level constants only; no runtime flag wiring in Wave 1 | Prompt 06 |
| W1-ODR-007 | No-mutation guard implementation location | Local pure PCC guard in `@hbc/models`; import from `@hbc/project-site-provisioning`; docs-only | Prefer local pure guard/test. Do not import provisioning package into models unless Prompt 01 proves dependency direction is acceptable | Prompt 06 |
| W1-ODR-008 | Backend/SPFx shared boundary | Pure TS models only; backend DTOs; SPFx-specific props; mixed runtime package | Pure TypeScript only, no SPFx/backend/runtime imports | Prompt 02 |
| W1-ODR-009 | Whether Wave 1 can proceed before Wave 0 gate closes | Proceed with code; docs-only; block until gate | Default to docs-only until Prompt 01 confirms implementation authorization | Prompt 02 |
| W1-ODR-010 | Requested exact Phase 3 files missing from `main` | Locate on another branch; create/register new scope docs; continue from closest current docs; block | Prompt 01 must re-check and document the mismatch before code work | Prompt 01 |
| W1-ODR-011 | PCC project status modeling relative to existing project enums | Reuse legacy `ProjectStatus`; create PCC-specific status type; modify legacy enum | Create PCC-specific status type to avoid corrupting legacy project model behavior | Prompt 02 |
| W1-ODR-012 | PCC role/persona alignment with existing `ProjectRole` | Alias existing `ProjectRole`; define PCC role/persona types; create mapping layer | Define PCC personas and optionally map to existing `ProjectRole`; do not mutate existing roles | Prompt 03 |
| W1-ODR-013 | External system catalog breadth | Include only user-requested systems; include contract systems; include future placeholders | Include user-required systems and contract-supported placeholders with MVP/later/deferred posture | Prompt 05 |
| W1-ODR-014 | Documentation closeout path | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/`; `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/`; both | Prompt 01 must choose repo-consistent path | Prompt 01 |
