# 02 — Current-State Architecture and Gap Register

## Concise implementation map

### A. Homepage flagship hero implementation
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css`
- `apps/hb-webparts/src/webparts/hbSignatureHero/index.ts`

### B. Adjacent manifest
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroWebPart.manifest.json`

### C. Runtime dispatch
- `apps/hb-webparts/src/mount.tsx`

### D. SPFx shell/property pane runtime
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`

### E. Homepage composition reference
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`

### F. Homepage doctrine
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

### G. Shared lower-level surface seam
- `packages/ui-kit/src/HbcSignatureHeroSurface/index.tsx`

### H. Shared identity/photo seam proved by Kudos
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/useRecipientPhotoHydration.ts`
- `packages/ui-kit/src/HbcPeoplePicker/usePersonPhotoCache.ts`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`

---

## Gap register

### G-01 — No article contract
**Severity:** Critical

**Current state**
The current hero accepts homepage identity plus background override only.

**Impact**
There is no clean place to express article title, subheading, author, publish date/time, or labels.

**Correction direction**
Create an explicit article-mode view model and keep it out of the homepage adapter.

---

### G-02 — No host-aware mode lock in code
**Severity:** Critical

**Current state**
The current hero is homepage-specific by convention, doctrine, and usage, but there is no hard mode resolver that forces homepage mode on HBCentral.

**Impact**
Future extensions could accidentally let article behavior bleed into the flagship homepage context.

**Correction direction**
Add a mode resolver that hard-locks homepage mode when the current site URL is HBCentral.

---

### G-03 — Homepage adapter is too narrow for article use and too important to mutate casually
**Severity:** Critical

**Current state**
The current hero is intentionally narrow and handcrafted around the flagship top-band identity surface.

**Impact**
Direct extension would either:
- create prop soup, or
- violate homepage doctrine by injecting article furniture

**Correction direction**
Split mode-specific adapters.

---

### G-04 — Shared lower-level rendering seam exists but is not being used here
**Severity:** High

**Current state**
`HbcSignatureHeroSurface` already provides richer slots that align more closely with article needs.

**Impact**
The repo has a usable foundation for article-mode work that is currently disconnected from `HbSignatureHero`.

**Correction direction**
Use a lower-level shared rendering seam beneath article mode, while leaving homepage mode visually/output-stable.

---

### G-05 — Author identity/photo behavior is not yet modeled in hero
**Severity:** High

**Current state**
The hero has no author contract and no photo-resolution path.

**Impact**
Dynamic article rendering cannot satisfy author attribution requirements.

**Correction direction**
Introduce a shared article-author identity utility that reuses the generic photo/search mechanics proven in Kudos.

---

### G-06 — Property pane only supports background image override
**Severity:** High

**Current state**
The shell property pane for the hero only exposes `backgroundImageUrl`.

**Impact**
There is no current editor/runtime seam for article-mode fields.

**Correction direction**
Extend the property-pane/runtime config path for article-mode inputs without creating HBCentral drift.

---

### G-07 — No dedicated article-mode validation surface
**Severity:** Medium

**Current state**
The repo has validation/story seams for shared UI and homepage work, but not a dedicated article-mode proof path for `hbSignatureHero`.

**Impact**
Article-mode changes could compile without meaningful regression proof.

**Correction direction**
Add stories/harness proof for:
- homepage locked mode
- article mode
- host-mode resolution

---

### G-08 — Risk of accidental Kudos coupling
**Severity:** Medium

**Current state**
Kudos contains the best live author/photo pattern in this repo family.

**Impact**
A rushed implementation could import from Kudos runtime modules instead of reusing the shared seams beneath it.

**Correction direction**
Use:
- `PersonEntry`
- `createGraphPersonPhotoFn`
- shared photo cache pattern
- shared people-search adapter where appropriate

Do not import article rendering from Kudos components or hooks unless the hook is first promoted into a neutral shared layer.
