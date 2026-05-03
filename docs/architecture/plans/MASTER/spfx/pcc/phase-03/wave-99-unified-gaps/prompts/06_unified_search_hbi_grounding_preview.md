# Prompt 06 — Add Unified Project Search / Ask-HBI Grounding Preview

## Objective

Implement a preview-safe unified project search / Ask-HBI grounding experience inside the existing PCC shell. The goal is to demonstrate how PCC will answer project questions using source-lineage-backed records without treating HBI output as source truth.

This must be a fixture-backed preview. Do not integrate a live LLM, vector database, Graph Search, Procore search, Sage, CRM, or external system in this prompt.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Context Handling

Do not re-read files still in current context or memory. Re-open only the relevant unified search doctrine, backend route, SPFx client, fixtures, surfaces, and tests required to verify repo truth.

## Source Docs

Use:

- `docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`

## Required UX Behavior

Add a compact unified project search / Ask-HBI preview surface or panel within the existing PCC shell. It may be hosted in Project Home or a shell-level panel, but it must not become a standalone department-specific workspace.

The preview must demonstrate safe answers to questions like:

- What did estimating assume for this scope?
- Who installed this product?
- Which submittal approved this material?
- Was this warranty issue tied to a subcontractor scope?
- Have we done this detail before?

The UI must show:

- search query input or predefined sample queries;
- answer/result fragments;
- source citations/source record chips;
- lifecycle stage context;
- source system/source ownership;
- confidence/evidence posture;
- redaction/permission messaging;
- insufficient-evidence messaging where applicable.

## Required Data Behavior

Use the unified search read model/client added in earlier prompts.

The preview must not invent unsupported conclusions. When fixture data lacks evidence, it must state that the answer cannot be concluded from available source records.

## Required Acceptance Criteria

- HBI/search answers are not presented as source truth.
- Every answer fragment has source/citation metadata or is explicitly marked as insufficient evidence.
- Restricted records are redacted or omitted according to fixture metadata.
- The search experience is project-scoped by default.
- Cross-project references are clearly labeled and permission-aware.
- The UI stays inside the existing PCC shell.
- No live LLM/search/external integrations are introduced.

## Tests

Add/update tests to prove:

- predefined/search result rendering works from fixtures;
- every rendered answer fragment includes citation/source cues;
- insufficient-evidence answer state renders correctly;
- restricted records do not expose content;
- search stays project-scoped;
- no separate workspace route is introduced.

## Constraints

- No live LLM.
- No vector database.
- No live Graph/Procore/Sage/CRM/Autodesk search.
- No tenant mutation.
- No dependency changes.
- No lockfile change.
- No broad shell redesign.

## Validation

Run:

```bash
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test
pnpm --filter @hbc/functions test
md5 pnpm-lock.yaml
```

If scripts differ, inspect package scripts and run closest equivalents.

## Required Response

Return:

1. Search/HBI preview files changed.
2. Safe grounding behavior implemented.
3. Tests added/updated.
4. Validation results.
5. Lockfile MD5 before/after.
6. Remaining gaps passed to Prompt 07.
