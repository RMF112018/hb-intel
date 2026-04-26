# Testing, Validation, and Package Proof Plan

## Required Test Areas

### Schema / Types

- New content type choices exist.
- New reader key choices exist.
- New placement key choices exist.
- Public select remains scalar-safe.
- Filter-safe fields are indexed/provisioned.
- Feature Framework XML matches schema constants.
- Backend DTO fields match frontend management types.

### Public Services

- Project Spotlight query returns one active public-ready record.
- Company Pulse query returns one active public-ready record.
- Missing record returns preview resolution.
- Real blocked record returns blocked state, not preview.
- Public service does not select `MarketingOwner` or `AudienceGroups`.
- Public filters use only indexed/filter-safe fields.

### Reader Module

- Project Spotlight renders correct title, metadata, iframe, and archive affordance.
- Company Pulse renders correct title, update metadata, iframe, and archive affordance.
- Mobile/collapsed behavior does not mount iframe until activated.
- `FoleonIframeHost` remains shared.
- `evaluateFoleonReaderGate` remains shared.

### Telemetry

- Reader Open/Close emits with correct route/context.
- External Open emits only for real records.
- Preview states emit no production content telemetry.
- Search/archive telemetry remains minimal and redacted.

### Manager

- New fields load from backend.
- New fields save to backend.
- Presets only update local draft until save.
- Active edition warnings work.
- Placement/content lane alignment warnings work.
- Existing workflows still render.

### Preview

- Project Spotlight empty-ready renders preview.
- Company Pulse empty-ready renders preview.
- Config/fetch errors render errors, not preview.
- Real blocked record renders blocked state, not preview.

## Validation Commands

Frontend package:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

Backend package:

```bash
pnpm --filter <backend-functions-filter> check-types
pnpm --filter <backend-functions-filter> test
```

Use the actual backend filter from repo truth.

SPFx shell bridge:

```bash
npx tsx tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts
pnpm --dir tools/spfx-shell build
```

Packaging:

```bash
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
```

## Versioning

Final wave should bump:

```text
1.0.17.0 → 1.0.18.0
```

Update all version-bearing files validated by package proof.

## Tenant Validation

After deployment:

1. Confirm runtime proof:
   - `packageVersion: "1.0.18.0"`
   - `canInitialize: true`
   - `issueCodes: []`
   - package version match true.
2. Confirm both toolbox entries are available.
3. Add Project Spotlight reader to a test page.
4. Add Company Pulse reader to a test page.
5. Validate preview states when no active content exists.
6. Add/publish active records and placements.
7. Confirm iframes render.
8. Validate mobile collapsed behavior.
9. Validate Manager reads/writes new fields.
10. Validate archive behavior.
