# Project Spotlight Visual-First Audit and Implementation Package

## Contents

1. `PROJECT_SPOTLIGHT_VISUAL_AUDIT.md`
2. `PROJECT_SPOTLIGHT_LANGUAGE_AUDIT.md`
3. `PROJECT_SPOTLIGHT_VISUAL_LAYOUT_OPTIONS.md`
4. `PROJECT_SPOTLIGHT_IMPLEMENTATION_PLAN.md`
5. `PROJECT_SPOTLIGHT_CODE_AGENT_PROMPT_PACKAGE.md`
6. `PROMPT_PS_01_PROJECT_SPOTLIGHT_VISUAL_AUDIT_AND_DATA_MAPPING.md`
7. `PROMPT_PS_02_PROJECT_SPOTLIGHT_VISUAL_FIRST_LAYOUT_IMPLEMENTATION.md`
8. `PROMPT_PS_03_PROJECT_SPOTLIGHT_MEDIA_SCHEMA_CONTENT_MODEL_FOLLOWUP.md`
9. `PROMPT_PS_04_PROJECT_SPOTLIGHT_VALIDATION_PACKAGE_HOSTED_PROOF.md`

## Recommendation

Proceed with the **Visual Storyboard / Cinematic Hybrid** approach.

The immediate implementation should use existing `FoleonContentRecord` media fields (`heroImageUrl`, `thumbnailUrl`) and employee-facing copy. A later content-model wave should add true gallery/video/caption/alt-text support.

## Execution Order

1. Run PS-01 if the local code agent has not independently confirmed repo truth after the most recent changes.
2. Run PS-02 to implement the visual-first layout.
3. Run PS-04 to validate and package/prove the implementation.
4. Run PS-03 later when HB is ready to extend the Manager/schema/data model for rich media.

## Non-Negotiables

- Preserve full-window viewer behavior.
- Preserve Foleon iframe governance.
- Preserve preview honesty and data honesty.
- Do not fabricate production gallery/video/team/client data.
- Do not reintroduce inline iframe rendering for Project Spotlight.
- Do not touch Company Pulse or Leadership Message unless a shared type/test update is necessary.
