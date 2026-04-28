# Foleon Preview Fallback Full-Window Viewer Package

## Purpose

This package audits the current Foleon reader preview fallback behavior and provides an implementation plan plus local code-agent prompts to make preview article cards open the full-window viewer shell.

The target behavior is:

```text
Ready record:
  opens the full-window viewer with governed Foleon iframe content.

Preview fallback:
  opens the same full-window viewer shell with local React preview content.
  It does not load an iframe, does not fake live Foleon content, and does not weaken origin policy.
```

## Package contents

1. `README.md`
2. `LATEST_REPO_AUDIT.md`
3. `IMPLEMENTATION_PLAN.md`
4. `VIEWER_TARGET_CONTRACT_DECISION.md`
5. `TEST_VALIDATION_AND_PACKAGE_PROOF_PLAN.md`
6. `PROMPT_PFV_01_REPO_TRUTH_AUDIT_AND_CONTRACT_DECISION.md`
7. `PROMPT_PFV_02_IMPLEMENT_PREVIEW_VIEWER_TARGET_AND_RENDERER.md`
8. `PROMPT_PFV_03_UPDATE_LANE_LAYOUTS_AND_TESTS.md`
9. `PROMPT_PFV_04_VALIDATION_PACKAGE_AND_HOSTED_PROOF.md`

## Recommended execution sequence

1. Run PFV-01 only if the local agent needs to re-confirm repo truth after newer commits.
2. Run PFV-02 to introduce the openable preview target model and local preview renderer.
3. Run PFV-03 to update all preview article-card layouts and tests.
4. Run PFV-04 to validate package/version proof and hosted behavior.

## Core recommendation

Make preview targets openable through a distinct preview mode, not by relaxing iframe rules.

Recommended target model:

```ts
export type FoleonViewerRenderMode = 'iframe' | 'preview';
```

- `iframe`: governed live Foleon iframe; requires `viewerUrl`, `allowEmbed`, and accepted origin policy.
- `preview`: local React preview content; no iframe, no origin-policy change, no live Foleon URL required.

## Non-negotiables

- Do not use a raw iframe for preview.
- Do not make preview look like live Foleon content.
- Do not weaken accepted-origin or iframe governance.
- Do not change backend sync or SharePoint/Foleon list schemas.
- Preserve the full-window viewer provider, close behavior, focus restore, Escape close, and overlay semantics.
- Preserve structured refusal markers for truly disabled ready-state targets.
- Do not preserve `aria-disabled` on preview cards once they become openable.
