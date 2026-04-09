# peopleCultureCompanion — People & Culture HR Operating Companion

Phase-14 pc/ Prompt-03 real runtime. No longer a placeholder.

## Status

- Manifest: `PeopleCultureCompanionWebPart.manifest.json`, GUID
  `7c3f8e24-5a9b-4c1d-b63e-8f2a194d5c7e`, version `0.0.1.0`, hidden
  from toolbox.
- Runtime component: `PeopleCultureCompanion.tsx` — tab shell +
  reducer state + section composition.
- Registered in `apps/hb-webparts/src/mount.tsx` under the GUID
  above.
- Packaged in `hb-webparts.sppkg` via the existing
  `tools/build-spfx-package.ts` discovery walker.

## Scope

HR content-operations workspace for the non-recognition People &
Culture product surface. Owns:

- **Overview** dashboard (lifecycle counts, pending approvals,
  upcoming scheduled, expiring soon, homepage conflicts, milestone
  candidate queue, non-HR intake queue)
- **Announcements** workspace
- **Celebrations / Milestones** workspace
- **Culture Programs / Events** workspace
- **Approvals** global cross-family inbox with claim / reassignment
- **Homepage** governance surface with tier override + pin control

Each content-family workspace exposes the eight lifecycle states
required by the Decision-Lock Appendix (Draft, Needs Approval,
Scheduled, Live, Expiring Soon, Expired, Archived, Suppressed), the
default editorial list view, and an optional 14-day calendar view for
scheduled / live planning. A shared right-side **quick-edit drawer**
handles fast operational edits; a richer **full-editor modal** covers
deeper authoring including media-source selection, CTA authoring,
scheduling windows, and tag authoring.

## Explicitly out of scope

- **Recognition content.** HB Kudos is a separate webpart
  (`hbKudos/`, GUID `f14e59a3-4d6b-43b2-952e-ba02dea11dad`) and its
  moderation workspace belongs under `hbKudosCompanion/`. The PC
  companion must never import from either.
- **General employee-directory administration.** This is a
  content-operations console, not a directory tool.
- **Real SharePoint list persistence.** Edits are applied to an
  internal reducer so the UI is fully interactive end-to-end, but
  the SharePoint list adapter that will persist HR actions lands in
  a later prompt once the authoring list schemas are extracted.

## Related files

- Contracts: `apps/hb-webparts/src/homepage/webparts/peopleCultureSplitContracts.ts`
- Helpers: `apps/hb-webparts/src/homepage/helpers/peopleCultureSplitModel.ts`
- Public webpart: `apps/hb-webparts/src/webparts/peopleCulturePublic/`
- Legacy compatibility: `apps/hb-webparts/src/webparts/peopleCulture/`
