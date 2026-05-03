# Audit Basis for Remaining Gap Remediation

## Accepted Repo-Truth Direction

Recent PCC documentation updates established the governing doctrine for a unified lifecycle architecture. The local agent must treat this doctrine as accepted target architecture and implement only controlled seams that support it.

## Remaining Gaps to Address

The targeted audit identified the following remaining implementation/detail gaps:

1. No TypeScript contracts yet for:
   - lifecycle events;
   - project memory records;
   - role/stage lenses;
   - traceability edges;
   - warranty trace records;
   - cross-project references;
   - obligation/vendor/product trace records;
   - estimate references;
   - lessons learned references;
   - source lineage/evidence-link reusable primitives if not already adequate.

2. No runtime/read-model endpoints yet for:
   - lifecycle timeline;
   - project memory;
   - cross-stage traceability;
   - warranty trace;
   - cross-project reference/knowledge reuse;
   - unified search / Ask-HBI grounding preview.

3. No SPFx preview UX yet for:
   - lifecycle timeline;
   - project memory panel/card;
   - related-records panel;
   - warranty trace mode;
   - closed-project reference mode;
   - unified search/HBI grounding.

4. Constraints Log has model/backend/SPFx client seams, but no verified end-user Project Readiness surface integration.

5. Cross-project knowledge reuse needs explicit security, retention, sensitivity, and permission posture before any implementation that could expose closed-project or pursuit-stage information.

## Required Implementation Bias

The remediation must be documentation-informed, model-first, and preview-safe. It should deepen the existing PCC architecture rather than introducing new disconnected app surfaces.

The correct pattern is:

- Contracts before runtime.
- Fixtures before live integrations.
- GET-only read models before actions.
- Unified shell integration before standalone module pages.
- Source-lineage and evidence-linking before HBI answers.
- Permission posture before cross-project knowledge retrieval.

## Files/Folders the Agent Must Inspect as Needed

Do not blindly re-read everything. Use active context first. Re-open only where necessary.

Minimum likely targets:

- `docs/architecture/blueprint/sp-project-control-center/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/`
- `packages/models/src/pcc/`
- `packages/models/src/pcc/fixtures/`
- `packages/models/src/index.ts`
- `backend/functions/src/hosts/pcc-read-model/`
- `backend/functions/src/services/__tests__/`
- `apps/project-control-center/src/api/`
- `apps/project-control-center/src/fixtures/`
- `apps/project-control-center/src/shell/`
- `apps/project-control-center/src/surfaces/`
- `apps/project-control-center/src/surfaces/projectReadiness/`
- `apps/project-control-center/src/tests/`
- `package.json`
- `packages/models/package.json`
- `backend/functions/package.json`
- `apps/project-control-center/package.json`
