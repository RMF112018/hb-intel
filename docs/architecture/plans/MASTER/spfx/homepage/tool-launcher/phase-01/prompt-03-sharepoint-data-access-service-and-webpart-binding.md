# Prompt 03 — SharePoint Data Access Service and Webpart Binding

## Objective

Implement the SharePoint data-access / adapter wiring needed for the Tool Launcher / Work Hub webpart to read from the live list **`Tool Launcher Contents`**, normalize the records, and bind them into the launcher rendering flow.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- preserve homepage lane architecture and import discipline
- keep list access logic out of shared UI primitives
- do not overbuild a generic platform registry framework unless the repo already clearly wants one

## Existing implementation seam to replace or bridge

Review and update the current data flow through:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`
- any directly adjacent webpart shell / props / manifest files
- homepage helpers and contracts that currently shape grouped launcher data

## Required implementation outcome

The Tool Launcher must be able to:

1. read live platform records from `Tool Launcher Contents`
2. normalize them into the launcher domain model
3. derive the structures needed for current rendering
4. render from live data without breaking the homepage lane
5. degrade safely if the list returns:
   - no items
   - partial items
   - malformed optional values
   - temporarily missing fields

## Important constraint

It is acceptable to bridge the new live-data model into temporary grouped or sectioned structures if needed to keep the current launcher rendering alive during phased implementation.

It is **not** acceptable to leave the live list as a sidecar while the old local grouped config remains the real driver.

## Required output

1. code implementation
2. a markdown file named:
   - `phase-01-binding-and-adapter-proof.md`

That proof file must include:

### 1. Files changed
### 2. Data flow from SharePoint to webpart render
### 3. Transitional compatibility notes, if any
### 4. Known limitations intentionally deferred to later phases
### 5. Runtime proof steps
### 6. Risks remaining

## Additional instruction

If the chosen SharePoint access method requires a service/context/helper pattern that already exists elsewhere in the homepage lane, reuse it. If not, create the narrowest correct implementation.
