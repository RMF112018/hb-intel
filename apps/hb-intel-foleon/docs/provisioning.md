# Foleon SharePoint provisioning runbook

Provision the three MVP SharePoint lists the Foleon SPFx webpart
queries at runtime. This runbook is read-only with respect to tenant
state until the final step — every upstream step is inspection or
dry-run.

The canonical field tables live under
`docs/reference/sharepoint/list-schemas/hbcentral/lists/`:

- `hb-foleon-content-registry.md`
- `hb-foleon-homepage-placements.md`
- `hb-foleon-interaction-events.md`

These markdown files mirror the code-level schemas in
`apps/hb-intel-foleon/src/schema/foleonListSchemas.ts`. Both are the
source of truth; drift is caught by
`src/schema/__tests__/foleonListSchemas.test.ts`.

## 1. Pre-flight

- Tenant: `https://hedrickbrotherscom.sharepoint.com`
- Target site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- Required role: SharePoint admin OR site owner on HBCentral
- Required toolchain: `tools/pnp-runner-local/` (same runner already
  used for `priority-actions-band-*` lists)

## 2. Dry-run — print the provisioning plan

Run from repo root:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon provision:print
```

The CLI writes a deterministic JSON plan to stdout. Capture it for
review:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon provision:print \
  > /tmp/foleon-provisioning-plan.json
```

The plan is never written to tenant. Review it against the canonical
markdown reports before proceeding.

## 3. List creation order

Order matters because placements carries a Lookup into the content
registry.

1. `HB_FoleonContentRegistry` — create list, add all fields in the
   plan, mark indexes per `indexes[]`, do NOT populate `MarketingOwner`
   defaults (per-record only).
2. `HB_FoleonHomepagePlacements` — create list, add fields. When
   adding `ContentLookup`, point it at `HB_FoleonContentRegistry`
   created in step 1. Mark all indexes.
3. `HB_FoleonInteractionEvents` — create list, add fields, mark
   indexes. Leave versioning **disabled** for this list (events are
   high-volume).

## 4. Index discipline

Every filter the SPFx runtime pushes hits an indexed column. The app
refuses to build a non-indexed filter at module-init time (see
`assertFiltersAreIndexed` in `foleonListSchemas.ts`). The tenant
indexes you add below mirror that contract:

### `HB_FoleonContentRegistry`

`FoleonDocId`, `FoleonProjectId`, `ContentTypeKey`, `PublishStatus`,
`IsVisible`, `IsFeatured`, `IsHomepageEligible`, `PublishedOn`,
`DisplayFrom`, `DisplayThrough`, `SortRank`, `AllowEmbed`,
`RequiresExternalOpen`, `SyncSource`.

### `HB_FoleonHomepagePlacements`

`PlacementKey`, `ContentIdCache`, `IsActive`, `DisplayFrom`,
`DisplayThrough`, `SortRank`, `LayoutVariant`.

### `HB_FoleonInteractionEvents`

`EventId` (unique), `EventType`, `FoleonDocId`,
`ContentRegistryItemId`, `PageContext`, `EventTimestamp`, `SessionId`.

## 5. Audience groups

`AudienceGroups` on the Content Registry and Placements uses
Person/Group multi-value fields. Point them at the HB Central
Entra/M365 groups — do NOT attempt to bake audience rules into
SharePoint group ACLs. Audience evaluation happens client-side in
the SPFx webpart.

## 6. Preview URL policy

`PreviewUrl` is captured for admin review only. Production readers
reject URLs containing `/preview/` unless the webpart's mount config
carries `allowPreview=true` — a setting reserved for admin-review
builds.

## 7. Wiring into the webpart

After provisioning, record the new list GUIDs and pass them into
`IFoleonMountConfig`:

- `contentRegistryListId`
- `placementsListId`
- `eventsListId`

See the top-level app README "Mount config contract" section for the
full field table.

## 8. Verification

After provisioning, one quick verification round:

- Webpart config carries real list GUIDs → mount publishes a
  runtime binding proof at
  `window.__hbIntel_foleonRuntimeBindingProof` with
  `presence.contentRegistryListId === true` and
  fingerprints populated.
- Add `?foleon-diagnostics=1` to the page URL; admin issue list
  should be empty.
