# Prompt 05 — Reduce visible metadata burden with progressive disclosure

## Objective

Reduce author friction by tightening the primary metadata path, leaning harder on smart defaults, and moving low-frequency or advanced controls behind clearer progressive-disclosure patterns.

## Why this issue matters

The live repo already contains meaningful defaulting work in `metadataDefaults.ts`, and `MetadataPanel.tsx` already opportunistically fills `TeamViewerTitle` on project selection. That is the right direction.

But the current product still exposes more visible authoring surface than the primary path should require. The result is unnecessary cognitive load in a tool whose stated product goal is lower-friction publishing.

## Current repo-truth problem state

The narrowed audit found that metadata/defaulting/disclosure behavior now spans more files than the attached package acknowledged.

At minimum:

- `MetadataPanel.tsx` controls the identity path
- `TeamPresentationPanel.tsx` still exposes multiple low-frequency team-presentation controls directly in the primary form surface
- `HeroPanel.tsx` contains `HeroCategoryLabel`, which now participates in intelligent defaulting through `metadataDefaults.ts`
- `ArticlePublisher.tsx` shapes the section model that determines what is visibly first-class vs secondary

The attached Wave 02 package under-scoped this by omitting `HeroPanel.tsx` and by not forcing a stronger progressive-disclosure posture.

## Intended future state

The primary authoring path should foreground only the fields authors usually need to touch.

Low-frequency, advanced, or situational controls should still be available, but they should no longer compete visually with the primary flow unless there is a clear product reason.

Smart defaults should reduce visible busywork without silently overriding author intent.

## Governing authority / required reference docs

- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/MetadataPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/HeroPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/TeamPresentationPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/metadataDefaults.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- this package’s `Validation-Strategy.md`

## Exact repo files and seams to inspect

At minimum inspect:

- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/MetadataPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/HeroPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/TeamPresentationPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/metadataDefaults.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- any affected shared field/chooser/button primitives
- any CSS/modules needed for disclosure and collapsed advanced controls

## Required implementation outcome

- Preserve current intelligent defaults and strengthen their practical value where appropriate.
- Ensure defaults only fill blank fields; do not overwrite author-entered values.
- Reduce the visible metadata burden on the main authoring path.
- Introduce clearer progressive disclosure for low-frequency or advanced controls where the current UI still overexposes them.
- Include `HeroPanel.tsx` in the closure analysis; do not treat metadata simplification as only a metadata/team issue.
- Keep the resulting UI understandable inside the existing section-based canvas.

## Validation / proof-of-closure requirements

Prove all of the following:

- primary-path visible metadata surface is meaningfully reduced or better prioritized
- smart defaults still behave safely and do not overwrite explicit author values
- hidden/disclosed advanced controls remain discoverable and keyboard-usable
- hero/team metadata fields that rely on defaults or disclosure still save and reload correctly
- no regression was introduced into the authoring section model
- any tests needed for defaulting/disclosure behavior were added or updated

## Deliverables / closure notes to create

Create:

- `docs/architecture/reviews/publisher/wave-02-metadata-disclosure-closure.md`

Document:

- which controls were moved behind disclosure and why
- what defaults were preserved or strengthened
- which panels became meaningfully lighter on the primary path
- what regression checks were performed

## Required working method

Before you edit anything:

1. Scrub metadata/defaulting/disclosure as one seam, not as isolated files.
2. Verify drift in panel fields, defaulting hooks, and section layout assumptions.
3. Do **not** re-read files still in active context unless needed to confirm drift or uncertainty after changes.
4. Preserve author intent and data truth.
5. Prove closure before moving on.

## Explicit instruction not to make unrelated changes

Do not broaden this into a whole-shell redesign. Keep the work bounded to metadata burden reduction, smart defaults, and progressive disclosure in the identified seams.
