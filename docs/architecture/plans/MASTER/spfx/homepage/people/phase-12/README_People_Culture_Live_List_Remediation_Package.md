# People & Culture Live List Remediation Prompt Package

This package turns the uploaded objective into a repo-truth, code-agent-ready implementation plan for the People & Culture homepage webpart in `RMF112018/hb-intel`.

## Package contents

- `README_People_Culture_Live_List_Remediation_Package.md`
- `People_Culture_Live_List_Remediation_Summary.md`
- `P01_Repo_Truth_and_Live_Field_Resolution.md`
- `P02_List_Source_and_Data_Hook_Implementation.md`
- `P03_Webpart_Wiring_and_UI_Preservation.md`
- `P04_Runtime_Hardening_Build_and_Tenant_Validation.md`

## Repo-truth basis used for this package

- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureWebPart.manifest.json`
- `apps/hb-webparts/src/homepage/helpers/communicationsConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`
- `apps/hb-webparts/src/homepage/data/useProjectSpotlightData.ts`
- `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts`
- `apps/hb-webparts/src/homepage/data/spContext.ts`
- `apps/hb-webparts/src/mount.tsx`
- uploaded SharePoint schema exports:
  - `People Culture Kudos.csv`
  - `People Culture Celebrations.csv`
  - `People Culture Announcements.csv`

## Core conclusion

The premium visual rebuild is already materially present in `PeopleCultureMerged.tsx`. The missing production layer is the SharePoint list-source path:

- People & Culture still renders from `config` props only.
- The manifest still embeds seeded arrays as the active input model.
- There is no People & Culture list-source module or People & Culture data hook comparable to Project Spotlight.
- The existing `spContext.ts` seam is already sufficient to support a live-list-first implementation.

## Key list-schema cautions

1. **Announcements**
   - The export strongly suggests the list behind the user-provided Announcements URL is real, but one field appears to have a malformed internal name for `PublishDate`.
   - The agent must resolve **actual field internal names at runtime** from SharePoint field metadata instead of assuming the display names are safe.

2. **Celebrations**
   - The user-provided URL appears mislabeled.
   - The CSV indicates a separate celebrations-style list, but it still uses `AnnouncementId` as the ID column.
   - `PersonName` is a `UserMulti`, not a single-user field.
   - `CelebrationType` includes unsupported values beyond the current contract.
   - One boolean field appears malformed in the export and must be verified live.

3. **Kudos**
   - The export does **not** show an explicit `Status` field even though the current contract requires `status`.
   - The adapter should synthesize `status` from approval state unless live metadata proves a dedicated status field exists.

## Build command

The authoritative package build path in repo truth is:

```bash
npx tsx tools/build-spfx-package.ts --domain hb-webparts
```

The prompts in this package assume the People & Culture webpart is hosted on:

```text
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
```

## Expected outcome

After execution, the live homepage webpart should:

- use SharePoint lists as the primary operating model
- retain manifest arrays only as fallback
- preserve the premium, warm, culture-forward UI already present
- resolve people, taxonomy, and image fields defensively
- package into a fresh `hb-webparts.sppkg`
