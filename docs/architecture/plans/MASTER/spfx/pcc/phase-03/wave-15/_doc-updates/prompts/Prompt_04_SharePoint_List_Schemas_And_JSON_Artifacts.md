# Prompt 04 — SharePoint List Schemas and JSON Artifacts

## Objective

Add complete proposed SharePoint schemas and validate all JSON artifacts.

## Inputs

- This documentation update package.
- Current repo truth.
- Existing PCC Phase 3 docs.
- HB Central schema reference package.
- Wave 13 Procore data-layer docs.
- Wave 14 Approvals / Checkpoints docs.



## Canonical Documentation Promotion Requirement

Do not leave this package as a standalone reference-only bundle. Promote, copy, split, or merge the package contents into the appropriate canonical repo documentation locations.

At minimum:

1. Create or update `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/`.
2. Create or update `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/`.
3. Promote all target architecture, system-of-record, field contract, storage/indexing, security, HBI, validation, dependency, role-action, launcher workflow, and UX guidance into canonical Wave 15 blueprint docs.
4. Promote all wireframes into `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/`.
5. Promote all machine-readable JSON artifacts into `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/`.
6. Promote all prompt files into `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/prompts/`.
7. Promote research/repo-truth reference notes into `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/reference/`.
8. Update HB Central schema references where applicable:
   - `docs/reference/sharepoint/list-schemas/hbcentral/README.md`
   - `docs/reference/sharepoint/list-schemas/hbcentral/List-Map.md`
9. Add or update ADRs in `docs/architecture/adr/` or the repo's canonical ADR-equivalent location rather than leaving decisions only inside the package.
10. Closeout must prove each package artifact was promoted, merged, split, or intentionally retained as package-only reference with a stated reason.

Use `docs/19_Artifact_Placement_And_Canonical_Docs_Promotion_Map.md` and `artifacts/artifact_placement_map.json` as the binding checklist.

## Rules

- Do not re-read files that remain in your current context or memory.
- Do not mutate runtime source unless a later implementation prompt explicitly authorizes it.
- Do not change `package.json` or `pnpm-lock.yaml`.
- Validate all JSON touched.
- Run Prettier on touched markdown/json.
- Produce closeout with evidence.
