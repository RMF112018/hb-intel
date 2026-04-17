# PriorityActionsRail + PriorityActionsRailAdmin Specification

## Status
Draft implementation specification for the HB Central homepage command-band system and its friendly authoring surface.

## Governing authority

This specification is governed first by:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

It is also governed by the SPFx homepage benchmark package under:

- `docs/architecture/plans/MASTER/spfx/benchmark/**`

If this spec conflicts with doctrine, doctrine governs.
If this spec conflicts with the benchmark package, doctrine still governs and the benchmark package is interpreted beneath doctrine.

---

## 1. Purpose

Create a homepage-grade command-band system composed of:

- `PriorityActionsRail` — the public-facing homepage utility/launcher surface
- `PriorityActionsRailAdmin` — the authoring/configuration surface for designated maintainers

Together, these must replace the current SharePoint Quick Links row with a productized HB-owned system that is:

- shell-aware
- audience-aware
- premium and visibly non-generic
- compact and efficient
- friendly to maintainers
- resilient in SharePoint host conditions
- benchmark-grade without becoming visually interchangeable with HB Kudos or other homepage webparts

---

## 2. Product intent

### 2.1 Public product role — `PriorityActionsRail`
`PriorityActionsRail` is the **homepage command band**.

It sits directly below the signature hero and directly above the first shell content lane.
Its job is to:

- expose the highest-frequency destinations and utilities
- provide fast task entry
- reduce friction in the initial load state
- improve scanning clarity relative to stock Quick Links cards
- reinforce the homepage’s operational usefulness without competing with the hero or with downstream shell content

### 2.2 Admin product role — `PriorityActionsRailAdmin`
`PriorityActionsRailAdmin` is the **maintainer authoring surface**.

It must allow designated maintainers to manage:

- action items
- visibility
- order
- grouping
- breakpoint behavior
- overflow behavior
- labels and icons
- audience targeting
- band-level settings

through a friendly product UI.

Maintainers must not be required to mutate raw SharePoint list items directly.

---

## 3. Persona and design posture

### 3.1 `PriorityActionsRail` persona
The public rail must be:

- operational
- compact
- efficient
- command-oriented
- premium
- fast-scanning
- confident but visually subordinate to the flagship hero

It must **not** read as:

- a white-card link grid
- a second hero
- a generic launcher wall
- a row of SharePoint-flavored tiles
- a clone of HB Kudos

### 3.2 `PriorityActionsRailAdmin` persona
The admin surface must be:

- authoring-oriented
- clear
- controlled
- trustworthy
- benchmark-grade
- preview-rich
- lower-ceremony than a flagship public surface
- still visibly premium and productized

It must **not** read as:

- a raw list editor
- a property-pane replacement with weak hierarchy
- stock Fluent admin chrome with a brand tint
- a pseudo-application shell inside SharePoint page content

---

## 4. Strict doctrine translation

### 4.1 Host posture
Both applications must respect the SharePoint host.
They may not:

- create fake shell chrome
- duplicate navigation systems
- fight SharePoint host behavior
- depend on unsupported DOM manipulation

### 4.2 Homepage import discipline
Both homepage surfaces must import from:

- `@hbc/ui-kit/homepage`

as the primary UI entry point.

Use of:

- `@hbc/ui-kit/theme`
- `@hbc/ui-kit/icons`

is allowed where needed.

Broad imports from `@hbc/ui-kit` root or `@hbc/ui-kit/app-shell` are prohibited.

### 4.3 Premium stack requirement
Where relevant, implementation must deliberately use the approved premium stack:

- `motion` via `motion/react`
- `lucide-react`
- `@floating-ui/react`
- `@radix-ui/react-slot`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-separator`
- `@radix-ui/react-scroll-area`
- `class-variance-authority`
- `clsx`

The stack must be used materially, not installed symbolically.

### 4.4 Anti-safety-zone rule
Neither application may settle into:

- timid enterprise card-grid outcomes
- thin-border repeated white cards as the dominant language
- pseudo-icons
- decorative-only uplift over a weak composition model

### 4.5 Authoring safety
Both applications must behave well when:

- minimally configured
- partially configured
- lists are missing or stale
- data is incomplete
- viewed in SharePoint edit mode
- rendered in non-ideal section widths

### 4.6 States are mandatory
Both applications must have credible:

- loading state
- empty state
- partial-configuration state
- error state
- success state where applicable

---

## 5. Benchmark translation

The benchmark package requires **Kudos-grade rigor**, not Kudos visual sameness.
That translates here as follows.

### 5.1 Public rail benchmark target
`PriorityActionsRail` must achieve benchmark-grade maturity for a compact launcher/utility surface by demonstrating:

- complete interaction model for its purpose
- explicit contracts and normalization seams
- deliberate fallback/overflow behavior
- shell-aware responsive logic
- host-safe runtime behavior
- premium but compact surface execution
- proof-based closure

### 5.2 Admin benchmark target
`PriorityActionsRailAdmin` must achieve equivalent rigor for an authoring surface by demonstrating:

- friendly end-to-end maintenance workflow
- draft state and validation
- preview state
- success/error/discard flows
- clear source-of-truth writes
- benchmark-grade runtime and closure proof

### 5.3 Acceptance targets
Use the benchmark matrix as follows:

- `PriorityActionsRail` target: **36+/40** and no category below 2
- `PriorityActionsRailAdmin` target: **32+/40** minimum, with a preferred target of **36+/40**, and no category below 2
- no closure is allowed if material doctrine violations remain

### 5.4 Anti-homogenization rule
Benchmark-grade does **not** mean:

- reusing HB Kudos layout patterns as a template
- copying HB Kudos panel structures when not warranted
- cloning emotional tone or interaction rhythm

The rail must remain utility-first.
The admin must remain authoring-first.

---

## 6. Canonical architecture

## 6.1 Public webpart
**Path target:**
`apps/hb-webparts/src/webparts/priorityActionsRail/`

### Required files
- `PriorityActionsRail.tsx`
- `PriorityActionsRail.manifest.json`
- `PriorityActionsRailWebPart.ts`
- `PriorityActionsRail.module.scss` or equivalent style seam
- local helpers only where truly webpart-specific

## 6.2 Admin webpart
**Path target:**
`apps/hb-webparts/src/webparts/priorityActionsRailAdmin/`

### Required files
- `PriorityActionsRailAdmin.tsx`
- `PriorityActionsRailAdmin.manifest.json`
- `PriorityActionsRailAdminWebPart.ts`
- `PriorityActionsRailAdmin.module.scss` or equivalent

## 6.3 Shared homepage primitives
Create the shared surface family under the homepage entry point, not as ad hoc local UI:

**Recommended target:**
`packages/ui-kit/src/homepage/surfaces/priority-rail/`

### Required exports
- `HbcPriorityRailSurface`
- `HbcPriorityRailAction`
- `HbcPriorityRailOverflow`
- `HbcPriorityRailSkeleton`
- `HbcPriorityRailEmptyState`
- `HbcPriorityRailErrorState`
- `HbcPriorityRailPreviewSurface`

### Optional supporting exports
- `HbcPriorityRailBadge`
- `HbcPriorityRailIconFrame`
- `HbcPriorityRailSectionLabel`
- `HbcPriorityRailMoreSheet`

## 6.4 Local admin composition territory
Admin-only composition shells may remain local to the webpart if they are not yet broadly reusable:

- form shell
- action-row editor
- reorder canvas
- preview dock
- validation summary panel

Promote only when reuse is justified.

---

## 7. Canonical data model

Use the two-list model already defined for this effort:

- `Priority Actions Band Config`
- `Priority Actions Band Items`

The public rail and admin surface must share one canonical typed contract layer.

### Required contract layers
- raw SharePoint row interfaces
- normalized public render contract
- admin draft contract
- validation result contract
- write-command contract

### Required seam discipline
No direct stringly typed access scattered through rendering code.
Use:

- descriptors for internal list names and field names
- explicit mapping/adapters
- testable normalization predicates
- explicit writer seams

---

## 8. Shared contracts

## 8.1 Public render contract

```ts
interface PriorityRailBandConfig {
  bandKey: string;
  heading?: string;
  overflowLabel: string;
  enabled: boolean;
  maxVisibleDesktop: number;
  maxVisibleLaptop: number;
  maxVisibleTabletLandscape: number;
  maxVisibleTabletPortrait: number;
  maxVisiblePhone: number;
  mobileLayoutMode: 'grid' | 'scroll' | 'sheet-trigger';
  tabletLayoutMode: 'grid' | 'rail' | 'hybrid';
  desktopLayoutMode: 'rail' | 'segmented' | 'hybrid';
  showHeading: boolean;
  stickyAfterHero: boolean;
  showBadges: boolean;
  openExternalInNewTabByDefault: boolean;
}

interface PriorityRailActionItem {
  actionKey: string;
  title: string;
  description?: string;
  href: string;
  iconKey?: string;
  badgeLabel?: string;
  badgeVariant?: 'neutral' | 'info' | 'warning' | 'success' | 'critical';
  priority: 'primary' | 'secondary' | 'overflow';
  groupKey?: string;
  groupTitle?: string;
  order: number;
  isExternal: boolean;
  openInNewTab: boolean;
  audienceMode: 'all' | 'include-only' | 'exclude' | 'role-driven';
  audienceKeys: string[];
  visibleDesktop: boolean;
  visibleLaptop: boolean;
  visibleTabletLandscape: boolean;
  visibleTabletPortrait: boolean;
  visiblePhone: boolean;
  overflowOnly: boolean;
  mobilePriority?: number;
  startsAtUtc?: string;
  endsAtUtc?: string;
}
```

## 8.2 Admin draft contract
The admin draft contract must separate:

- persisted values
- unsaved draft values
- validation issues
- dirty state
- publish eligibility
- preview mode

---

## 9. `PriorityActionsRail` functional specification

## 9.1 Placement and section ownership
The public rail is a homepage utility/command surface.
It should be placed:

- directly beneath the flagship hero
- directly above the first shell lane
- in a standard-width section unless a future shell contract explicitly widens it

It must not visually compete with the hero.
It must compress the transition from identity to action to value.

## 9.2 Surface composition
The rail must render as a **single premium command band**, not as repeated stock cards.

### Required structural zones
- optional section label / heading area
- primary actions region
- optional secondary actions or grouped segment treatment
- overflow affordance
- optional status/badge treatment

### Strongly preferred public layout behaviors
- compact horizontal rail on desktop/laptop
- guided compact grid or snapped rail on tablet
- 2×2 or 1×N mobile-friendly top actions on phone
- overflow panel / sheet for non-primary destinations

## 9.3 Primary user actions
Primary user behaviors are:

- scan top tasks quickly
- launch a destination quickly
- understand action meaning immediately
- discover additional tools without visual overload

The public rail is **not** responsible for:

- deep navigation
- analytics dashboards
- long-form metadata presentation
- editorial storytelling

## 9.4 Public interaction model
Required interactions:

- hover refinement on desktop
- press feedback
- keyboard navigation
- tooltip support where compact affordances require clarification
- optional sticky compact mode after hero scroll-off
- overflow open/close
- external-link indication

### Not allowed
- hover-only critical information
- hidden semantics behind icon-only actions
- lazy browser `confirm`/`prompt` UX
- dead affordances

## 9.5 Visual language
The public rail must use:

- real iconography via `lucide-react`
- clear titles
- optional short descriptions only when space supports them
- premium CTA states
- refined separators and rhythm
- restrained motion
- distinct hierarchy between primary visible actions and overflowed actions

### Explicitly prohibited
- Unicode icons
- initial-based pseudo-icons
- generic white card repetition
- button rows that still feel like stock Fluent UI

## 9.6 Responsive behavior
### Desktop / ultrawide
- 5–6 visible primary actions
- overflow appears as anchored panel or popover
- optional sticky compact mode after hero scrolls off

### Laptop
- 4–5 visible primary actions
- more aggressive overflow
- tighter spacing and reduced descriptions

### Tablet landscape
- 4 visible primary actions
- either compact rail or 2×2 / 2×3 model depending on slot width

### Tablet portrait
- 4 visible actions max
- grid-first layout
- single-column shell relationship preserved below the rail

### Phone
- 3–4 visible primary actions
- bottom sheet or compact overflow pattern
- simplified icon + label structure
- no tiny horizontal micro-cards

## 9.7 State classes
### Loading
- skeleton rail using `HbcPriorityRailSkeleton`
- no layout shift beyond acceptable skeleton bounds

### Empty
- explain what the webpart is
- explain that no actions are configured yet
- maintain author-safe clarity in edit mode

### Partial configuration
- surface explains missing config clearly
- must not collapse into a broken blank area

### Error
- professional, compact error state
- no raw exception text in public view
- correlation or support-friendly detail may exist in admin/dev modes only

### Success / normal
- clear primary actions
- stable layout
- premium responsiveness

## 9.8 Accessibility requirements
- full keyboard reachability
- visible focus indicators
- 4.5:1 text contrast minimum, 3:1 interactive minimum
- no hover-only critical information
- `prefers-reduced-motion` respected
- semantic button/link behavior
- tooltips not required for core understanding

## 9.9 Runtime seam requirements
- canonical read path from active config row + enabled item rows
- explicit audience filtering
- explicit breakpoint visibility filtering
- explicit overflow resolution
- no stale-after-action drift if caching is introduced

## 9.10 Manifest requirements
- adjacent manifest is required
- no full-bleed requirement expected for the command band itself unless design changes later justify it
- package output must preserve structural intent and host rendering fidelity

---

## 10. `PriorityActionsRailAdmin` functional specification

## 10.1 Placement and audience
This webpart is for homepage maintainers.
It should live on a controlled admin/maintainer page and may also be reused in a dedicated homepage management page later.

It is not intended to live in the public homepage flow.

## 10.2 Primary maintainer jobs
The admin surface must let authorized maintainers:

- review current live band configuration
- add a new action
- edit an existing action
- reorder actions
- archive or disable actions
- configure visible counts by breakpoint
- configure overflow label and layout modes
- configure audience targeting
- preview desktop/tablet/phone output
- validate before save/publish

## 10.3 Admin IA / required surface regions
### Region A — Band settings
- heading
- overflow label
- layout modes
- max visible counts by breakpoint
- sticky mode toggle
- badge visibility toggle
- default external-link behavior

### Region B — Action library / editor
- list/grid of actions
- search/filter by title, group, priority, status
- edit affordance
- archive/disable affordance
- duplicate action affordance if justified

### Region C — Reorder and prioritization surface
- drag-and-drop ordering for primary actions
- overflow assignment controls
- mobile priority controls
- group assignment controls

### Region D — Validation summary
- blocking errors
- warnings
- publish readiness

### Region E — Preview
- desktop preview
- laptop preview
- tablet preview
- phone preview
- preview must render through the same shared rail surface family as production

## 10.4 Required admin workflows
### Add action
- open structured editor panel/dialog
- complete required fields
- validate before save
- update preview immediately after save

### Edit action
- structured edit UI
- live draft state
- unsaved change guard

### Reorder actions
- drag-and-drop or equivalent premium reorder model
- deterministic persisted order result
- immediate preview refresh

### Toggle breakpoint visibility
- direct checkbox/toggle controls by device class
- preview update required

### Archive / disable action
- confirmation step if impact is material
- explicit status messaging after success

### Save / publish
- explicit success confirmation
- read-after-write refresh
- failure state with retry path

### Discard changes
- dirty-state guard
- explicit discard confirmation

## 10.5 Admin interaction quality standard
The admin surface must be benchmark-grade.
That means it must not stop at “form fields that save.”
It must include:

- structured draft state
- visible validation
- clear save/discard model
- preview fidelity
- success/error messaging
- deterministic state transitions

## 10.6 Admin visual posture
The admin surface may use more explicit controls than the public rail, but it must still feel:

- refined
- productized
- modern
- clearly better than a raw SharePoint list editor

### Allowed
- wrapped Fluent primitives where ergonomically justified
- richer form controls
- side panels or dialogs
- helper text
- explicit validation messaging

### Not allowed
- stock Fluent as the dominant premium language
- weak hierarchy
- crowded form walls
- raw list-grid editing as the primary UX
- browser-native prompt/confirm flows

## 10.7 Admin state classes
### Loading
- skeleton or structured loading shell

### Empty
- explain that no config/items are present
- offer guided setup actions

### Partial configuration
- explain what is missing
- keep save and preview logic credible

### Error
- human-readable error summary
- optional technical detail region for maintainers when appropriate

### Success
- visible saved state confirmation
- no ambiguous silent saves

### Dirty draft
- explicit unsaved change indicator
- protected navigation/discard behavior

## 10.8 Permission and safety model
The admin surface must:

- hide or disable write actions for unauthorized users
- explain insufficient permissions clearly
- avoid exposing raw backend errors or internal-only data publicly

## 10.9 Accessibility requirements
Same doctrine minimums apply:

- keyboard-complete authoring flow
- visible focus
- semantic controls
- contrast compliance
- reduced-motion respect
- no inaccessible drag-only workflow; reorder must have a keyboard-safe path

## 10.10 Write seam requirements
Writers must be explicit and disciplined.
Required characteristics:

- canonical source binding
- deterministic write commands
- read-after-write refresh
- failure handling
- no silent stale UI after write
- clear separation between config writes and item writes

---

## 11. Shared surface family specification

## 11.1 `HbcPriorityRailSurface`
Purpose: render the public and preview rail through one governed surface family.

### Required variants
- `desktop`
- `laptop`
- `tabletLandscape`
- `tabletPortrait`
- `phone`
- `compactSticky`
- `skeleton`
- `empty`
- `error`

### Required sub-primitives
- action shell
- icon frame
- label block
- description block
- badge token
- overflow trigger
- overflow content surface
- separator rhythm primitive

### Variant management
Use `class-variance-authority` + `clsx` for:

- density
- breakpoint mode
- sticky mode
- emphasis level
- badge presence
- grouped vs ungrouped presentation

## 11.2 Motion requirements
Use `motion/react` for:

- subtle reveal
- hover/press refinement
- overflow open/close polish
- sticky compaction transition if implemented

Motion must be:

- restrained
- fast
- premium
- reduced-motion aware

## 11.3 Overlay requirements
Use `@floating-ui/react` for:

- overflow popover positioning
- tooltip positioning
- contextual anchored panels where needed

## 11.4 Tooltip requirements
Use `@radix-ui/react-tooltip` only where compact affordances need clarification.
Tooltips must not carry critical information required to use the rail.

## 11.5 Scroll requirements
Use `@radix-ui/react-scroll-area` where overflow panes or compact panels need polished scroll handling.

---

## 12. Data and seam design

## 12.1 Required descriptor modules
Create descriptor modules for:

- `Priority Actions Band Config`
- `Priority Actions Band Items`

These must define:

- list title
- internal field names
- raw row types

## 12.2 Required read seams
- `readPriorityRailBandConfig(...)`
- `readPriorityRailItems(...)`
- `resolveActivePriorityRailConfig(...)`
- `normalizePriorityRailData(...)`
- `filterPriorityRailByAudience(...)`
- `resolvePriorityRailByBreakpoint(...)`

## 12.3 Required write seams
- `savePriorityRailBandConfig(...)`
- `savePriorityRailItems(...)`
- `reorderPriorityRailItems(...)`
- `archivePriorityRailItem(...)`
- `validatePriorityRailDraft(...)`

## 12.4 No false simplicity
Do not hide complexity by collapsing everything into one component.
Complexity must be organized into named seams.
That is the benchmark expectation.

---

## 13. Validation rules

### Public rail
- at least one enabled config row per `BandKey`
- active row resolution deterministic
- action titles required
- target URLs required
- icon keys validated
- visibility rules consistent
- scheduled actions must have valid date ranges

### Admin
- unsaved drafts tracked explicitly
- publish blocked by validation errors
- no save path allowed with inconsistent order/priority state
- no drag-only reorder dependency

---

## 14. Hosted validation requirements

Both webparts must be validated in SharePoint-hosted runtime conditions.

### Public rail hosted proof
Required:
- screenshots in desktop, laptop, tablet, and phone-like widths
- keyboard/focus proof
- reduced-motion check
- overflow behavior proof
- public empty/error/partial state proof
- visual proof that it is benchmark-grade without reading like a Kudos clone

### Admin hosted proof
Required:
- add/edit/reorder/archive workflow proof
- draft/discard proof
- validation-block proof
- success/error write proof
- preview fidelity proof across device modes
- permission-state proof

---

## 15. Acceptance criteria

## 15.1 `PriorityActionsRail`
The public rail is complete only when:

- it clearly improves the homepage initial load state relative to stock Quick Links
- it feels compact, premium, and operational
- it does not compete destructively with the signature hero or the first shell lane
- it uses the homepage premium stack materially
- it has credible loading/empty/error states
- it is accessible and keyboard-complete
- it has explicit contracts and read seams
- it passes hosted validation
- it meets benchmark scoring target and doctrine compliance

## 15.2 `PriorityActionsRailAdmin`
The admin surface is complete only when:

- maintainers can manage the rail without editing SharePoint list items directly
- the full authoring workflow is credible and benchmark-grade
- preview matches public rendering through shared primitives
- draft/save/discard/error states are complete
- write seams are explicit and reliable
- permission handling is clear
- hosted validation is complete
- it meets benchmark scoring target and doctrine compliance

---

## 16. Explicit non-goals

This effort must not:

- clone HB Kudos UI patterns where they do not fit
- create fake shell chrome in homepage page content
- use SharePoint Quick Links styling as the dominant design language
- depend on raw list editing as the maintainer UX
- treat the admin surface as a property pane substitute only
- implement decorative polish without seam rigor
- collapse the public rail into a general homepage shell editor

---

## 17. Implementation sequence

1. Lock doctrine obligations and benchmark targets.
2. Lock persona for public and admin surfaces.
3. Finalize list descriptors and contracts.
4. Implement read/write seams.
5. Build shared `HbcPriorityRailSurface` family.
6. Refactor / implement `PriorityActionsRail` against the shared surface.
7. Implement `PriorityActionsRailAdmin` with preview backed by the same surface family.
8. Run hosted validation and scorecard review.
9. Close only when doctrine, benchmark, and hosted proof all pass.

---

## 18. Final quality statement

The finished result must feel like:

- a premium HB-owned command-band system,
- benchmark-grade in execution quality,
- purpose-fit for utility/authoring work,
- visibly non-generic inside SharePoint,
- and structurally ready for future homepage shell evolution.
