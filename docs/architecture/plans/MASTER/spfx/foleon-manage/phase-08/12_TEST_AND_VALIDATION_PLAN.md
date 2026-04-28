# 12 — Test and Validation Plan

## Unit / Component Tests

Add or update tests for:

1. Four workspace nav entries: Feed Desk, Schedule, Preview, Admin.
2. Feed Desk is default.
3. Lane Board is not a primary nav entry.
4. Feed slots render inside Feed Desk.
5. Editorial queue renders as table/list with filters/search.
6. Selecting a queue row opens/selects inspector.
7. Inspector has placement, schedule, preview, readiness sections.
8. OAuth blocked state shows setup guidance and Open Admin CTA.
9. No content state shows setup/sync guidance, not empty buckets.
10. Schedule groups active/upcoming/missing window/expired/blocked.
11. Preview does not iframe if governed preview route is unavailable.
12. Admin still renders readiness and diagnostics.
13. Token-degraded copy remains sanitized.
14. Redacted diagnostics proof remains redacted.
15. Write-path gating remains enforced.
16. Manager-only canvas attribute remains absent from reader/highlight/embed routes.

## CSS / Structural Tests

Avoid brittle class tests, but add stable structural assertions:

- root has app marker,
- top-level nav keys are expected,
- no rendered primary nav tab named `Lane Board`,
- feed slot cards exist inside Feed Desk,
- queue role/table/list exists,
- inspector complementary/dialog region exists depending layout.

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

## Do Not Claim

Do not claim hosted proof until tenant screenshots are provided.

