# 09 — Implementation Prompt Package README

## Sequence

Use these prompts in order:

1. `10_PROMPT_01_PREVIEW_MODEL_AND_FIXTURES.md`
2. `11_PROMPT_02_HIGHLIGHTS_PREVIEW_FALLBACK.md`
3. `12_PROMPT_03_CONTENT_HUB_PREVIEW_FALLBACK.md`
4. `13_PROMPT_04_MANAGER_PREVIEW_GUIDANCE.md`
5. `14_PROMPT_05_TESTS_DOCS_AND_PACKAGE_PROOF.md`

## Why this sequence

- Prompt 01 creates isolated data/model safety before UI wiring.
- Prompt 02 proves the public homepage fallback.
- Prompt 03 handles the archive route and distinct filter-empty logic.
- Prompt 04 adds admin clarity without disturbing workflows.
- Prompt 05 handles full validation, docs, versioning, and package proof.

## Shared boundaries

All prompts preserve:

- Foleon runtime contract and redacted proof;
- SPFx property pane bridge behavior;
- existing safe defaults;
- Reader gate integrity;
- backend-only write workflow for Manager;
- SharePoint list schema/provisioning assets unless explicitly proven necessary.

## Final target

One feature branch can ship as package version `1.0.17.0`.
