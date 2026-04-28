# Prompt 02 — Rebuild Leadership Message Layout

## Objective

Rebuild `LeadershipMessageReaderLayout` into a polished Executive Briefing Feature: calm, credible, editorial, concise, and clearly an access point into a Foleon-managed leadership message.

Do not implement a fake article body. Do not weaken full-window viewer behavior.

Do not re-read files that are still within your current context or memory unless needed to verify repo truth or resolve a contradiction.

## Files to inspect

```text
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css.d.ts
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/components/FoleonFullWindowViewerProvider.tsx
packages/foleon-reader/src/readers/__tests__/LeadershipMessageReaderLayout.test.tsx
docs/architecture/plans/MASTER/spfx/foleon-reader/leadership-message-reader-rescue/05_RECOMMENDED_LAYOUT_CONCEPTS.md
docs/architecture/plans/MASTER/spfx/foleon-reader/leadership-message-reader-rescue/06_TARGET_INFORMATION_ARCHITECTURE.md
docs/architecture/plans/MASTER/spfx/foleon-reader/leadership-message-reader-rescue/07_WIREFRAMES_AND_STATES.md
```

## Files likely to change

```text
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css.d.ts
packages/foleon-reader/src/readers/__tests__/LeadershipMessageReaderLayout.test.tsx
```

Optional if preferred and supported:

```text
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.module.css
```

## Guardrails

- Preserve `data-foleon-reader-layout="leadership-message"`.
- Preserve `data-foleon-reader-lane="leadershipMessage"`.
- Preserve viewer target/refusal markers or replace only with equivalent testable markers.
- Keep no-inline-iframe posture.
- Preserve origin policy and provider behavior.
- Do not change Project Spotlight or Company Pulse layout files unless required by shared type updates.
- Do not use fake executive identity.

## Steps

1. Replace the current loose stack with the Executive Briefing Feature:
   - source/status row;
   - headline;
   - summary;
   - visible CTA;
   - optional real source/identity;
   - optional real pull quote;
   - restrained context chips.
2. Remove message body rendering. Use summary as teaser only.
3. Add visible CTA label tied to the normalized CTA model.
4. Ensure live, preview, no-live, external-only, and blocked states have distinct copy.
5. Keep disabled reason visible and associated via `aria-describedby`.
6. Ensure no nested interactive controls.
7. Implement premium but restrained CSS:
   - no generic thin bordered card as dominant posture;
   - controlled line length;
   - calm executive surface;
   - responsive stacking;
   - visible CTA.
8. Update tests to assert employee-facing copy and forbidden string absence.

## Tests

Run:

```bash
pnpm --filter @hbc/foleon-reader test -- LeadershipMessageReaderLayout
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
```

## Acceptance criteria

- DOM does not contain:
  - `Leadership Message reader`
  - `Leadership Message Reader`
  - `Sample executive byline`
  - `Sample role`
  - `Sample pull quote`
  - `Sample message body`
  - `Sample audience`
  - `Cadence`
  - `Archive group`
  - `Executive byline not provided.`
- Live state has visible CTA.
- Preview state has preview-safe copy.
- Blocked/external states are clear.
- No inline iframe.
- Viewer launch still works.
- Sibling lane tests remain green.

## Commit message

```text
Foleon reader: redesign Leadership Message as executive briefing feature

Replaces the text-stack Leadership Message layout with a calm executive-grade access point to Foleon-managed content, adding visible CTA/state treatment, restrained context, and production-safe copy while preserving the full-window viewer contract.
```
