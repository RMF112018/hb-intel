# Prompt 02 — HB Kudos Closure Validation

Run a strict closure review against the just-completed HB Kudos remediation.

## Closure standard
Closure is allowed only if every item below is true.

### 1. People picker closure
- Typing `bo` returns real user suggestions for known matching users.
- Suggestions are selectable.
- Selected users render as chips/tokens.
- Chips can be removed.
- Submission succeeds using selected recipients.
- Failure states are visible and diagnosable; they are not silently converted into empty results.

### 2. Featured card closure
- Featured recognition shows readable headline, recipient identity, and body copy.
- Card no longer reads as hollow, washed out, or visually blank.
- Result is credible in the real SharePoint host, not just isolated local render.

### 3. Layout closure
- Surface is comfortable at normal zoom.
- Composer footer/actions are not obstructed by host overlays.
- No obvious clipping, crushed spacing, or hidden content in the main homepage render.

### 4. Packaging closure
- Fresh build generated.
- Fresh package generated.
- Deployed package reflects current code, not stale output.

## Required evidence
Produce explicit pass/fail output for each of the above.
If any item fails, mark the remediation as **not closed** and identify the exact blocking file and cause.

## Prohibition
Do not convert partial success into “done.”
