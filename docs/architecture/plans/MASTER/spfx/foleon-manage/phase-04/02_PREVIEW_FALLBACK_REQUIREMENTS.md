# 02 — Preview Fallback Requirements

## Feature purpose

When the Foleon app is correctly configured but has no live content to display, render a polished preview of the intended final experience instead of a dead empty state.

This preview is not mock deception. It is an explicit first-run/sample state that tells employees and admins:

- the Foleon integration is configured;
- real content is not available yet;
- this is how the Foleon highlights/archive will look once content is connected;
- no sample item is currently published content.

## Recommended product decisions

| Decision | Recommendation | Rationale |
|---|---|---|
| Control mechanism | Pure runtime condition in first pass | Avoid another property-pane dependency; safest first-run behavior |
| Enabled by default | Yes, only when configured + empty | The fallback solves first-run adoption and avoids dead space |
| Admin-visible indicator | Yes | Managers should understand why public pages show preview/sample content |
| Fixture source | Static TypeScript fixtures | No backend/list dependency; deterministic tests |
| Card rendering | Reuse display primitives, not live action behavior | Maintains visual parity without fake telemetry/routing |
| Card clicks | Disabled or “Preview only” | No fake reader opens |
| Telemetry | No production telemetry for preview content | Prevents analytics contamination |
| Routes | Highlights + Hub; optional Manager guidance | Reader remains hard-gated |
| Versioning | Final bump to `1.0.17.0` | Runtime behavior changes from deployed `1.0.16.0` |

## Required user-facing language

Use plain, visible labels. Recommended labels:

- Badge: `Preview`
- Section eyebrow: `Sample layout`
- Empty/fallback headline: `Foleon content preview`
- Supporting copy: `This is sample content showing how Marketing highlights will appear once Foleon publications are connected.`
- Action label: `Preview only`
- Admin note: `Public pages will show a clearly labeled preview until published Foleon records and active placements are available.`

Avoid:

- `Published`
- `Live`
- `Read`
- `Open`
- `Featured` without preview qualifier
- Foleon URLs that imply real availability
- thumbnails that look like actual project or company photos unless they are approved assets

## Required admin-facing language

The Manager route may include a read-only guidance panel:

> Public Foleon surfaces are configured. Until published Foleon records and active placements exist, Highlights and Content Hub show a clearly labeled preview. The preview does not write records, open readers, or emit production content telemetry.

## When fallback appears

### Highlights route

Show preview fallback when all are true:

- `contract.canInitialize === true`;
- `siteUrl`, `contentRegistryListId`, and `placementsListId` are present;
- placements fetch succeeds;
- content fetch succeeds;
- `materializeHighlights(placements, content)` resolves zero records.

This includes:

- content list exists but is empty;
- placements list exists but no active placements and content is empty;
- active placements exist but no valid published homepage-eligible content resolves and the content fallback is empty.

### Content Hub route

Show preview fallback when all are true:

- `contract.canInitialize === true`;
- `siteUrl` and `contentRegistryListId` are present;
- content fetch succeeds;
- raw live `records.length === 0`.

Do **not** show the full preview fallback when live records exist but the current search/filter returns zero. That is a normal filter no-result state.

### Manager route

Do not replace workflows. Optionally show guidance when loaded content is empty or low confidence.

### Reader route

Do not show a fake iframe. Keep missing `docId` and reader-gate failures as errors/gated states. A static reader preview should require an explicit future product decision.

## When fallback must not appear

Fallback must not appear when:

- `contract.canInitialize === false`;
- required list GUIDs are missing;
- origin allowlist is empty;
- manifest/package governance mismatches block initialization;
- fetch fails due to permissions, network, schema, or invalid GUID;
- reader gate blocks a requested record;
- Hub search/filter returns zero but live records exist;
- Manager backend is blocked or failing;
- `?foleon-diagnostics=1` reveals blocking admin issues.

## Distinguishing empty content from configuration failure

| Condition | UI |
|---|---|
| Missing required config | `FoleonError` with admin-safe messaging |
| Config valid + lists empty | Preview fallback |
| Config valid + fetch error | `FoleonError`; do not preview unless error is explicitly classified as benign first-run empty, which current services do not do |
| Live content present | Live cards/archive |
| Live content present + filter no match | Filter-specific empty state |

## Anti-deception requirements

- Every preview item must be visibly labeled `Preview` or `Sample`.
- Preview cards must not carry real Foleon IDs that could collide with production records.
- Preview records must not use `publishedUrl`, `previewUrl`, or `embedUrl`.
- Preview actions must be disabled or non-routing.
- Preview cards must not emit live `Card Impression`, `Card Click`, `Reader Open`, or `External Open`.
- Preview content must be isolated from SharePoint list reads/writes.
