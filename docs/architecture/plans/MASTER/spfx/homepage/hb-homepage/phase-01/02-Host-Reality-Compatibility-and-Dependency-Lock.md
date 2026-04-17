# 02 — Host Reality, Compatibility, and Dependency Lock

## 1. Full-width host reality and testing rules

SharePoint full-width columns are a communication-site capability. Custom webparts must set `supportsFullBleed: true` in their manifest to be eligible for full-width column placement.

**Rules for this initiative:**

- `hb-homepage` manifest must set `supportsFullBleed: true` because the composed homepage is designed for full-width rendering on a communication site.
- The host must still render acceptably in standard-width column placements. Full-width is the intended posture, not the only valid one.
- Full-width behavior can only be validated on a deployed communication site. Workbench validation does not prove full-width rendering.

## 2. Communication-site validation rules

- True full-width validation requires deployment to a SharePoint communication site with an app catalog.
- Team sites do not support full-width columns. Testing on a team site does not constitute proof.
- If a communication site is not available during Phase 01, this is an external/environmental constraint that must be explicitly named in the closure document — not silently omitted.

## 3. Workbench limitations

- The SharePoint workbench does not support full-width column layouts.
- Workbench validation proves component rendering, mount behavior, context injection, and basic layout — but not full-width host behavior.
- Workbench validation is a necessary but insufficient proof step. It may be used for intermediate checks during implementation but cannot serve as final closure evidence for full-width behavior.

## 4. SPFx/Node/React compatibility implications for this repo

The official SPFx 1.20 compatibility matrix targets React 17 and Node 18. This repo's `apps/hb-webparts` uses:

- React 18.3.1
- Vite 6.0.0 build
- Custom SPFx shell packaging pipeline that injects the Vite-built bundle into SPFx webpart shims

**Rules for this initiative:**

- The current Vite + React 18 + custom shell model is the repo's proven runtime strategy. Phase 01 must not "normalize" it back to generator-style SPFx assumptions.
- The SPFx shell project (`tools/spfx-shell/`) uses SPFx 1.20 dev dependencies for gulp build/package. The Vite app is independent of SPFx's internal React version.
- Node 18 is required for the SPFx shell build step. This is already handled by `build-spfx-package.ts`.
- Do not introduce SPFx generator scaffolding, yeoman templates, or SPFx-style React imports into the Vite-authored app code.

## 5. Preserve the current Vite + SPFx shell model

The packaging pipeline (`tools/build-spfx-package.ts`) implements a custom 5-step process: Vite build → asset copy → manifest/config generation → gulp bundle → gulp package-solution.

**Rules for this initiative:**

- Do not restructure or "simplify" this pipeline during Phase 01.
- New webpart additions follow the existing pattern: add a manifest file adjacent to the webpart folder, register the GUID in `mount.tsx`, and the pipeline discovers and processes it automatically.
- Content hashing, shell-entry shim generation, and shim-proof verification must continue to function for all webparts after `hb-homepage` is added.
- Any change to packaging inputs must be minimal and additive.

## 6. Dependency posture

### Reuse first

The doctrine-approved premium stack is already centralized in `packages/ui-kit`:

- `motion` (animation)
- `lucide-react` (icons)
- `@floating-ui/react` (positioning)
- Radix primitives (`@radix-ui/react-separator`, etc.)
- `class-variance-authority` + `clsx` (variant styling)
- `@fluentui/react-components` (Fluent UI v9)
- `@griffel/react` (CSS-in-JS)

These are re-exported through `@hbc/ui-kit/homepage` for homepage webpart consumption.

**Rules for this initiative:**

- `hb-homepage` must consume shared surfaces and re-exported primitives from `@hbc/ui-kit/homepage` first.
- Do not install `motion`, `lucide-react`, `cva`, `clsx`, Radix packages, or Fluent UI directly into `apps/hb-webparts` unless Phase 01 proves that `@hbc/ui-kit/homepage` genuinely does not expose the needed capability.
- If a direct dependency is genuinely required, document the justification in the closure note for the prompt that introduces it.

### Workspace dependencies

`apps/hb-webparts` already depends on `@hbc/sharepoint-platform` and `@hbc/ui-kit`. No new workspace dependency additions are anticipated for Phase 01. If one becomes necessary, check `docs/architecture/blueprint/package-relationship-map.md` before adding.

## 7. Accessibility, motion, and resilience obligations

### Reduced motion

- All shell-level transitions and animations must respect `prefers-reduced-motion: reduce`.
- This is a hard implementation burden, not a soft reminder. Prompts 04–07 must prove compliance, not merely assert it.
- `@hbc/ui-kit/homepage` already re-exports `motion` and `AnimatePresence` from `motion/react`. Use those governed re-exports.

### Focus and keyboard

- Shell composition must not break keyboard navigation flow between embedded modules.
- Interactive elements within the shell (if any) must be keyboard-accessible.
- Tab order must remain logical across the composed surface.

### Sparse, partial-config, and error states

- The shell must render safely when:
  - no modules have data yet (loading)
  - one or more modules have no content (sparse/empty)
  - configuration is partial or missing
  - a module throws a runtime error
- Each embedded module already owns its internal empty/error treatment. The shell owns the outer composition behavior: it must not show a broken layout when individual modules are in non-ideal states.

## 8. Implementation consequences for Prompts 03–09

| Prompt | Consequence of this lock |
|--------|--------------------------|
| 03 (Architecture) | Must design the shell as full-width-capable in manifest posture. Must define sparse/error shell behavior. Must specify module registration contract that preserves existing thin-consumer and split-runtime patterns. |
| 04 (Host creation) | Manifest must carry `supportsFullBleed: true`. Shell must render acceptably at any width. Motion must be reduced-motion aware from initial creation. |
| 05 (Embed Pulse/Leadership/Spotlight) | Must reuse existing `@hbc/ui-kit/homepage` surface consumption. Must not duplicate premium-stack imports. Shell owns zone spacing. |
| 06 (Embed PeopleCulturePublic) | Must preserve split model. Must pass viewer context through shell contract. Must not blur People/Kudos boundary. |
| 07 (Embed HbKudos) | Must preserve split-runtime contract. Must pass `kudosListHostUrl` through shell. Must not widen into companion scope. |
| 08 (Mount/packaging) | Must follow existing GUID registration pattern. Must not restructure packaging pipeline. Must produce additive manifest entry. Shim-proof verification must pass for all webparts. |
| 09 (Closure) | Must explicitly name communication-site validation as external constraint if not available. Must not claim full-width proof from workbench alone. |
