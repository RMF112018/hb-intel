# Prompt 01 — Project Spotlight Root-Cause Audit

## Objective

Conduct a narrow repo-truth audit to identify exactly why:

1. the featured image is not rendering in the SharePoint-hosted Project Spotlight webpart, and
2. raw HTML is appearing in the body/summary area of the featured card.

This is a diagnosis prompt.
Do not implement broad fixes before you prove the root cause.

---

## Primary repo

Use the live repo as the sole authority:

- `https://github.com/RMF112018/hb-intel`

Treat repo truth as authoritative.

---

## Known evidence

The current source and runtime evidence already narrow the problem space:

- The webpart uses the SharePoint list `Homepage Project Spotlights` as the primary data source, with fallback manifest seed data only for local/demo cases.
- The README states that list fetch and raw-to-contract mapping live in:
  - `homepage/data/projectSpotlightListSource.ts`
  - `homepage/data/useProjectSpotlightData.ts`
  - normalization/helpers under homepage helpers.
- The component itself expects:
  - `feat.image.src` to already be a valid image URL,
  - `feat.summary` to already be clean plain text.
- The runtime logs show repeated 404s for SharePoint image/thumbnail retrieval.
- The runtime UI shows visible HTML-like text inside the summary/body area.

You must prove the exact fault path.

---

## Required investigation questions

Answer these through repo inspection before changing anything:

### A. What exact payload shape is being returned from the SharePoint list for `PrimaryImage`?

Determine whether the value is:

- a direct URL string,
- SharePoint image-field JSON,
- a reserved attachment token,
- a thumbnail-derived path,
- or another intermediary shape.

Do not guess.

### B. What exact payload shape is being returned for the field currently mapped to `summary`?

Determine whether it is:

- plain text,
- SharePoint rich text HTML,
- encoded HTML,
- link markup,
- or the wrong field entirely.

### C. Where is the row-to-contract mapping performed?

Identify the exact files/functions where SharePoint list rows become the normalized `ProjectPortfolioSpotlight` contract used by the component.

### D. Where are the broken assumptions?

Identify the exact point(s) where the code incorrectly assumes:

- `PrimaryImage` is already a usable URL,
- `summary` is already plain text.

---

## Scope

Inspect at minimum:

- `homepage/data/projectSpotlightListSource.ts`
- `homepage/data/useProjectSpotlightData.ts`
- `homepage/helpers/operationalAwarenessConfig.ts`
- the list contract / webpart contracts files relevant to Project Spotlight
- `ProjectPortfolioSpotlight.tsx`
- any helper currently normalizing SharePoint image or rich-text fields

---

## Deliverables

In your completion notes, provide:

1. the exact root cause for the image issue,
2. the exact root cause for the summary/body issue,
3. the files where each problem originates,
4. the smallest correct fix path for each,
5. any edge cases that must be preserved.

---

## Guardrails

- Do not redesign the component.
- Do not change visual hierarchy.
- Do not start a broad data-model rewrite.
- Keep this prompt focused on root-cause isolation only.
