# 12 — Test and Validation Plan

## Unit / Component Coverage

Add or update tests for:

- Header readiness states.
- Content inbox filtering and sorting.
- Lane board live/staged/blocked/empty states.
- Placement workflow happy path.
- Placement blocked path.
- OAuth missing limited mode.
- Graph/list configured but Foleon OAuth missing.
- Authorization failure.
- Backend unavailable.
- Preview mode selection.
- Keyboard navigation across inbox, lane board, workflow, and preview.
- Disabled action explanations.

## Required Commands

```bash
git status --short
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
pnpm --filter @hbc/spfx-hb-intel-foleon build
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

## Accessibility Validation

- Tab through all primary paths.
- Arrow-key through list/board controls.
- Verify `Enter` activates controls.
- Verify `Escape` exits panels/previews.
- Verify focus restoration after closing preview/workflow panels.
- Verify hidden panels do not contain focusable descendants.
- Verify `prefers-reduced-motion` disables nonessential motion.
- Test with Narrator + Edge at minimum.

## Visual Validation

Capture:

- Desktop 100%.
- Desktop/wide 75%.
- Tablet/narrow.
- Short-height.
- Content inbox.
- Lane board.
- Placement workflow.
- Preview.
- Config/Admin.
- OAuth missing.
- Empty content.

## Runtime Validation

- `/api/foleon/config` network proof.
- Content and placement read proof.
- Sync blocked/ready proof.
- Loaded JS/CSS asset proof.
- Package version proof.
- Runtime proof object if available.
