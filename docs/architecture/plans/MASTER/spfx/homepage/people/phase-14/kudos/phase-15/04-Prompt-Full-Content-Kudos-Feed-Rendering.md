# 04 — Prompt: Full-Content Kudos Feed Rendering

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Render the `View All` panel contents as a **full kudos feed** from the live `People Culture Kudos` list, without compacting the kudos content.

## Mandatory scope

Audit and remediate at minimum:

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- the existing Kudos data mapping and filtering seams only as needed
- any thin local feed item renderer extracted for readability

## Required outcomes

The feed must:

- be sourced from live Kudos list data already available through the existing read path
- show all relevant kudos entries for the intended browse scope
- display kudos entries without archive-style compaction
- preserve full recognition content presentation
- feel like a premium feed, not a utility archive list

## Product rule

“Without any compaction of the kudos content” means:

- do not reduce entries to one-line archive rows
- do not clamp away the body content into a minimal browse stub
- do not make the feed a search-results utility table
- present each kudos item as a readable content card / entry with meaningful body space

## Required implementation direction

1. Decide the intended feed scope using the existing public/archive eligibility rules.
2. Reuse existing Kudos entry data from the live list read path.
3. Build a clear feed entry presentation for the slide-out.
4. Preserve recipient identity, message content, submitter attribution, and other appropriate public-facing fields.
5. Ensure the feed is scrollable, readable, and visually balanced inside the slide-out shell.

## Explicit prohibitions

Do not:
- render the feed as the same compact archive list already present on the surface
- truncate the content to the point that the “View All” experience adds no real value
- invent a second disconnected data source
- leak moderation-only or governance-only data into the public feed

## Deliverables

Return:
- files changed
- feed scope definition
- summary of entry rendering approach
- confirmation that the feed is sourced from the live Kudos list path
