# PROMPT PFV-03 — Update Lane Layouts and Preview Interaction Tests

You are working in the `RMF112018/hb-intel` repository after PFV-02.

## Objective

Update Project Spotlight, Company Pulse, and Leadership Message preview card behavior so preview article cards open the full-window preview viewer instead of being blocked, while preserving disabled/refusal behavior for true ready-state failures.

## Critical instruction

Do not re-read files that are still within your current context or memory unless needed to verify current repo truth, line-level details, contradictions, dependency behavior, or drift after changes.

## Files likely to change

```text
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx
packages/foleon-reader/src/readers/__tests__/ProjectSpotlightReaderLayout.test.tsx
packages/foleon-reader/src/readers/__tests__/FoleonReaderModule.test.tsx
packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts
```

## Implementation rules

Because PFV-02 changed preview targets to `canOpen: true`, the layouts should naturally become clickable if they only use:

```ts
const isDisabled = !target.canOpen;
```

Confirm each layout:

- does not separately block `viewModel.state === 'preview'`;
- does not force `aria-disabled` for preview;
- still renders `data-foleon-article-state="preview"` for preview state;
- still writes `data-foleon-article-last-refusal` only when `viewer.openViewer` returns refusal or target is truly disabled.

## Required behavior

### Preview cards

- open full-window preview viewer on click;
- open full-window preview viewer on keyboard activation;
- do not have `aria-disabled`;
- do not set last-refusal marker on successful preview open;
- keep visible preview label/copy.

### Ready enabled cards

- unchanged;
- open governed iframe viewer.

### Ready disabled cards

- unchanged;
- blocked with visible reason;
- `aria-disabled` present;
- `aria-describedby` points to visible status;
- refusal marker is written on click.

## Test requirements

Update/add tests proving:

- Project Spotlight preview card opens preview viewer.
- Company Pulse preview card opens preview viewer.
- Leadership Message preview card opens preview viewer.
- Preview viewer contains no iframe.
- Preview viewer uses `data-foleon-viewer-source="preview"`.
- Preview cards are not aria-disabled.
- Ready disabled records still refuse and do not open the viewer.
- `data-foleon-article-state="preview"` remains.
- Single interactive control pattern remains.

## Important test correction

Do not delete the concept of structured refusal. Move preview out of the refusal category, but keep structured refusal tests for:

- `no-embed-url`
- `embed-not-allowed`
- `requires-external-open`
- `unknown` / no provider as applicable

## Validation

Run:

```bash
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
```

If homepage tests assert old preview behavior, update and run:

```bash
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage
```

## Do not

- Do not change origin policy.
- Do not add inline iframe.
- Do not add multiple interactive controls inside cards.
- Do not fabricate live content.
- Do not touch unrelated homepage shell layout.
