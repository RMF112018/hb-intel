# Plan Summary — Wave 01

## Objective
Close the structural frontend/backend wiring gaps that currently keep the Safety app from being a truthful production frontend over the backend.

## What this wave must achieve
1. eliminate ambiguity about how production Safety is mounted and configured
2. make backend config required in production sharepoint mode
3. introduce a typed backend command client that preserves request IDs and failure classes
4. add bounded timeout/abort/transient-fault handling
5. produce release proof that the mounted frontend is wired to the intended backend

## Must-not-regress assets
- governed workbook contract
- shared project search seam
- review queue framing
- read-side SharePoint data access
