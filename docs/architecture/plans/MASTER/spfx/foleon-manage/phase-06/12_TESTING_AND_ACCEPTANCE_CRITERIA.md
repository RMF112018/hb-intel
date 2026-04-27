# 12 — Testing and Acceptance Criteria

## Test Targets

Primary test file likely:

- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`

Add focused unit tests for view-model helpers if component tests become too broad:

- `manageLaneViewModel`
- `manageConfigViewModel`

## Validation Commands

Run, as repo tooling allows:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
```

If shell/runtime bridge is touched:

```bash
npx tsx tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts
```

If package proof is part of the final source-changing wave:

```bash
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

Use Node 18 where SPFx tooling requires it. If Node 22 blocks SPFx build, document the limitation and run all available tests/checks.

## Marketing User Acceptance

- A marketing user can immediately identify the status of:
  - Project Spotlight;
  - Company Pulse;
  - Leadership Message.
- A marketing user can understand what needs action without reading technical readiness cards.
- A marketing user can review or edit content from a clear lane-focused workflow.
- Disabled actions explain the blocker in plain language.
- The content library remains reachable but does not dominate the first view.
- Preview, live, blocked, empty, and needs-setup lane states are visually distinct and clearly labeled.

## Admin Acceptance

- Admin can identify:
  - API approval status;
  - registry status;
  - backend status;
  - SharePoint list status;
  - package/version status;
  - read/write/sync readiness.
- Required admin actions are ranked by urgency/impact.
- Config tab feels like an admin console, not a raw debug page.
- Diagnostics are accessible, collapsed by default, redacted, and copyable.
- Split readiness states remain intact.

## Visual Acceptance

- App no longer looks like a stack of raw diagnostic containers.
- Header, tabs, cards, banners, and tables have clear hierarchy.
- Default view is useful even when API consent is missing.
- UI fits within SharePoint page constraints without feeling cramped or unfinished.
- Raw technical tables are not above the fold.
- Primary actions are limited and obvious.

## Technical Acceptance

- Existing registry/readiness/backend architecture is preserved.
- No new backend route is introduced unless justified by repo truth.
- No raw secrets/tokens/backend URLs/API resources/list GUIDs are shown in primary UI.
- API consent missing does not hard-block the entire app.
- Read-only mode remains usable.
- Tests cover degraded rendering and disabled actions.
- Package/version changes are made only when shipped source behavior changes.

## Accessibility Acceptance

- Tabs are keyboard accessible.
- Focus-visible styles are clear.
- Statuses do not rely on color only.
- Warning/error messaging does not over-announce.
- Disabled actions have accessible reasons.
- Drawer/panel focus management is correct.
- No horizontal overflow at narrow widths.

## Regression Tests to Add/Update

- Homepage Foleon Content tab is selected by default.
- Three lane cards render.
- Lane cards render live/preview/blocked/empty/needs-setup states.
- Existing editor/placement/publish/suppress/sync workflows remain reachable.
- Write actions are disabled when `writePathReady !== true`.
- Disabled actions expose reason text.
- Config renders grouped split-readiness states.
- Config diagnostics are collapsed by default.
- Unsafe raw values do not render in primary UI.
- API consent missing renders controlled limited mode.
- `apiBaseUrl` alone and missing backend safe-config/route authorization do not falsely display write readiness.
