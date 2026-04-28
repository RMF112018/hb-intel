# Project Spotlight Code-Agent Prompt Package

## Package Objective

Guide a local code agent through a repo-truth implementation that converts the Project Spotlight Foleon homepage lane into a media-forward, employee-facing monthly project showcase while preserving the existing full-window viewer, iframe governance, data honesty, shell edge contract, accessibility, and package/version standards.

## Recommended Prompt Sequence

1. `PROMPT_PS_01_PROJECT_SPOTLIGHT_VISUAL_AUDIT_AND_DATA_MAPPING.md`
2. `PROMPT_PS_02_PROJECT_SPOTLIGHT_VISUAL_FIRST_LAYOUT_IMPLEMENTATION.md`
3. `PROMPT_PS_03_PROJECT_SPOTLIGHT_MEDIA_SCHEMA_CONTENT_MODEL_FOLLOWUP.md`
4. `PROMPT_PS_04_PROJECT_SPOTLIGHT_VALIDATION_PACKAGE_HOSTED_PROOF.md`

Run PS-03 only if the team is ready to extend schema/Manager/data model. PS-02 can be executed without PS-03.

## Shared Hard Boundaries

- Do not re-read files that are still within your current context or memory unless needed to verify current repo truth, line-level details, contradictions, dependencies, or drift after changes.
- Use `main` as repo truth at the start of each prompt.
- Do not touch Company Pulse or Leadership Message except shared type/test updates proven necessary.
- Do not change Foleon origin policy, accepted origins, iframe governance, backend sync, or list schema during PS-02.
- Do not fabricate production media or project metadata.
- Do not generate images.
- Do not reintroduce inline iframe rendering for Project Spotlight.
- Do not use global `overflow-x: hidden`.
- Do not rely on raw DOM order for edge behavior.
- Preserve single-interactive-control card-launch accessibility.
- Preserve full-window viewer launch behavior.

## Prompt PS-01 Summary

Perform a final source audit and produce a mapping of current Project Spotlight data, language, media support, launch behavior, tests, and package/version authority. Do not change code.

## Prompt PS-02 Summary

Implement the visual-first layout using existing fields (`heroImageUrl`, `thumbnailUrl`, `summary`, `title`, `issueDate`, `publishedOn`, `region`, `sector`) and employee-facing copy. Update tests and package authority as needed.

## Prompt PS-03 Summary

Design future schema/Manager/data-model support for rich Project Spotlight media: gallery, video, alt text, captions, focal points, credits, and sort order. This is planning or a separate implementation wave, not part of PS-02 unless explicitly approved.

## Prompt PS-04 Summary

Validate source, tests, accessibility, responsive/no-overflow behavior, package proof, hosted proof, and rollback readiness.

## Commit Summary Targets

### PS-01

No commit unless documentation is intentionally added.

```text
Project Spotlight visual-first audit: map media, copy, and viewer contracts
```

### PS-02

```text
HB Homepage: make Project Spotlight a visual-first monthly showcase
```

Description target:

```text
Reworks the Project Spotlight Foleon lane into a media-forward employee-facing monthly showcase using existing record media fields, concise editorial copy, visible CTA, honest preview fallback, and preserved full-window viewer launch behavior. Removes primary metadata/admin labels from the employee UI, keeps data honesty for missing fields, updates layout tests, and maintains Foleon iframe governance.
```

### PS-03

```text
Project Spotlight media model: plan gallery and video content support
```

### PS-04

```text
Project Spotlight visual showcase: validation and package proof
```

## Expected Closure Report Format

Every prompt should close with:

```text
Summary:
<what changed or was found>

Files inspected:
<repo-truth files>

Files changed:
<files changed or "none">

Validation:
<commands run and results>

Package/version proof:
<if applicable>

Hosted proof:
<if applicable>

Risks / remaining gaps:
<open issues>

Commit:
<commit SHA or "not committed">
```


## Source References Reviewed

### Repo truth — current `main`
- `packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx`
- `packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css`
- `packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css.d.ts`
- `packages/foleon-reader/src/readers/FoleonReaderViewModel.ts`
- `packages/foleon-reader/src/readers/FoleonReaderModule.tsx`
- `packages/foleon-reader/src/readers/FoleonReaderLayoutRegistry.tsx`
- `packages/foleon-reader/src/readers/readerConfigs.ts`
- `packages/foleon-reader/src/readers/FoleonViewerTypes.ts`
- `packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx`
- `packages/foleon-reader/src/components/FoleonFullWindowViewerProvider.tsx`
- `packages/foleon-reader/src/types/foleon-content.types.ts`
- `packages/foleon-reader/src/readers/__tests__/ProjectSpotlightReaderLayout.test.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md`
- `docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md`

### External research references
- Microsoft Support — SharePoint News web part layouts and image-heavy news patterns: https://support.microsoft.com/en-us/office/use-the-news-web-part-on-a-sharepoint-page-c2dcee50-f5d7-434b-8cb9-a7feefd9f165
- Microsoft Support — SharePoint modern page image sizing, responsive scaling, image aspect ratios: https://support.microsoft.com/en-us/office/image-sizing-and-scaling-in-sharepoint-modern-pages-dc510065-b5a5-4654-bc94-e3ecbbb57d8d
- Microsoft Learn — Viva Connections card design principles: https://learn.microsoft.com/en-us/sharepoint/dev/spfx/viva/design/designing-card
- Microsoft Learn — Viva Connections design guidance: https://learn.microsoft.com/en-us/sharepoint/dev/spfx/viva/design/design-intro
- Fluent 2 — React Card usage and card anatomy: https://fluent2.microsoft.design/components/web/react/core/card/usage
- Fluent 2 — Accessibility, hierarchy, and navigation guidance: https://fluent2.microsoft.design/accessibility
- Foleon — Embed your Foleon Doc on a website: https://www.foleon.com/knowledge/embed-your-foleon-doc-on-a-website
- Foleon — Embed element behavior and iframe constraints: https://www.foleon.com/migration/knowledge/all-about-the-embed-element
- W3C/WAI — WCAG non-text content: https://w3c.github.io/wcag/understanding/non-text-content.html
- W3C/WAI — Decorative images tutorial: https://www.w3.org/WAI/tutorials/images/decorative/
- W3C/WAI — Link purpose in context: https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context
- Inclusive Components — Cards and pseudo-content clickable-card pattern: https://inclusive-components.design/cards/
