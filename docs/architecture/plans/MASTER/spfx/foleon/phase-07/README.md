# Company Pulse Foleon Reader Lane — Access-Point Model Research Package v3

Date: 2026-04-27

## Purpose

This package supersedes the prior "interactive news reader" framing where that framing implied that HB Central should become a parallel content-management or article-feed system.

The corrected model is:

> Company Pulse, Project Spotlight, and the other Foleon reader lanes are **access points** into Foleon-managed publications. The actual editorial content, visual storytelling, sequencing, article structure, rich media, and publishing lifecycle remain **100% managed in Foleon**.

HB Central should provide a polished, employee-facing launch surface. It should **not** recreate the Foleon publication, fake a multi-article feed, or require Marketing to manage article-level content in SharePoint/HB Intel.

## Updated recommendation

Use the previously reworked **Project Spotlight** lane as the pattern:

- One strong visual access card.
- One primary launch action.
- No inline iframe in the lane.
- No nested card composition.
- No fabricated secondary content.
- Employee-facing copy that explains why the user should open the Foleon publication.
- Foleon remains the destination for the full reading/viewing experience.

For Company Pulse, the recommended pattern is:

> **Company Pulse Edition Launcher** — a media-forward, editorial access surface that summarizes the current Foleon edition and opens the full-window Foleon viewer.

## What changed from the prior package

The earlier package leaned too heavily toward an "Apple-News-style internal news reader." That is now corrected.

The revised design target is not a feed reader. It is a **publication launcher** for a Foleon-managed company update.

## Prompt execution order

1. `PROMPT_CP_01_REPO_TRUTH_AND_PROJECT_SPOTLIGHT_REFERENCE_AUDIT.md`
2. `PROMPT_CP_02_COMPANY_PULSE_ACCESS_POINT_REDESIGN.md`
3. `PROMPT_CP_03_PREVIEW_VIEWER_ACCESS_POINT_COPY_AND_STRUCTURE.md`
4. `PROMPT_CP_04_MANAGER_AND_SCHEMA_SCOPE_CORRECTION.md`
5. `PROMPT_CP_05_VALIDATION_PACKAGE_AND_HOSTED_PROOF.md`

## Phase guidance

### Phase 1 — No schema change
Use the current active Company Pulse record only:
- title;
- summary;
- last editorial update / published date;
- thumbnail or hero image if available;
- archive/display metadata only where employee-facing;
- full-window viewer target.

### Phase 2 — Limited metadata enhancement only
Add only the fields necessary to improve the launch surface:
- edition thumbnail / cover image;
- short teaser / dek;
- label such as "This week's update" or "Current edition";
- optional audience/cadence if useful to employees;
- display window;
- archive grouping.

### Phase 3 — Do not build article management in HB
If Marketing wants multiple stories, sections, video, authoring, and sequencing, that belongs in the Foleon Doc. HB Central should continue to launch the current edition.

## Non-negotiable constraints

- Do not fabricate live secondary stories.
- Do not build a live multi-article Company Pulse feed unless a separate product decision explicitly moves article-level management out of Foleon.
- Do not make category chips appear interactive unless real category-level routing exists.
- Do not weaken Foleon origin policy, iframe policy, preview behavior, or disabled-refusal behavior.
- Do not reintroduce inline iframe rendering into the homepage lane.
- Do not copy Apple News UI.
- Do not create "white cards inside a big colored card" composition.
