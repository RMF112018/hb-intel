# Control Panel Future-State Readiness

## Current readiness verdict
The current shell is **not yet ready** for a future tenant-maintainer homepage control panel.

It is not hostile to that future.
But it does not yet contain the contracts that would make that future safe.

## What already helps

### 1. The shell already centralizes composition
There is a single composed host (`HbHomepageShell.tsx`) rather than homepage composition being spread across unrelated page markup.

### 2. Zone wrappers are already separated
The shell already has per-zone wrapper seams, which is a useful base for future slot modeling.

### 3. Modules are mostly thin consumers
Several modules are already structured in a way that makes shell-level orchestration easier than if they were monoliths.

### 4. Shared surface families exist
This improves the odds of adding shell-fit variants later without rebuilding every module from scratch.

## What blocks or complicates the future

### 1. Placement is hard-coded in JSX
The current order is authored directly in component render order.

### 2. There is no slot registry
The shell has no canonical model of:
- zone names
- zone roles
- allowed occupants
- footprints
- compatibility rules

### 3. There is no module capability contract
The shell does not know:
- which modules can safely be half-width
- which require wide placement
- which can be collapsed
- which need compact variants
- which are incompatible neighbors

### 4. Responsive behavior is owned locally, not orchestrated globally
That is manageable for a static shell.
It becomes risky when reconfiguration is introduced.

### 5. No distinction exists between configurable and non-configurable decisions
Without that distinction, a future control panel will drift toward chaos.

## What should be introduced now

## 1. Shell layout schema
Add a declarative shell model such as:
- layout presets
- bands
- slots
- occupancy rules
- breakpoint rules

This should be code-governed now, even before any admin UI exists.

## 2. Module capability registry
Each shell-eligible module should declare:
- slot compatibility
- minimum comfort width
- allowed footprints
- compact/summary support
- collapse support
- prominence tier eligibility
- whether it may rotate/context-switch

## 3. System-authored guardrails
Introduce explicit guardrails for:
- maximum dominant surfaces per band
- prohibited pairings
- protected flagship zones
- minimum spacing / rhythm rules
- density caps
- fallbacks when a maintainer configuration becomes invalid

## 4. Layout presets, not freeform editing
The future control panel should operate on:
- curated presets
- controlled reorder lists
- approved size choices
- approved grouping choices

It should not allow arbitrary freeform movement and sizing.

## What should eventually be maintainer-configurable

### Good candidates
- choose among approved shell presets
- reorder modules within a compatible band
- toggle optional tertiary modules on/off
- select compact vs expanded treatment for modules that support both
- choose from approved band sequencing variants
- manage visibility windows for future contextual modules
- choose which optional modules appear at all

## What should remain code-governed

### Must remain system-authored
- flagship top-band structure
- minimum width / footprint rules
- compatibility exclusions
- anti-clutter density limits
- breakpoint fallback logic
- accessibility-preserving degradation rules
- hard shell motion limits
- semantic band model

## “Prepare now, implement later” work for the current wave
1. define the shell schema
2. add module capability metadata
3. resolve current shell bands and slots from that schema
4. create invalid-configuration fallback behavior
5. expose no admin UI yet
6. prove that the shell can recompose from data/config safely

## Readiness verdict by category

### Composition centralization
Good enough

### Slot abstraction
Missing

### Layout contract quality
Missing

### Resizing readiness
Missing

### Placement mutability
Too hard-coded

### Responsive governance
Underdeveloped

### Future admin-safety posture
Not ready

## Bottom line
The best way to prepare for the future control panel is **not** to build the control panel first.

It is to build the **governed shell contract first**.
