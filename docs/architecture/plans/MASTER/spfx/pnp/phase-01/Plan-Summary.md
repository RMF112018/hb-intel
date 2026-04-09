# Plan Summary — PnP Operations SPFx Webpart

## Objective

Create a SharePoint/SPFx webpart that allows an authorized operator to enter a target site URL, select a supported extraction/inspection action, run the action through a secure backend execution seam, and download the resulting artifact files.

## Product intent

This webpart should become a reusable internal administration utility for high-value SharePoint/PnP operations such as:

- site starting-point template extraction,
- list schema extraction,
- page / client-side webpart layout extraction,
- list/library inventory,
- and similarly repeatable high-ROI read-heavy tasks.

## Core constraints

- SPFx is the operator UI only.
- Privileged PnP work must execute in a backend/service seam.
- Styling must use `@hbc/ui-kit`.
- The operator provides target site address(es) through the webpart UI.
- The result of each action must be emitted as a downloadable file or file set.

## Recommended initial action catalog

### Phase-1 required actions

1. **Site starting-point template extraction**
   - capture reusable structure for new-site cloning
   - include pages, library/list structure, and empty folder trees where feasible

2. **List schema extraction**
   - full list metadata
   - fields
   - views
   - content types
   - optional sample-item key validation

3. **Page/layout extraction**
   - modern page inventory
   - section/control/webpart placement data
   - client-side webpart manifest references where available

### Phase-1 recommended additional actions

4. **Site inventory export**
   - lists/libraries/pages/basic settings inventory

5. **Library structure export**
   - folder / subfolder tree only
   - optional starter-file manifest if included in the site

6. **Permission/reporting helper export**
   - site groups / owners / members summary where accessible and appropriate

## Output model

Each action should produce:

- a machine-readable raw export,
- a normalized export if applicable,
- a short markdown summary/report,
- and a downloadable bundle/manifest surfaced back through the webpart.

## Delivery pattern

- The SPFx webpart initiates and monitors jobs.
- The backend runs the extraction.
- Completed jobs expose downloadable artifacts.
- The webpart shows status, logs, and links to downloads.

## Scope discipline

This package should not expand into a full tenant-admin center.

The first wave should prove:

- secure execution,
- strong UX shell,
- stable download artifacts,
- and a small but genuinely useful PnP operations catalog.
