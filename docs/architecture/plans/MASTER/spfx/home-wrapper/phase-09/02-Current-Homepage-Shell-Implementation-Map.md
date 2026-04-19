# Current Homepage Shell Implementation Map

## Objective of this map

This map shows the **active ownership and runtime flow** that currently governs the homepage shell. It focuses only on seams that materially affect shell behavior.

## Top-level ownership model

### 1. SPFx mount path
The homepage runtime is mounted through the SPFx hbHomepage webpart path.

### 2. Entry-stack wrapper
The entry-stack wrapper owns:
- outer envelope authority,
- pre-shell composition,
- launcher-band placement,
- shell region handoff,
- and entry-level data attributes.

### 3. Shell
The shell owns:
- layout parsing,
- container-aware shell width logic,
- preset resolution,
- first-lane promotion and recomposition,
- band layout resolution,
- slot rendering,
- and conformance diagnostics.

### 4. Zones / occupants
Hosted applications render inside shell slots through zone wrappers and occupant registry metadata.

---

## Active runtime flow

### Step 1 — Mount and homepage bootstrap
The mount path resolves runtime context such as host URLs, token providers, and site context, then renders the homepage application.

### Step 2 — Entry-stack composition
`HbHomepage` passes through to `HbHomepageEntryStack`.

`HbHomepageEntryStack`:
- establishes the outer envelope,
- conditionally renders the launcher/actions region,
- renders the shell region,
- and exposes the wrapper contract marker used by downstream measurement logic.

### Step 3 — Launcher band
The launcher band resolves its own responsive behavior from container measurement and maps priority actions into primary and overflow buckets.

### Step 4 — Shell orchestration
`HbHomepageShell`:
- reads layout config,
- extracts shell layout,
- resolves the active preset,
- resolves shell container dimensions,
- resolves first-lane recomposition,
- resolves each band layout,
- evaluates shell conformance,
- and renders each band and slot.

### Step 5 — Occupant rendering
Each slot resolves through the occupant registry and zone wrappers to render the hosted module or a governed fallback surface.

---

## Important active files and why they matter

### Wrapper / contract seams
- `hbHomepageContract.ts`  
  Defines authoritative ownership boundaries, outer envelope constants, and homepage prop contracts.

- `HbHomepageEntryStack.tsx`  
  Composes launcher-band + shell within the outer entry stack.

- `HbHomepageEntryStack.module.css`  
  Controls outer envelope sizing, wrapper gap behavior, and shared wrapper gutters.

- `hbHomepageWrapperConfig.ts`  
  Extracts wrapper-local config, especially launcher-band enablement and audience behavior.

### Shell orchestration seams
- `HbHomepageShell.tsx`  
  Core shell runtime.

- `HbHomepageShell.module.css`  
  Governs shell padding, band layout classes, shell region spacing, and paired vs stacked band presentation.

- `useShellContainer.ts`  
  Computes shell width state using shell element measurement plus authoritative outer-envelope measurement.

- `breakpointPolicy.ts`  
  Defines entry states and shell breakpoint logic.

- `firstLaneResolver.ts`  
  Determines first-lane promotion/recomposition behavior.

- `slotComfortResolver.ts`  
  Resolves stack vs pair decisions and render-mode hints for slots.

- `shellConformance.ts`  
  Produces conformance reporting based on active shell decisions.

### Composition schema seams
- `shellTypes.ts`
- `shellSchema.ts`
- `shellValidation.ts`
- `defaultPreset.ts`
- `presetLibrary.ts`
- `protectedDecisions.ts`

These define the allowed shell vocabulary, preset structure, and validation model.

### Hosted-application fit seam
- `occupantRegistry.ts`

This is the core metadata seam that decides:
- where occupants are allowed,
- whether they are first-lane eligible,
- their width guidance,
- and some fit/comfort metadata.

### Launcher seam
- `HbHomepageLauncherBand.tsx`

This governs priority-action/launcher behavior and currently resolves responsive item visibility from its own container measurement path.

---

## Architectural strengths

1. **The shell has real governance seams.**  
   This is not an ad hoc page-level grid.

2. **The wrapper and shell do not share ambiguous ownership.**  
   That separation is a strength.

3. **There is already a conformance mindset in the codebase.**  
   That is valuable and should be expanded, not replaced.

---

## Architectural weaknesses

1. **Entry experience state is not yet unified.**  
   Launcher and shell still make some responsive decisions through separate measurement paths.

2. **Layout vocabulary is too narrow.**  
   The shell does not yet expose enough governed layout archetypes to deliver the intended modular portal composition.

3. **Hosted surfaces do not yet publish a sufficiently explicit shell-fit contract.**  
   Width metadata alone is not enough.

4. **Preset ambition is still low.**  
   The default preset remains too stack-heavy and too cautious.

---

## Practical implication

The right remediation path is **not** a total teardown.

The right path is:
- preserve the existing authority seams,
- preserve the shell as the layout governor,
- preserve the entry-stack contract,
- but materially strengthen the shell grammar, shared measurement truth, hosted-surface fit model, and validation proof system.
