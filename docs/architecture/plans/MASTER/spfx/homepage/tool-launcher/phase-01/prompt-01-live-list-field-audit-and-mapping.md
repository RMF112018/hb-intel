# Prompt 01 — Live List Field Audit and Mapping

## Objective

Inspect the live SharePoint list **`Tool Launcher Contents`** and document the actual field names, value shapes, and any mismatches between the seeded tenant schema and the idealized planning field names.

## Required stance

- repo truth first
- tenant/list truth first for actual field names
- do not re-read files still in your current context unless needed
- do not guess internal field names
- do not implement final UI behavior in this prompt
- this prompt is about field truth and mapping clarity

## Existing implementation context

Before doing list mapping work, review the current Tool Launcher data seam in the repo so the live-field audit is grounded in what the current webpart actually consumes.

Inspect at minimum:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`
- `apps/hb-webparts/src/homepage/helpers/utilityConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/utilityContracts.ts`

## Live list target

- SharePoint list title: `Tool Launcher Contents`

## What you must determine

For every relevant field in the list, document:

- display name
- internal name
- SharePoint field type
- expected value shape returned at runtime
- whether the field is required for:
  - flagship stage
  - workflow shelves
  - all-platforms inventory
  - help/access actions
  - notice/status rendering
- whether the field can be optional with fallback behavior

## Minimum expected mapping coverage

Attempt to verify and map the launcher-relevant fields corresponding to:

- platform name
- platform key
- launch URL
- official logo asset reference
- dark logo asset reference
- preferred logo type
- short descriptor
- workflow shelf
- category
- featured flag
- featured sort order
- sort order
- audience visibility
- audience rules JSON
- aliases / keywords
- help link
- support owner
- support owner reference
- access request destination
- notice status
- notice badge text
- notice details
- notice expires on
- is active
- open in new tab
- favorite eligible
- status badge tone
- vendor / product family
- tenant / environment label
- requires review
- last reviewed on
- notes

## Required output

Produce a markdown file named:

- `phase-01-live-list-field-map.md`

The file must include these sections:

### 1. List access method used
Describe exactly how you inspected the list.

### 2. Verified field map
Use a structured table.

### 3. Mismatches and normalization needs
Call out all meaningful discrepancies.

### 4. Critical fields vs optional fields
Be practical and explicit.

### 5. Immediate coding implications
State what the adapter must account for.

## Additional instruction

If the live list truth differs materially from the planned field naming, the live list wins and the normalization layer must absorb the difference.
