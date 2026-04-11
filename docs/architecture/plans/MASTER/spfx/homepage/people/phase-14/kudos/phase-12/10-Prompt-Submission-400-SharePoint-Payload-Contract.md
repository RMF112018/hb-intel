# 10 — Prompt: Submission 400 / SharePoint Payload Contract Remediation

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Correct the HB Kudos submission failure that occurs when the Give Kudos panel posts a new list item to SharePoint and receives:

- `400 Bad Request`
- `Microsoft.SharePoint.Client.InvalidClientQueryException`
- `An unexpected 'StartObject' node was found when reading from the JSON reader`

This is not a UI-only defect.
This is a SharePoint payload/schema contract defect in the create-item submission path.

## Evidence

Current behavior:
- clicking **Send Kudos** submits to the SharePoint list items endpoint
- the POST fails with HTTP 400
- the panel surfaces the SharePoint error in the UI

Observed endpoint pattern:
- `/_api/web/lists(guid'...')/items`

Observed error shape:
- `InvalidClientQueryException`
- `An unexpected 'StartObject' node was found when reading from the JSON reader`

## What that error means

At least one field in the request body is being sent as a JSON object where SharePoint expects a different wire shape.

Typical causes include:
- sending a raw picker object into a text field
- sending a raw person object into a Person/Group column instead of `<InternalName>Id`
- sending a raw array of objects into a lookup/person/multi-value field instead of the required SharePoint REST format
- sending nested objects into a field that only accepts a string, number, boolean, or correctly wrapped `results` collection

## Mandatory audit scope

Audit all code materially involved in Kudos submission, including but not limited to:

- `apps/hb-webparts/src/webparts/hbKudos/`
- `apps/hb-webparts/src/homepage/data/`
- `packages/ui-kit/src/HbcKudosComposer/`
- any shared submission/service/repository utilities used by the Kudos save path
- any code that:
  - builds the list item payload
  - maps picker selections into SharePoint field values
  - serializes recipients / teams / departments / projects
  - posts to `/_api/web/lists(...)/items`

## Required tasks

### 1. Find the exact create-item submission path
Identify:
- the function that constructs the payload
- the function that executes the POST
- the exact field mapping used for each submitted property

### 2. Record the actual outgoing payload shape
Before changing behavior, log or otherwise inspect the exact request body being sent at submit time.

You must identify exactly which property contains the invalid object shape.

### 3. Reconcile payload shape against the actual SharePoint list schema
For every submitted field, determine:
- SharePoint internal field name
- SharePoint field type
- correct REST wire format
- whether the current implementation matches or violates that contract

Pay special attention to:
- recipient people selection
- preview/display-name support fields
- headline/title field
- message/body field
- optional teams / departments / projects selections
- any JSON-like metadata fields

### 4. Correct field serialization by SharePoint type
Use the correct contract for the actual target field type.

Examples of acceptable remediation direction:
- **Person/Group single value** → `<InternalName>Id: number`
- **Person/Group multi value** → `<InternalName>Id: { results: [number, ...] }`
- **Lookup single value** → `<InternalName>Id: number`
- **Lookup multi value** → `<InternalName>Id: { results: [number, ...] }`
- **Text / Note field storing metadata** → serialize to a string if that is the intended design
- **Choice / MultiChoice / taxonomy-like fields** → use the correct SharePoint REST shape for the actual schema

Do not send raw UI objects to SharePoint.

### 5. Normalize the submission model
Introduce a clean boundary between:
- rich UI draft objects used by the composer and picker
- normalized submission DTOs
- SharePoint REST payload mapping

The SharePoint service layer must not receive raw picker UI objects.

### 6. Improve error handling
Do not dump raw SharePoint JSON into the end-user panel as the only experience.

Required improvements:
- log structured technical detail for debugging
- surface a cleaner user-facing error message
- preserve enough diagnostic context for validation

## High-probability root cause to verify first

The highest-probability failure is that the selected recipient object from the people picker is being posted directly, or embedded directly, into a SharePoint field that expects:
- a scalar text value, or
- a `Person/Group` `<InternalName>Id` mapping

Verify this first before expanding to other fields.

## Explicit prohibitions

Do not:
- patch blindly without inspecting the actual payload
- guess at the list schema
- hardcode around the problem without mapping field types
- leave raw UI objects crossing into the SharePoint POST layer
- treat the `ERR_BLOCKED_BY_CLIENT` Aria telemetry errors as the root cause

The telemetry errors are noise.
The real failure is the SharePoint list item POST returning 400.

## Deliverables

Provide:

1. the exact file(s) and function(s) responsible for the failing submission
2. the exact property that caused the `StartObject` contract violation
3. the corrected payload mapping per submitted field
4. the files changed
5. a brief schema-to-payload matrix
6. validation proof of a successful submit

## Validation criteria

You must prove all of the following:

- clicking **Send Kudos** no longer returns 400
- the SharePoint list item is created successfully
- recipient selection is stored correctly
- headline and message are stored correctly
- no raw UI object is posted directly to SharePoint
- user-facing error handling is improved
- the fix works in SharePoint-hosted runtime at 100% zoom
