# P01 — Repo Truth and Live Field Resolution

## Objective

Confirm the exact People & Culture implementation seam in repo truth, resolve the real SharePoint list identities and field internal names from the live `HBCentral` site, and write down the final field map before coding.

## Scope

Work only in the People & Culture homepage surface and the minimum adjacent homepage data files required to implement live-list-first behavior.

Do **not** broaden this into unrelated homepage refactoring.

## Operating instructions

- Work from repo truth.
- Do **not** reread files already in your current context unless needed to verify drift.
- The People & Culture site host is:

```text
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
```

- The premium UI direction in `PeopleCultureMerged.tsx` is already materially present. Treat the missing live-list seam as the primary implementation gap.
- Do not trust the CSV exports blindly where they appear malformed.
- Resolve actual field metadata from SharePoint before locking `$select` names.

## Repo-truth files to inspect

### People & Culture
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureWebPart.manifest.json`

### Existing contracts / normalizers
- `apps/hb-webparts/src/homepage/helpers/communicationsConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts`

### Existing list-source pattern
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`
- `apps/hb-webparts/src/homepage/data/useProjectSpotlightData.ts`
- `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts`
- `apps/hb-webparts/src/homepage/data/spContext.ts`
- `apps/hb-webparts/src/mount.tsx`

## Required live metadata work

For each intended list, query the live field metadata from SharePoint first.

Use the site-relative REST pattern:

```text
/_api/web/lists/getbytitle('<LIST TITLE>')/fields?$select=Title,InternalName,StaticName,EntityPropertyName,TypeAsString,Hidden,ReadOnlyField
```

If a list title is uncertain, resolve it first by enumerating lists and matching on likely titles.

Recommended list-discovery endpoint:

```text
/_api/web/lists?$select=Title,Id,Hidden,RootFolder/ServerRelativeUrl&$expand=RootFolder
```

## Intended lists

### Confirmed
- `People Culture Kudos`
- `People Culture Announcements1`

### Must be resolved live
The uploaded `People Culture Celebrations.csv` is inconsistent with the user-provided URL. Find the actual live celebrations list title / URL before wiring the adapter.

## Required output before coding

Produce a short implementation note inside your working notes that confirms:

1. final resolved list titles
2. final resolved internal names for all fields the adapter will query
3. which exported CSV assumptions were wrong
4. whether a dedicated kudos status field exists live
5. whether celebrations has a real `HomepageEnabled` field or the export is malformed

## Specific schema issues to verify

### Announcements
- confirm the real internal name behind display field `PublishDate`
- confirm `AnnouncementPerson` person expansion path
- confirm thumbnail field behavior for `PrimaryImage`

### Kudos
- confirm whether `Status` exists live; do not assume
- confirm the internal names for taxonomy recipient fields
- confirm whether thumbnail field returns a JSON string or a modern thumbnail object

### Celebrations
- resolve actual list title
- confirm whether `PersonName` is `UserMulti`
- confirm whether the boolean field is actually `HomepageEnabled`
- confirm the exact internal name for the ID column even though the export shows `AnnouncementId`

## Acceptance criteria

- final list titles known
- final field internal names known
- metadata mismatches documented
- coding can proceed without guessing display names as internal names
