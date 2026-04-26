# Foleon Three-Lane Homepage Development Package

Generated: 2026-04-25T21:34:48+00:00

## Objective

Extend the current Foleon homepage cutover plan from a two-lane model to a **three-lane governed Foleon communications model**:

1. **Project Spotlight** — replaces the existing Project Portfolio Spotlight homepage lane.
2. **Company Pulse** — replaces the existing Company Pulse / Newsroom homepage lane.
3. **Leadership Message** — replaces the existing Message from Leadership homepage lane.

The implementation must preserve homepage shell governance, avoid global Foleon double-mounting, and use the shared Foleon reader architecture already established for the Project Spotlight / Company Pulse split.

## Why this package exists

The previous cutover package only covered two Foleon reader lanes. The new requirement adds a third lane, `Leadership Message`, so the development plan and code-agent prompts must now include:

- reader config;
- schema/choice values;
- tenant provisioning;
- shared package public exports;
- standalone Foleon app alignment;
- homepage shell replacement;
- tests;
- package/version proof;
- tenant rollout.

## Package contents

| File | Purpose |
|---|---|
| `01_CURRENT_STATE_AND_REPO_TRUTH_CONTEXT.md` | Current implementation context and known repo constraints. |
| `02_THREE_LANE_COMMUNICATIONS_TARGET.md` | Target product and architecture model. |
| `03_DATA_MODEL_AND_TENANT_SCHEMA_DELTAS.md` | Schema/choice/tenant deltas required for the Leadership lane. |
| `04_SHARED_PACKAGE_EXTRACTION_PLAN.md` | Shared package extraction plan for all three lanes. |
| `05_STANDALONE_FOLEON_ALIGNMENT_PLAN.md` | Foleon app alignment plan for Leadership route/toolbox support. |
| `06_HOMEPAGE_CUTOVER_PLAN.md` | Homepage shell cutover plan replacing three legacy lanes. |
| `07_UI_BREAKPOINT_PREVIEW_SPEC.md` | Preview, color/tone, breakpoint, and shell fit requirements. |
| `08_TESTING_VALIDATION_PACKAGE_PROOF.md` | Validation matrix and package proof plan. |
| `09_RISK_REGISTER_AND_DECISIONS.md` | Risks, decisions, and hard constraints. |
| `10_EXECUTION_WAVES.md` | Recommended sequencing. |
| `11_PROMPT_01_LEADERSHIP_SCHEMA_AND_TENANT.md` | Code-agent prompt for Leadership schema and tenant provisioning. |
| `12_PROMPT_02_SHARED_READER_PACKAGE.md` | Code-agent prompt for shared reader package extraction. |
| `13_PROMPT_03_STANDALONE_FOLEON_LEADERSHIP_ALIGNMENT.md` | Code-agent prompt for standalone Foleon Leadership route alignment. |
| `14_PROMPT_04_HOMEPAGE_THREE_LANE_CUTOVER.md` | Code-agent prompt for homepage cutover. |
| `15_PROMPT_05_FINAL_DOCS_VERSION_PACKAGE_PROOF.md` | Code-agent prompt for final docs/version/package proof. |
| `16_TENANT_ROLLOUT_RUNBOOK.md` | Tenant rollout checklist. |
| `manifest.json` | Package metadata. |

## Recommended sequence

Do not combine all work into one pass. Execute in governed waves:

1. Leadership lane schema + tenant deltas.
2. Shared reader package extraction.
3. Standalone Foleon app alignment for Leadership.
4. Homepage three-lane cutover.
5. Final docs/version/package proof and tenant rollout.

## Core acceptance target

The existing homepage locations should render:

```text
Project Portfolio Spotlight location → Foleon Project Spotlight
Company Pulse / Newsroom location     → Foleon Company Pulse
Message from Leadership location      → Foleon Leadership Message
```

No Foleon tenant GUIDs may be hardcoded, and the homepage must not mount `window.__hbIntel_foleon` more than once.
