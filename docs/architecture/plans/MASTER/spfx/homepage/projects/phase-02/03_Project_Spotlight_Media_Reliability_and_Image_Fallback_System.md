# Prompt 03 — Project Spotlight Media Reliability and Image Fallback System

## Objective

Implement the highest-value polish correction first: a reliable media system that prevents broken image presentation and makes missing/slow assets look designed instead of broken.

---

## Why this phase matters

The current implementation is structurally sound, but premium perception collapses if featured imagery, supporting thumbnails, or avatar photos fail visibly.

This prompt must solve that problem in a doctrine-compliant way.

---

## Required work

### A. Featured and secondary image safety
Implement a safe image rendering path for:
- featured project hero image
- supporting rail thumbnails
- any other spotlight imagery used by the webpart

Requirements:
- no browser-broken-image presentation
- controlled fallback UI
- preserve alt behavior for accessibility
- support loading and error states cleanly
- maintain premium visual tone when images are missing

### B. Avatar image safety
Implement safe team-photo handling for:
- inline team strip avatars
- team flyout avatars

Requirements:
- photo fallback to initials
- no broken image icon/text
- stable sizing and alignment
- no layout shift from failed images

### C. Fallback visual language
Create premium fallback visuals that feel intentional.

Examples:
- branded gradient placeholder
- subtle editorial poster style
- neutral image treatment that still fits homepage tone

### D. Optional focal/crop handling
If repo truth supports it cleanly, add a narrow focal/crop seam for spotlight images so crops feel intentional rather than accidental.

---

## UI doctrine requirements

All visuals must comply with the SPFx homepage doctrine.
Use only allowed entry points and approved homepage-safe primitives.
Do not introduce gimmicky loading or noisy placeholder effects.

---

## Deliverables

### 1. Files changed
### 2. Media-state matrix
Show behavior for:
- good image
- slow image
- missing image
- broken image URL
- missing avatar photo

### 3. Validation
At minimum:
- typecheck/build
- proof that broken-image states are suppressed
- proof that fallbacks are visually intentional
- no accessibility regression

---

## Hard constraints

- Keep this prompt focused on media reliability.
- Do not widen into the full visual redesign yet.
