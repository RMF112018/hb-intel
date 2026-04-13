# HBSignatureHero — Exhaustive Repo-Truth Audit

## Phase 1 — Audit framing

### Objective
Determine the correct architecture to make `hbSignatureHero` dynamic for article rendering while preserving current HBCentral behavior unchanged.

### Non-negotiable preservation rule
If the hero is hosted at:

`https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

it must remain the current flagship homepage hero.

### Dynamic article requirement
Outside HBCentral, the hero needs a clean path to support article rendering with:
- primary image
- article title
- subheading
- author name
- author photo
- published date
- published time
- optional metadata/labels

### Source of truth
The live repo `main` branch is the source of truth.

### Binding authority
The governing doctrine files are binding:
- `UI-Doctrine-SPFx-Governing-Standard.md`
- `UI-Doctrine-SPFx-Homepage-Overlay.md`

### Evaluation criteria
The audit evaluates:
- current implementation truth
- doctrine compliance
- host/runtime safety
- preservation of HBCentral behavior
- dynamic article feasibility
- shared identity/photo reuse quality
- correctness of refactor vs redesign vs replacement

---

## Phase 2 — Repo-truth implementation map

### Current hero footprint
The current implementation is centered in:

- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css`
- `apps/hb-webparts/src/webparts/hbSignatureHero/index.ts`
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroWebPart.manifest.json`

### Runtime wiring
The runtime path is:

- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `apps/hb-webparts/src/mount.tsx`

### Homepage composition usage
The homepage reference composition uses `HbSignatureHero` as the flagship top band in:

- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`

### Identity and greeting dependencies
The hero depends on homepage identity/greeting helpers such as:

- `apps/hb-webparts/src/homepage/helpers/identity.ts`
- `apps/hb-webparts/src/homepage/helpers/welcomeMessage.ts`

### Lower-level shared surface seam
A richer shared hero primitive already exists in:

- `packages/ui-kit/src/HbcSignatureHeroSurface/index.tsx`

### Author/photo reuse seam
The best live identity/photo pattern is spread across:

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/useRecipientPhotoHydration.ts`
- `packages/ui-kit/src/HbcPeoplePicker/usePersonPhotoCache.ts`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`

### Current assumptions that make the hero homepage-only
- narrow prop contract
- homepage-specific copy lock
- homepage-specific visual grammar
- no article model
- no author model
- no metadata row
- no host-aware mode branch in the hero component itself
- property-pane support limited to background image override

---

## Phase 3 — Exhaustive audit findings

## A. Doctrine compliance findings

### Finding A-01 — The current homepage hero correctly behaves as a flagship identity surface
**Severity:** High positive finding

**Evidence**
The current hero is intentionally minimal and homepage-specific.

**Why it matters**
This is exactly why it should not be casually mutated into a generic article banner.

**Correction direction**
Preserve this branch and isolate article behavior elsewhere.

---

### Finding A-02 — Direct article extension would conflict with the homepage overlay lock
**Severity:** Critical

**Evidence**
The homepage overlay locks the flagship hero to logo, tagline, and personalized greeting only.

**Why it matters**
Adding article headline, metadata, author row, or similar furniture directly into the flagship homepage branch would violate doctrine.

**Correction direction**
Separate behavior families.

---

## B. HBCentral preservation findings

### Finding B-01 — HBCentral preservation is currently implicit, not hard-locked in code
**Severity:** Critical

**Evidence**
The hero is homepage-specific by design and usage, but the current component does not branch on host/site URL.

**Why it matters**
Future “dynamic article” work could accidentally introduce article behavior into HBCentral if the mode boundary remains implicit.

**Correction direction**
Add an explicit host-aware mode resolver.

---

### Finding B-02 — The current output is worth preserving as-is
**Severity:** Critical positive finding

**Evidence**
The repo treats this hero as the canonical flagship homepage top band.

**Why it matters**
There is no architectural justification to replace the HBCentral branch wholesale.

**Correction direction**
Preserve it behind a locked homepage adapter.

---

## C. Architecture findings

### Finding C-01 — The current hero contract is too narrow for article needs
**Severity:** Critical

**Evidence**
Current inputs are homepage identity plus background override only.

**Why it matters**
Article mode needs a real content model.

**Correction direction**
Add an explicit article view model.

---

### Finding C-02 — Extending the current adapter directly would produce prop drift
**Severity:** Critical

**Evidence**
The current adapter is handcrafted around homepage identity behavior.

**Why it matters**
A long list of optional article props would create an unstable mixed-purpose component.

**Correction direction**
Use thin mode adapters over shared lower-level seams.

---

### Finding C-03 — The repo already contains a better lower-level seam for article rendering
**Severity:** High

**Evidence**
`HbcSignatureHeroSurface` already supports richer slot-based composition.

**Why it matters**
The repo has a meaningful foundation for article mode without corrupting the homepage adapter.

**Correction direction**
Use or extend that seam honestly.

---

## D. Runtime / host-awareness findings

### Finding D-01 — The mount path currently passes no article data
**Severity:** Critical

**Evidence**
The current runtime mapping passes identity, background image, and asset base URL.

**Why it matters**
There is no article-mode binding path today.

**Correction direction**
Extend runtime/property-pane inputs only after mode separation is in place.

---

### Finding D-02 — Site URL context is already available through shared host context
**Severity:** High positive finding

**Evidence**
The repo already stores site URL via the homepage/sharepoint host-context seam.

**Why it matters**
A host-aware mode resolver can be added cleanly.

**Correction direction**
Use the existing site-context seam instead of inventing a brittle new global.

---

## E. Dynamic article-mode findings

### Finding E-01 — No article-mode renderer exists today
**Severity:** Critical

**Evidence**
There is no current hero component or contract dedicated to article rendering.

**Why it matters**
Dynamic article support must be introduced as new architecture, not treated as already present.

**Correction direction**
Create a dedicated article adapter and contract.

---

### Finding E-02 — Article inputs should be explicit, not inferred from homepage assumptions
**Severity:** High

**Evidence**
The current homepage hero contains no article semantics.

**Why it matters**
Implicit guessing would create fragile runtime behavior and poor authoring ergonomics.

**Correction direction**
Make article fields explicit.

---

## F. Author/photo reuse findings from Kudos

### Finding F-01 — Kudos proves the correct photo seam is generic Graph-backed photo resolution
**Severity:** High

**Evidence**
Kudos uses shared Graph photo mechanics and typed identity entries.

**Why it matters**
The author-photo requirement can reuse that seam without importing Kudos domain behavior.

**Correction direction**
Promote/reuse the shared photo utility pattern, not Kudos runtime code.

---

### Finding F-02 — SharePoint people search is available for author-resolution workflows
**Severity:** Medium

**Evidence**
The repo has a SharePoint-aware people-search adapter returning `PersonEntry` data.

**Why it matters**
If the article workflow needs author lookup or validation, there is already a tenant-aware search seam available.

**Correction direction**
Use only where appropriate; do not force picker semantics into plain render mode.

---

## G. React / code quality findings

### Finding G-01 — The current component is not “wrong”; it is tightly scoped
**Severity:** High positive finding

**Evidence**
The hero is compact, purpose-built, and consistent with homepage doctrine.

**Why it matters**
The redesign should not punish a correct narrow adapter by replacing it unnecessarily.

**Correction direction**
Preserve it and isolate new responsibilities elsewhere.

---

### Finding G-02 — The main risk is responsibility creep, not broken code
**Severity:** High

**Evidence**
The current risk comes from future extension pressure.

**Why it matters**
Without a structural boundary, article work will almost certainly blur homepage and article responsibilities.

**Correction direction**
Make ownership explicit now.

---

## H. Manifest / runtime findings

### Finding H-01 — The hero is an adjacent-manifest SPFx webpart with full-width flagship intent
**Severity:** High positive finding

**Evidence**
The hero already participates in the expected flagship homepage packaging pattern.

**Why it matters**
This supports keeping the same SPFx identity if mode separation is clean.

**Correction direction**
Preserve manifest/runtime integrity while hardening the internal mode model.

---

## I. Accessibility / interaction findings

### Finding I-01 — Homepage hero is already minimal and non-interactive
**Severity:** Medium positive finding

**Evidence**
The current hero avoids unnecessary controls and keeps its accessibility burden low.

**Why it matters**
Article mode will add content density and possibly richer metadata, so accessibility and reduced-motion checks must expand there.

**Correction direction**
Keep homepage branch simple; validate article branch separately.

---

## J. Production-readiness findings

### Finding J-01 — Article mode requires a proof surface before it can be considered production-ready
**Severity:** High

**Evidence**
Current proof is centered around homepage/shared surface work, not a dedicated dual-mode hero.

**Why it matters**
This is the kind of change that can compile cleanly while still regressing flagship behavior.

**Correction direction**
Add explicit stories/harness/visual proof for both modes.

---

## K. Refactor vs redesign vs replacement

### Finding K-01 — Replacement is not justified
**Severity:** Critical decision finding

**Evidence**
The homepage branch is already the canonical flagship identity surface and should remain.

**Why it matters**
A replacement would create needless risk and blur what must stay stable.

**Correction direction**
Do not replace the homepage hero.

---

### Finding K-02 — Simple targeted refactor is insufficient
**Severity:** Critical decision finding

**Evidence**
The work requires:
- host-aware locking
- new article contract
- new author/photo seam
- runtime/property-pane extension
- validation expansion

**Why it matters**
This is more than a small refactor.

**Correction direction**
Treat the work as a structural redesign with preserved homepage branch.

---

## Major architectural opportunities

### Opportunity O-01 — Thin adapters over shared seams
**Why current leaves quality on the table**
The current hero is tightly scoped and the richer shared primitive exists elsewhere.

**Stronger answer**
Use:
- `HbSignatureHeroHomepage`
- `HbSignatureHeroArticle`
- `resolveSignatureHeroMode`
- shared lower-level rendering seam

**Classification**
Structural redesign

---

### Opportunity O-02 — Neutral article author identity helper
**Why current leaves quality on the table**
Author/photo behavior is absent in hero and currently “lives” conceptually in Kudos.

**Stronger answer**
Create a neutral helper for article author identity/photo hydration.

**Classification**
Targeted refactor inside broader redesign

---

### Opportunity O-03 — Hard host lock
**Why current leaves quality on the table**
HBCentral preservation is currently more cultural than enforced.

**Stronger answer**
Add a hard host/site resolver rule.

**Classification**
Targeted refactor with high risk reduction

---

## Phase 4 — Executive audit summary

## Current architecture judgment
`HbSignatureHero` is a locked flagship homepage adapter, not a reusable dynamic article hero.

## Current HBCentral preservation requirement
HBCentral must remain on the current flagship homepage branch with no article furniture.

## Current article-mode gap
There is no explicit article contract, renderer, author model, or runtime input path today.

## Correct architecture recommendation
Use a **dual-mode structural redesign**:
- locked homepage adapter
- explicit article adapter
- shared lower-level rendering seam
- shared neutral author/photo seam
- hard host-aware mode resolver

## Biggest risks
- direct homepage prop extension
- accidental Kudos coupling
- no runtime host lock
- weak validation of flagship regression

## Highest-priority remediation themes
1. hard-lock HBCentral homepage mode
2. introduce explicit article mode
3. wire neutral author/photo seam
4. extend runtime/property-pane inputs
5. add proof and closure validation

## Correct final decision
**Structural redesign, not replacement.**

---

## Phase 5 — Prompt package generation

The companion markdown prompt package in this folder is the implementation package recommended by this audit.

Use the files in strict sequence.
