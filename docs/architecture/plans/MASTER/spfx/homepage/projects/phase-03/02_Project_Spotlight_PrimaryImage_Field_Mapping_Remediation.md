# Prompt 02 — Project Spotlight `PrimaryImage` Field Mapping Remediation

## Objective

Implement the smallest correct fix for the featured image rendering failure by correcting how the SharePoint list `PrimaryImage` field is mapped and normalized.

This prompt addresses only the image fault path.

---

## Problem statement

The current Spotlight component expects `feat.image.src` to be a browser-renderable URL.
The SharePoint-hosted runtime strongly suggests the list mapping is handing the component a broken value path instead:

- reserved image attachment token,
- thumbnail path that resolves to 404,
- or otherwise incomplete/non-final image source.

Your task is to normalize the actual SharePoint field shape into a valid image URL.

---

## In scope

- list row image field extraction
- image field normalization
- resolution of SharePoint image payloads into final URLs
- minimal type/contract updates required for the fix
- preserving existing safe image fallback behavior in the component

## Out of scope

- redesign of placeholder visuals
- broader Spotlight layout work
- rail redesign
- summary/body text fix

---

## Required work

### Phase 1 — Trace the current image mapping path

Document:

- raw `PrimaryImage` field shape from SharePoint row,
- current extraction code,
- where the bad value becomes `feat.image.src`.

### Phase 2 — Implement correct normalization

Implement the smallest correct normalization helper or mapping update to support the real field shape.

Examples of acceptable supported cases, if they are actually present in repo/runtime truth:

- direct string URL
- SharePoint image field object with URL/server-relative URL fields
- reserved attachment-derived payload that must be converted
- thumbnail/object payload where a more stable image field URL is available

Do not add speculative support for unrelated formats.

### Phase 3 — Preserve graceful failure behavior

The component already includes safe image fallback behavior.
Ensure the mapping fix works with that system rather than bypassing it.

### Phase 4 — Validate runtime

Prove that:

- valid Spotlight rows now produce a visible featured image,
- broken image rows still degrade gracefully,
- the prior 404-driven empty panel is no longer the normal outcome for valid items.

---

## Required deliverables

1. root cause summary,
2. files changed,
3. exact image field shape handled,
4. normalization strategy,
5. validation evidence.

---

## Guardrails

- Keep the diff narrow.
- Do not redesign the image component.
- Do not widen into general media-system work.
