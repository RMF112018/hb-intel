# PROMPT — Validation and Hosted Closure

## Objective

Perform final validation of the redesigned homepage `PriorityActionsRail` and prove closure with explicit local and hosted SharePoint evidence.

## Scope

Validate:

- flagship homepage wrapper path
- default / non-homepage path if affected
- responsive behavior
- accessibility behavior
- packaging output
- hosted SharePoint result

## Required architecture checks

- wrapper still renders the rail before the shell
- `homepage-flagship` remains explicit
- no shell-occupant migration occurred
- wrapper config seam still owns integration inputs
- data seam and presentation seam remain intact

## Required product-quality checks

- flagship path is structurally distinct from default
- the surface reads as a command/launcher band, not a grouped list
- primary actions are obvious
- section grouping accelerates scanning
- overflow feels curated

## Required responsive checks

Validate at minimum:

- ultrawide desktop
- standard laptop / desktop
- tablet landscape
- tablet portrait
- phone portrait
- short-height / constrained window
- common zoom conditions

For each state, verify:

- no accidental compression
- no horizontal scrolling required for primary content
- no timid centered fallback where left-authoritative composition is intended
- compact states remain clear and tappable

## Required accessibility checks

- keyboard focus is visible
- focus order is predictable
- focus return from overflow works
- no critical cue is hover-only
- reduced-motion handling remains intact
- target size / spacing remain credible
- role/function alignment is correct for links, buttons, disclosures, and menu triggers

## Packaging and host checks

- run the relevant build and package commands
- produce the `.sppkg`
- deploy / load the package in hosted SharePoint
- verify the hosted result matches the intended flagship redesign
- confirm no host-specific breakage, spacing regression, or order regression occurred

## Evidence required

Provide all of the following:

1. commands run
2. tests run
3. build result
4. package result
5. hosted validation notes
6. concise list of any remaining defects
7. statement confirming whether all in-scope defects found during closure were fixed now

## Prohibitions

- Do not treat local rendering as sufficient closure.
- Do not mark the work complete without hosted SharePoint validation.
- Do not defer meaningful in-scope defects.
- Do not weaken evidence quality because the redesign is visually obvious.

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
