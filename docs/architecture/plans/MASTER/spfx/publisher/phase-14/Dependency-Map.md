# Wave 01 Dependency Map — Structural Redesign Edition

## Primary seams

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/`
- `apps/hb-publisher/src/webparts/articlePublisher/workspace/`
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/`
- `apps/hb-publisher/src/webparts/articlePublisher/teamComposer/`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/`
- `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/`
- `apps/hb-publisher/src/webparts/articlePublisher/readinessSurface/`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/`

## Hidden dependencies the baseline package underplayed

### 1. The repo already contains a stronger Wave 01 package under phase-12
Use it as repo-truth context, not as a ceiling. This package deliberately pushes that package toward a harder structural-redesign posture.

### 2. Project identity is authoritative and must remain lookup-driven
No prompt may reintroduce manual `ProjectId` / `ProjectName` entry.

### 3. Preview and readiness are controller-owned
They may be visually and structurally recomposed, but do not casually collapse the controller boundary.

### 4. Team and media invariants already exist
Featured exclusivity and sort-order restamping must survive structural redesign.

### 5. Rich text already exists
The editor itself is present; the surrounding experience and toolbar quality are what remain under-premium.

### 6. Media authoring is still structurally weak
The live repo still exposes raw URL-first media input in hero and gallery seams. That is a structural product issue, not a copy or styling issue.

### 7. Shared chrome and tokens exist but are not yet enough
Do not bypass them with ad hoc feature-level styling. Either extend them deliberately or replace weak surface composition through governed primitives.
