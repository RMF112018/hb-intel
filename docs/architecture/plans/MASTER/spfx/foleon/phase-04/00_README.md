# Foleon Homepage Reader Composition Audit Package v2

Date: 2026-04-26  
Repo: `RMF112018/hb-intel`  
Branch authority: `main`  
Scope: `hb-intel-homepage.sppkg`, embedded Foleon reader lanes, preview fallback composition, production reader composition, and edge-to-window shell integration.

## Why this v2 package exists

This package regenerates the prior audit package with:

1. A dedicated screenshot-context file using the newly supplied Project Spotlight, Company Pulse, and Leadership Message homepage screenshots.
2. A stronger position on whether shell styling is required for edge-to-window behavior.
3. A separate markdown file for each implementation prompt so the local code agent can execute the work in controlled passes instead of receiving one monolithic instruction file.
4. Expanded edge-to-window scope covering both:
   - post-hero shell/Foleon reader lanes; and
   - hero / entry-stack / SPFx wrapper behavior.

## Package Contents

### Audit and Design Files

- `01_FOLEON_READER_COMPOSITION_AUDIT.md`
- `02_SCREENSHOT_CONTEXT_AND_DESIGN_FINDINGS.md`
- `03_FOLEON_READER_LAYOUT_RESEARCH.md`
- `04_LANE_SPECIFIC_LAYOUT_PROPOSALS.md`
- `05_EDGE_TO_WINDOW_SHELL_INTEGRATION_PLAN.md`
- `06_RECOMMENDED_IMPLEMENTATION_PLAN.md`

### Prompt Files

Each prompt is its own file under `/prompts`:

- `PROMPT_00_REPO_TRUTH_SCREENSHOT_BASELINE.md`
- `PROMPT_01_SHELL_EDGE_TO_WINDOW_CONTRACT_HERO_AND_POST_HERO.md`
- `PROMPT_02_SHARED_VIEW_MODEL_AND_LAYOUT_REGISTRY.md`
- `PROMPT_03_PROJECT_SPOTLIGHT_READER_LAYOUT.md`
- `PROMPT_04_COMPANY_PULSE_READER_LAYOUT.md`
- `PROMPT_05_LEADERSHIP_MESSAGE_READER_LAYOUT.md`
- `PROMPT_06_TESTING_PACKAGE_AND_HOSTED_PROOF.md`
- `PROMPT_07_FINAL_AUDIT_CLOSURE.md`

### Screenshots

The supplied screenshots are included under `/screenshots`:

- `project_spotlight_preview_context.png`
- `company_pulse_preview_context.png`
- `leadership_message_preview_context.png`

## Bottom-Line Recommendation

Use a hybrid layout registry:

```ts
const FOLEON_READER_LAYOUTS = {
  projectSpotlight: ProjectSpotlightReaderLayout,
  companyPulse: CompanyPulseReaderLayout,
  leadershipMessage: LeadershipMessageReaderLayout,
};
```

Each layout should consume a normalized reader view model. Preview and production should share the same lane-specific composition frame.

## Edge-to-Window Position

Yes — to allow the hero and the three Foleon readers to reach the browser/window edge with no visible padding, a modification above the reader components is required.

For the three Foleon readers, the key modification belongs in the homepage shell and slot contract because the shell owns post-hero placement, band pairing, padding, and grid orientation.

For the hero, the key modification likely belongs in the SPFx wrapper / entry stack / hero host layer rather than in `HbHomepageShell.tsx`, because `HbHomepageShell` is the post-hero operating layer. The agent must audit the hero mount path before applying changes.

Do not attempt to solve edge-to-window behavior solely inside `FoleonReaderModule.module.css`; that can remove internal card chrome but cannot safely eliminate shell, SPFx, SharePoint canvas, or page-section padding.
