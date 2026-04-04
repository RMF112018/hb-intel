# 06 — Company Pulse, Leadership Message, and People & Culture

**Naming guard**
- Do **not** title or name the package as `homepage`, `home page`, `homepage-webparts`, `hb-central-homepage`, or any other homepage-labeled package.
- The package name must be exactly: `hb-webparts`.


## Objective

Implement the curated communications and human-layer homepage webparts without letting the page degrade into a generic news wall.

## Required Context

- Live repo: `RMF112018/hb-intel`
- This package’s `00_Implementation_Summary.md`
- This package’s `11_Risk_Exposure.md`
- This package’s `12_Standards_and_Best_Practices.md`
- Relevant current-state docs, ADRs, package READMEs, and live source files in the repo

## Operating Rules

- Use **repo truth first**. Inspect the live code and current authoritative docs before editing.
- Do **not** re-read files that are already in your current context or memory window.
- Do **not** broaden scope beyond the HB Central homepage webpart system.
- Do **not** create placeholder or stubbed production code.
- Prefer updating existing authoritative docs over creating redundant documents.
- Preserve SharePoint-native authoring and page composition.
- Default to lightweight homepage webparts unless this prompt explicitly authorizes an exception.
- Keep imports narrow and homepage-safe.
- Record any doc/code contradiction you find instead of silently choosing one source.
- At the end, provide a concise handoff note with changed files, verification, risks, and next-prompt readiness.

## Implementation Tasks


1. Implement the **Company Pulse** webpart.
   It should support:
   - featured internal updates
   - safety highlights
   - recognition moments
   - project wins / milestones
   - editorial hierarchy, not a flat news list

2. Implement the **Leadership Message** webpart.
   It should provide:
   - concise leadership / executive messaging
   - strong visual treatment
   - optional image/media support if it remains disciplined
   - authorable archive/rotation-ready structure if practical for release 1

3. Implement the **People and Culture** webpart.
   It should support:
   - welcome new hires
   - anniversaries
   - promotions
   - recognition / culture moments
   - warm but professional presentation

4. Make sure these webparts feel **curated**.
   The page must not become a dumping ground for equal-weight content cards.

5. Establish content source and authoring patterns that avoid repeated developer involvement.
   Prefer clear list-backed or authored configuration models.

6. Use hierarchy and layout to differentiate:
   - featured / primary item
   - secondary items
   - metadata
   - CTA behavior

7. Add tests and graceful states for:
   - no-content scenarios
   - partially populated content
   - malformed authoring
   - optional media presence/absence


## Required Deliverables


- working Company Pulse webpart
- working Leadership Message webpart
- working People and Culture webpart
- content-source/config docs
- tests and docs for all three


## Verification


- run typecheck and relevant tests
- verify empty/partial states
- verify no webpart becomes visually noisy or flat in hierarchy
- confirm authored content is maintainable without code edits


## Definition of Done


- the communications/human layer is implemented
- the homepage can now feel alive and branded without collapsing into generic intranet news behavior
- all three webparts are site-owner maintainable and visually coordinated
