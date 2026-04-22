# 02 — Checklist-Based Assessment

## 0. Doctrine preflight

### Preserve
- The audit used the live `main` branch as implementation truth.
- The checklist, scorecard, SPFx doctrine, and homepage overlay were reviewed.

### Insufficient
- Package-truth evaluation was requested, but the `.sppkg` referenced in the prompt was not actually available in this session.

### Weak / failing
- Hosted evidence is limited to a single screenshot, not a seven-breakpoint or real package matrix.
- No proof that the packaged result preserves the intended structure.

### Correction direction
- Add hosted/package proof as a required closure artifact.

### Work type
- refinement + closure infrastructure

---

## 1. Doctrine and host compliance

### Preserve
- The app does not try to suppress SharePoint chrome.
- The app remains inside the canvas region.
- The shell is directionally “coexist with host,” not “rebuild Microsoft shell.”

### Insufficient
- The simplified shell still adds its own internal top strip, tool-picker row, and back-band without enough visual authority or ergonomic payoff.
- The app behaves like it owns a full viewport because `#root` and shell wrappers are forced to `min-height: 100vh`.

### Weak / failing
- The current hosted posture reads as a dropped-in module, not a first-class SPFx product surface.
- The tool-picker is raw buttons rather than a credible, host-aware premium navigation object.

### Why it matters
The doctrine requires coexistence plus premium page-canvas ownership. The current result coexists, but does not elevate.

### Recommended direction
- keep host-respect
- rebuild the internal workspace header/nav into a stronger, thinner, more productized workspace masthead
- remove implicit full-viewport assumptions where they create dead space

### Work type
- structural redesign

---

## 2. UI-kit doctrine and premium-stack compliance

### Preserve
- The app uses governed pieces from `@hbc/ui-kit` for shell, buttons, selects, typography, banner, and empty state.

### Insufficient
- UI-kit usage is basic, not premium
- no evidence of deliberate premium-stack adoption in the Safety surface family

### Weak / failing
- no meaningful use of:
  - `motion`
  - `lucide-react`
  - `@floating-ui/react`
  - Radix overlay/scroll primitives
  - `class-variance-authority`
  - `clsx`-driven surface variants
- the visual result still reads like default enterprise UI with very light customization

### Why it matters
The governing posture explicitly rejects “stock enterprise UI with a brand tint” as the flagship answer.

### Recommended direction
Create a Safety-specific surface family that materially uses the premium stack where it adds value:
- tabs / workspace nav
- filters
- findings severity chips
- review row actions
- responsive overflow
- compact metadata affordances

### Work type
- structural redesign

---

## 3. Token, styling, and local-primitive discipline

### Preserve
- Base shell tokens exist in `WorkspacePageShell`.
- Some shared typography/button primitives are reused.

### Insufficient
- the app has almost no local primitive system of its own

### Weak / failing
- repeated raw HTML tables
- repeated inline grid/flex styles
- fixed spacing and layout logic in page files
- no reusable card/list/detail surface primitives
- no cohesive family for stat cards, score strips, review rows, or findings

### Why it matters
Flagship closure requires a governed family of reusable patterns, not one-off page-level styling.

### Recommended direction
Introduce a `safety-ui/` layer:
- `SafetyWorkspaceMasthead`
- `SafetyFilterBar`
- `SafetyStatCard`
- `SafetyDataGrid`
- `SafetyFindingsStack`
- `SafetyReviewActionBar`
- `SafetyEmptyPanel`
- `SafetyUploadPanel`

### Work type
- structural redesign

---

## 4. Purpose-fit and persona

### Preserve
- The upload-first purpose is understandable quickly.
- The content tone is appropriately operational and serious.

### Insufficient
- The app communicates function, but not confidence or product quality.

### Weak / failing
- The current first screen does not feel like the right class of tool for a safety record-keeping workflow.
- It feels assembled, not productized.

### Why it matters
Safety record keeping should read as authoritative, deliberate, and trustworthy. The current surface reads as baseline-admin.

### Recommended direction
Recast the persona around:
- operational authority
- fast weekly throughput
- confidence in ingest / review / inspection lineage
- stronger risk/status signaling

### Work type
- refinement + structural redesign

---

## 5. Surface composition and hierarchy

### Preserve
- Each page does have a clear nominal task.

### Insufficient
- Hierarchy exists, but weakly.

### Weak / failing
- massive dead space
- narrow content rail
- tables dropped directly on the page
- no authored sectional rhythm
- no confident width usage
- no strong primary/secondary composition

### Why it matters
This is the clearest blocker to flagship status. The current surface does not feel authored.

### Recommended direction
- use width decisively
- convert pages into top summary + task band + main content sections
- add carded/stat/risk components where appropriate
- turn tables into premium grids with mobile fallbacks

### Work type
- structural redesign

---

## 6. Homepage-specific integration quality

### Preserve
- The app does not commit classic homepage sins like fake suite-bar recreation.

### Insufficient
- It is acceptable as an embedded application, but not strong enough to meet homepage-grade visual rigor.

### Weak / failing
- It does not contribute a premium “hosted application surface” quality.
- It looks serviceable, not flagship.

### Why it matters
The prompt explicitly asks for homepage-grade rigor even though the app is operational.

### Recommended direction
Bring the Safety app up to the same seriousness standard:
- stronger masthead
- premium tab system
- compositional discipline
- non-generic data surfaces

### Work type
- refinement + redesign

---

## 7. Breakpoint and shell-fit quality

### Preserve
- The shell is simple enough that it is unlikely to catastrophically break immediately.

### Insufficient
- Simplicity is doing too much work; there is little explicit compact-mode design.

### Weak / failing
- fixed 4-column stats in detail pages
- raw tables with no compact/mobile alternative
- no container-aware strategy
- no explicit narrowest stable mode
- no overflow treatment for navigation/actions

### Why it matters
The doctrine requires explicit breakpoint behavior, not “it probably collapses.”

### Recommended direction
Define Safety breakpoint modes:
- wide
- medium
- compact
- handheld
- short-height
and specify what stacks, collapses, hides, or becomes drawer/panel content in each mode.

### Work type
- structural redesign

---

## 8. Interaction completeness

### Preserve
- Upload, review retry, drill-ins, and source workbook access are real.
- Review queue has actionable replay logic.

### Insufficient
- Interaction depth is uneven and visually weak.

### Weak / failing
- no confirmation/dialog shells around consequential actions
- no strong row/detail interaction model
- no richer drill-down surfaces for findings
- Incidents route is exposed before the feature is credible

### Why it matters
A flagship workflow surface should reward deeper interaction with clear utility, not just expose basic lists and links.

### Recommended direction
- elevate upload result into a meaningful post-submit summary panel
- add review action dialogs / confirmation panels
- add richer inspection findings navigation
- hide or clearly gate incomplete modules

### Work type
- refinement + targeted redesign

---

## 9. State-model completeness

### Preserve
- `WorkspacePageShell` can support professional loading / error / empty states.
- `IncidentsPage` uses a governed smart empty state.

### Insufficient
- The page layer does not consistently activate those capabilities.

### Weak / failing
- pages default query results to `[]`
- loading often appears indistinguishable from empty
- errors are mostly unhandled at page level
- no true partial-config state at page level
- shell states are available but largely bypassed

### Why it matters
This is a direct checklist failure and a hard-stop risk. State ambiguity makes the app feel brittle.

### Recommended direction
For every route, define:
- loading
- truly empty
- filtered empty
- error
- success / fresh
- partial config
- replay pending
and wire them into `WorkspacePageShell`.

### Work type
- structural redesign

---

## 10. Data, contract, and backend discipline

### Preserve
- This is one of the strongest areas.
- The repository, hook, and ingestion contracts are explicit and typed.
- Refresh behavior on mutations invalidates safety queries.
- Ownership boundaries are reasonably clear.

### Insufficient
- Strong backend/domain discipline is not translated into equally strong UX states.

### Weak / failing
- UI rendering often collapses nuanced domain states into generic list/table rows.
- the UI does not express enough of the pipeline seriousness and status richness available in the model

### Why it matters
This area can support flagship UX if the presentation layer catches up.

### Recommended direction
Keep the data architecture; upgrade the presentation contract to expose:
- risk
- replay lineage
- status clarity
- terminal state meaning
- freshness / staleness
- confidence / resolution state

### Work type
- refinement

---

## 11. Identity, media, and attribution quality

### Preserve
- Inspection detail does show inspector metadata and source workbook link.

### Insufficient
- Minimal metadata is present, but not productized.

### Weak / failing
- no strong attribution treatment
- no visual severity/risk hierarchy
- no rich inspection identity object
- no meaningful media/system icon language

### Why it matters
Trust and scanability in an operational surface depend on better metadata treatment.

### Recommended direction
Add:
- status chips
- severity markers
- run lineage labels
- submitted by / inspected by treatment
- project identity block
- section/finding badges

### Work type
- refinement

---

## 12. Accessibility and keyboard behavior

### Preserve
- Semantically, native buttons/inputs/links exist.
- Empty-state and button primitives likely inherit some baseline accessibility.

### Insufficient
- No evidence of deliberate keyboard-first workflow design.
- No visible focus system proof in hosted evidence.

### Weak / failing
- raw tool-picker buttons lack proper active-state semantics
- raw tables have no mobile/accessibility adaptation
- hover/touch/compact behavior is not explicitly governed

### Why it matters
Flagship acceptance cannot rely on “native elements probably help.”

### Recommended direction
- add explicit active tab semantics
- verify focus-visible
- ensure mobile/touch row actions remain reachable
- create keyboard-safe disclosure/dialog patterns

### Work type
- refinement + proof hardening

---

## 13. Host-runtime resilience

### Preserve
- The app stays inside the SharePoint canvas and appears to render stably in the provided screenshot.

### Insufficient
- Only one hosted screenshot was available.

### Weak / failing
- no seven-breakpoint matrix
- no package-truth inspection
- visible blank-space inefficiency in hosted output
- no evidence of zoom or constrained-height validation

### Why it matters
Hosted resilience is part of the product under the doctrine, not optional polish.

### Recommended direction
Require hosted proof for:
- desktop
- laptop
- tablet landscape
- tablet portrait
- phone portrait
- phone landscape / short-height
- high zoom / constrained width

### Work type
- closure hardening

---

## 14. Validation and closure

### Preserve
- There is at least basic smoke E2E coverage.

### Insufficient
- smoke testing is not closure proof

### Weak / failing
- no flagship proof package
- no breakpoint evidence package
- no rich interaction regression coverage
- no hosted package validation in this session

### Why it matters
The scorecard requires evidence-backed closure.

### Recommended direction
Create a closure bundle:
- breakpoint screenshot matrix
- console/runtime capture
- mutation flow proof
- route-state proof
- package install/manifest verification

### Work type
- closure hardening

---

## 15. hbKudos benchmark comparison

### Safety relative to hbKudos today

Where Safety is weaker:
- much thinner visual identity
- much weaker secondary/detail shells
- far less developed styling system
- less mature host-safe layout sophistication
- weaker proof posture
- weaker responsive composition

Where Safety is already directionally aligned:
- better than a monolith in terms of domain separation
- has real workflow routes
- respects host boundaries more than many weaker internal tools do

### Conclusion
Safety can use hbKudos as a **quality discipline benchmark**, but it is currently several steps below it in UI/UX maturity.
