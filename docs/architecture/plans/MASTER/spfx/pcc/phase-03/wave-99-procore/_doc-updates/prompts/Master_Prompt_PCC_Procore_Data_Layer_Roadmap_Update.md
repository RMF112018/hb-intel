# Master Prompt — PCC Procore Data Layer Roadmap Documentation Update

## Objective

You are working in the `hb-intel` repo. Execute a documentation-only update that incorporates the Procore data-layer implementation roadmap into the existing PCC Procore Integration Foundation documentation and governing PCC architecture.

Do not re-read files that are still within your current context or memory. If you already inspected a file in this session and no repo changes occurred, use that context and cite it in your closeout.

## Current Context

PCC implementation is progressing through Phase 3 / Wave 13 (`Buyout Log` / `Buyout Control Center`). Treat the Procore data layer as a cross-cutting overlay named Wave 13A-13F, not as a replacement for the active Buyout Log implementation sequence.

## Required Inputs

- This package.
- Current repo truth.
- Current Procore docs/API reference.
- Existing HB Central SharePoint list schemas under `docs/reference/sharepoint/list-schemas/hbcentral/**`.
- Existing PCC Procore Integration Foundation documentation package, if present.
- Current Wave 13 Buyout Log docs and implementation state.

## Required Work

1. Run repo-truth audit.
2. Confirm Wave 13 state.
3. Add the machine-readable Procore data-layer roadmap artifact.
4. Add or update documentation explaining the 13A-13F overlay sequence.
5. Cross-reference governing PCC docs.
6. Preserve all no-runtime/no-writeback/no-mirror/no-secret guardrails.
7. Validate JSON and formatting.
8. Close with evidence.

## Forbidden

No runtime code, no live Procore calls, no dependency install, no package/lockfile mutation, no SDK adoption, no tenant/deployment action.

## Expected Closeout

Return only:

- Commit summary.
- Commit description.
- Files changed.
- Validation commands and results.
- Lockfile MD5 before/after.
- Residual risks.
