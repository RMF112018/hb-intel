# Prompt 03 — Project Spotlight Summary Field HTML Normalization Remediation

## Objective

Fix the cause of raw HTML appearing inside the featured card body by ensuring the list-to-contract mapping supplies clean plain-text summary content to the Spotlight component.

This prompt addresses only the summary/body text fault path.

---

## Problem statement

The Spotlight component renders summary as plain text inside a paragraph.
That is correct for a homepage editorial summary surface.

The current runtime issue is upstream:

- the SharePoint list row is providing HTML/rich-text content,
- or the mapper is selecting the wrong field,
- and that HTML string is being passed directly into `feat.summary`.

React escapes plain string content, so the HTML appears visibly in the card body.

---

## In scope

- identify the source field currently mapped into `summary`
- determine whether that field is rich text / encoded HTML / wrong field
- sanitize, strip, decode, or remap to a clean text source
- preserve the component contract that `feat.summary` is plain text

## Out of scope

- changing the component to render arbitrary HTML
- introducing `dangerouslySetInnerHTML`
- redesigning the body copy treatment
- broader list-schema redesign

---

## Required work

### Phase 1 — Trace the current summary mapping

Document:

- which SharePoint column is currently being read into `summary`,
- the raw field value shape,
- where that value is assigned to the normalized contract.

### Phase 2 — Correct the mapping

Implement the smallest correct fix by doing one of the following, based on repo truth:

- map from the correct plain-text field,
- strip HTML tags from the current rich-text source,
- decode SharePoint-authored text into a clean string,
- or introduce a small normalization helper specific to this field.

### Phase 3 — Enforce plain-text contract

Ensure `feat.summary` remains plain text before it reaches the component.
The component should not become responsible for rich-text rendering.

### Phase 4 — Validate runtime

Prove that:

- the summary/body area now shows clean editorial text,
- visible raw HTML tags are gone,
- truncation/line-clamp behavior still works as intended.

---

## Required deliverables

1. root cause summary,
2. files changed,
3. field/source mapping summary,
4. normalization strategy,
5. validation evidence.

---

## Guardrails

- Do not use `dangerouslySetInnerHTML`.
- Do not widen into a generic rich-text rendering project.
- Keep the component contract simple: summary is plain text.
