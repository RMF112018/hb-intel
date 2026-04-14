# Workstream D — Team Authoring Redesign

Replaces the manual team-member row editor in the Article Publisher with a low-friction, guided team-composition experience.

## Steps
- [Step 01 — Interaction model design](./step-01/DESIGN.md)
- [Step 02 — Composer flyout + HbcPeoplePicker hydration](./step-02/CLOSURE.md)
- [Step 03 — Visual team-management surface + invariants](./step-03/CLOSURE.md)
- [Step 04 — Persistence, preview, Team Viewer contract](./step-04/CLOSURE.md)
- [Step 05 — Full behavioural scrub + closure](./step-05/CLOSURE.md)

## Final architecture

```
apps/hb-webparts/src/webparts/articlePublisher/teamComposer/
├── TeamPanel.tsx               # chip-stack canvas + featured toggle + reorder
├── TeamMemberComposer.tsx      # right-side flyout (HbcKudosComposerFlyout)
├── hydrateTeamMember.ts        # PersonEntry → PublisherTeamMemberRow mapping
├── teamInvariants.ts           # applyFeaturedInvariant / restampSortOrder / moveRow / teamMemberInitials
├── teamPanel.module.css        # chip-stack styles
├── teamComposer.module.css     # flyout body styles
├── __tests__  +  hydrateTeamMember.test.ts  +  teamInvariants.test.ts  +  teamPersistence.test.ts
└── index.ts                    # module barrel
```

Downstream contracts live on:
- `apps/hb-webparts/src/homepage/data/publisherAdapter/teamViewerAdapter.ts` — `mapPublisherRowToTeamViewerPerson` sources `jobTitle` / `projectRole` from `firstNonEmpty(row.Role, row.Title)` so composer-written captions render downstream.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts` — `mapTeamMemberRowToListFields` + `resolvePrincipal` handle the UPN → `PersonPrincipalId` lookup at write time.

## Runtime seams

`ArticlePublisher` consumes `getGraphToken` from the SPFx mount boundary. Inside the component:
- `searchPeople = useSharePointPeopleSearch()` — tenant SharePoint people picker endpoint.
- `fetchPersonPhoto = useGraphPersonPhotoFn(getGraphToken)` — Graph photo adapter with graceful initials fallback.

Both are threaded into `TeamPanel` → `TeamMemberComposer` → `HbcPeoplePicker`.

## Lifecycle invariants preserved
- `teamMembers.replaceAllForArticle` remains the only write seam.
- Publish / republish / archive / withdraw lifecycle untouched.
- Validation rules for empty / featured / group constraints fire unchanged.
