# People & Culture Kudos Composer — Repo-Specific Code-Agent Prompt Package Summary

## Objective

Implement a **premium Kudos Composer flyout** for the People & Culture webpart in the live `RMF112018/hb-intel` repo.

This composer must:

1. open from every **Give Kudos** action inside the People & Culture surface
2. feel like a first-class extension of the existing warm, brand-forward `PeopleCultureMerged` experience
3. allow fast kudos submission by homepage users
4. write submissions into the live **People Culture Kudos** SharePoint list on the `HBCentral` site
5. support a moderated workflow instead of directly publishing new kudos to the homepage

This package is intentionally repo-specific and grounded in the current implementation state of:

- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts`
- `apps/hb-webparts/src/homepage/helpers/communicationsConfig.ts`
- `apps/hb-webparts/src/homepage/data/spContext.ts`
- `apps/hb-webparts/src/homepage/data/useProjectSpotlightData.ts`
- `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts`
- `tools/build-spfx-package.ts`

## Repo-Truth Starting Point

### Current People & Culture state
- `PeopleCultureMerged.tsx` already provides the premium homepage surface and already exposes multiple **Give Kudos** CTAs.
- Those CTAs are currently presentational (`href="#give-kudos"`) rather than backed by a real in-surface submission workflow.
- The component is still config-driven and does not yet have a native list-backed data hook or a submission seam.

### Existing runtime/data seams already available
- `mount.tsx` stores the SharePoint site URL through `storeSiteUrl(...)`.
- `spContext.ts` already provides `getSiteUrl()`.
- `ProjectPortfolioSpotlight` already demonstrates the preferred pattern:
  - UI stays presentation-focused
  - list fetch logic lives in a dedicated source file
  - hook manages loading, cache, and fallback
  - manifest config remains a narrow fallback for demo/dev safety

### Existing content contracts already support moderated kudos
The current `KudosEntry` contract already includes:
- `id`
- `headline`
- `excerpt`
- `submittedBy`
- `submittedDate`
- `status`
- `approvedBy`
- `approvedDate`
- `recipients`
- `media`
- `isPinned`
- `homepageEnabled`
- `publishStartDate`
- `publishEndDate`
- `celebrateCount`

That means the composer should **submit into the existing workflow shape**, not invent a parallel recognition model.

## SharePoint Host / List Context

Target site:
- `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

Uploaded schema exports indicate the **People Culture Kudos** list already contains fields sufficient for a proper moderated submission flow, including:

- `KudosId`
- `Headline`
- `Excerpt`
- `Details`
- `SubmittedBy`
- `SubmittedDate`
- `ApprovedBy`
- `ApprovedDate`
- `IndividualRecipients`
- `TeamRecipients`
- `DepartmentRecipients`
- `ProjectGroupRecipients`
- `IsPinned`
- `HomepageEnabled`
- `PublishStartDate`
- `PublishEndDate`
- `CelebrateCount`
- `PrimaryImage`
- `ImageAltText`
- `RejectionReason`
- `ModeratorNotes`

This means the agent should treat the Kudos Composer as a **real SharePoint-backed submission surface**, not as a toy modal.

## Recommended Product Outcome

Implement a **single shared Kudos Composer flyout**:

- **desktop/tablet:** right-side flyout / command sheet
- **mobile:** full-screen sheet
- **entry points:** every `Give Kudos` action inside `PeopleCultureMerged`
- **submission model:** write pending items into the live Kudos list
- **publishing model:** moderation/admin approval remains required before homepage rendering
- **tone:** warm, premium, celebratory, brand-native, not generic enterprise form UI

## Expected new seams

The agent should likely introduce a package roughly like this:

- `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerFlyout.tsx`
- `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerForm.tsx`
- `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerPreview.tsx`
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/data/useKudosComposer.ts`

These file names may be adjusted if repo conventions demand it, but the architectural split should remain:

- presentation shell
- form state / validation hook
- SharePoint submission source

## Non-Negotiable Outcome

The finished result must satisfy all of the following:

### UX
- the flyout looks premium enough to belong beside the current `PeopleCultureMerged` surface
- it feels intentionally designed, not like stock SharePoint or a rushed Fluent panel
- all Give Kudos actions route into the same composer
- compose / submit / success states feel coherent and polished
- reduced-motion and narrow viewport behavior remain safe

### Data
- submissions create live SharePoint items in the Kudos list on `HBCentral`
- submissions default into a moderated/pending state
- homepage publication flags are not blindly set by end users
- current user identity is used for submitter metadata
- recipient data is mapped into the existing kudos contract model

### Architecture
- `PeopleCultureMerged.tsx` stays mostly presentation-focused
- write logic lives in a dedicated data/submission seam
- no one-off raw REST code gets buried deep inside the rendering component
- fallback/demo behavior remains safe for non-SPFx or non-list contexts

### Packaging
- build and package through the repo’s authoritative SPFx path
- produce a fresh `hb-webparts.sppkg`
- verify the package includes the updated People & Culture implementation

## Package Contents

- `README_People_Culture_Kudos_Composer_Prompt_Package.md`
- `People_Culture_Kudos_Composer_Prompt_Package_Summary.md`
- `P01_Repo_Truth_Product_and_UX_Directive.md`
- `P02_Composer_Component_Architecture_and_State_Model.md`
- `P03_SharePoint_Submission_Source_and_Field_Mapping.md`
- `P04_Webpart_Wiring_Interaction_and_UI_Implementation.md`
- `P05_Runtime_Validation_Build_and_Packaging.md`
