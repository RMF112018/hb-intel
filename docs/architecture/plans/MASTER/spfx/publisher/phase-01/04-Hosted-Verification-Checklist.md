# 04 — Hosted Verification Checklist

## Purpose

Use this checklist during tenant validation after the implementation is built.

## A. Structural verification
- [ ] Publisher app loads in the intended SPFx host surface
- [ ] No Company Pulse or dual-destination language remains in UI or code paths
- [ ] Architecture docs referenced by the implementation are still current

## B. List verification
- [ ] Project Spotlight post master list exists and is reachable
- [ ] team-member child list exists and is reachable
- [ ] media/gallery child list exists and is reachable
- [ ] template registry list exists and is reachable
- [ ] page-binding list exists and is reachable
- [ ] workflow history / publishing error lists exist if implemented

## C. Authoring verification
- [ ] New post can be created as draft
- [ ] Post family, spotlight type, project stage, and subject can be set
- [ ] Banner image can be attached or referenced as designed
- [ ] Subheading and body can be authored
- [ ] Team members can be added, ordered, and saved
- [ ] Gallery items can be added, ordered, and saved
- [ ] Validation errors are field-specific and actionable

## D. Preview verification
- [ ] Preview resolves the correct template and shell
- [ ] Preview shows expected banner/title behavior
- [ ] Preview reflects Team Viewer and gallery block state
- [ ] Preview output matches publish output behavior

## E. Publish verification
- [ ] Publish creates a new page on `https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight`
- [ ] Created page originates from the approved XML shell pattern
- [ ] Banner/title renders correctly
- [ ] Subheading renders in the expected text block
- [ ] Body renders in the expected text block
- [ ] Team Viewer receives the correct article/post-bound data
- [ ] Image Gallery receives the correct ordered media items
- [ ] Page URL/slug behavior matches the design
- [ ] Page-binding record is written correctly

## F. Republish verification
- [ ] Editing a published post updates the existing page rather than creating a duplicate
- [ ] Binding timestamps/version lineage update correctly
- [ ] Republish does not silently break shell compatibility

## G. Regeneration verification
- [ ] Regeneration policy is explicit
- [ ] Any shell-version drift is surfaced before destructive changes
- [ ] Regeneration preserves traceability

## H. Archive / withdraw verification
- [ ] Archive behavior follows the chosen policy
- [ ] Rollup suppression behaves as expected
- [ ] Binding/history traceability remains intact

## I. Final build verification
- [ ] Clean build completes successfully
- [ ] Final package/build proves latest local source was used
- [ ] No stale artifacts remain in the package path
