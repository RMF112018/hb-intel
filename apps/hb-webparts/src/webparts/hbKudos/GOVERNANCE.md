# HB Kudos — Post-Closure Governance

HB Kudos was closed at the end of Wave 4 (phase 21) as a **reference-
quality homepage surface**. This note codifies what future contributors
must preserve, what changes require re-validation, and what kinds of
shortcuts are unacceptable going forward.

If you are about to edit HB Kudos source, read this once, then keep
working.

---

## 1. What must always be preserved

### Doctrine
- No Unicode / pseudo-icons (🏆 ✦ 👍 ▾) anywhere in homepage-facing
  Kudos source. Icons flow through `./kudosIcons.ts`, which re-exports
  curated lucide components from `@hbc/ui-kit/homepage`.
- No bare `from '@hbc/ui-kit'` imports in Kudos source. Use the
  curated `@hbc/ui-kit/homepage` / `/theme` / `/icons` / `/branding`
  entries.
- `KUDOS_GOV_TOKENS.brandBlue === HBC_PRESENTATION_BLUE` and
  `brandOrange === HBC_PRESENTATION_ORANGE`. No shadow palette.
- CSS modules + `class-variance-authority` variants own repeated
  visual patterns. No giant injected `<style>{...}</style>` blocks.
  Inline `style={{…}}` is reserved for computed values that cannot
  be expressed as classes and for seeding CSS custom properties.

### Runtime decomposition
- `HbKudos.tsx` is a thin composition shell (≤ ~300 LOC). Data,
  user-id resolution, photo hydration, celebrate mutation, host-safe
  layout, and panel chrome live in `./hooks/` and `KudosComposerPanel` /
  `KudosFeedPanel` / `KudosFlyoutBody`. Do not re-absorb those into
  the shell.
- Public + companion runtimes never reach across the split. Shared
  concerns flow through `./kudosSurfaceFamily.ts` only.
- `./kudosRuntimeContract.ts` is the single source of truth for
  webpart ids and the public/companion ownership map. Do not
  duplicate the ids as inline string literals in manifests, mount,
  or tests.

### Experience cohesion
- Every flyout body (composer, feed, article reader) wraps with
  `KudosFlyoutBody` so rhythm, padding, reading width, and
  `--hbk-flyout-*` custom properties stay uniform.
- Focus-visible rings, disabled posture, and `aria-busy`/`role=status`
  wiring remain consistent across public + governance + companion
  controls.
- Host-safe sentinel size is sourced from the single
  `SAFE_ZONE_SIZE_PX` export, never re-authored. The sentinel element
  must keep the `data-hbc-testid="kudos-assistant-safezone"` contract.

### Packaging
- Manifests (`HbKudosWebPart.manifest.json`,
  `HbKudosCompanionWebPart.manifest.json`) must keep SPFx 4-part
  versions (`MM.mm.pp.bb`) and manifest `id` / `alias` matching the
  `kudosRuntimeContract` constants.
- `apps/hb-webparts/package.json` must keep `clsx` and
  `class-variance-authority` as explicit direct dependencies.

### Behavior seams
- Production logs stay gated. `useSharePointPeopleSearch` uses the
  `debug()` helper behind `window.__HB_KUDOS_DEBUG__`. Do not add
  ungated `console.warn` / `console.info` / `console.log` to the
  hot path.
- Kudos hooks are `react-hooks/exhaustive-deps` clean. When you need
  to read state inside an effect without re-triggering the effect,
  use a ref (see `useRecipientPhotoHydration`), not a suppression.

---

## 2. What kinds of changes require targeted re-validation

### Targeted re-audit (visual / architecture review)
- Adding a new Kudos surface (row type, panel, card family).
- Changing the featured / archive / reader semantic structure.
- Introducing any motion or animation beyond CSS transitions already
  present.
- Moving any Kudos primitive into `@hbc/ui-kit` (promotion is not
  currently justified — re-audit cross-feature reuse first).

### Wave-level regression check
- Any edit to `HbKudos.tsx`, `HbKudosCompanion.tsx`, or a module
  listed in the `kudosDoctrineGuards` `KUDOS_SOURCE_FILES` roster:
  run the guard test plus typecheck plus local vitest before
  committing, and state the result in the commit body.
- Any edit to `KudosGovernancePrimitives.tsx`, the governance
  state machine, or `kudosGovernanceWriter.ts`: run the governance
  writer tests + doctrine guards.

### Packaging validation
- Any bump to `HbKudosWebPart.manifest.json` or
  `HbKudosCompanionWebPart.manifest.json` — build the SPFx package
  output and sanity-check the shell-entry mapping.
- Any change to `mount.tsx` Kudos renderers — confirm that the ids
  still come from `kudosRuntimeContract` constants (guard enforces
  this).
- Any dependency change in `apps/hb-webparts/package.json` — run
  the bundle budget test.

### Harness / runtime validation
- Any change to the sentinel element, `useHostSafeLayout`, or the
  `data-hbc-testid="kudos-assistant-safezone"` contract — verify the
  dev harness assertion still passes.
- Any change to `resolveCurrentUserId`, `getSiteUrl`,
  `getKudosListHostUrl`, or `fetchRequestDigest` call sites —
  exercise the composer + celebrate + governance write paths in the
  harness.

---

## 3. What makes HB Kudos different from an ordinary webpart

HB Kudos is **not** a "best-effort" webpart. It is the reference
implementation that other homepage webparts should learn from.
Accept that the bar here is higher:

- A change that would be a merge-ready PR in another webpart may be
  rejected here if it weakens any of the preserved invariants.
- "It compiles" and "tests pass" are necessary but not sufficient.
  Changes must preserve authored presentation-lane character, shared
  family grammar, and the reference-quality posture described in
  `README.md`.
- The executable doctrine guards
  (`apps/hb-webparts/src/homepage/__tests__/kudosDoctrineGuards.test.ts`)
  are non-negotiable. They exist specifically to catch drift no
  reviewer will catch every time. If a guard is failing, you either
  fix the code or, with a dedicated plan and rationale, update the
  guard — never silently loosen it.

---

## 4. How to avoid reintroducing the original audit failures

The Wave 1/2/3 audits found concrete defects. The guards below keep
each one from coming back. If you are about to do something that
*feels* like one of these, pause.

| Original defect | Never do this | Do this instead |
|---|---|---|
| Unicode glyph used as an icon | `<span>🏆</span>` / `<span>▾</span>` | Import from `./kudosIcons.ts`. |
| Raw hex / rgba in surface JSX | `style={{ color: '#225391' }}` | Use `KUDOS_GOV_TOKENS` / `KUDOS_INTENT`, or seed a CSS custom property and resolve it in a CSS module. |
| Giant injected `<style>{...}</style>` | Author CSS inside the component | Add classes to the relevant `*.module.css`. |
| Inline style object repeated 3+ times | Copy the object to new call sites | Add a `cva` variant in `kudosVariants.ts`. |
| Orchestration in `HbKudos.tsx` | Add "just one more" effect | Extract to a named hook under `./hooks/`. |
| Production log in the people-search | `console.warn(TAG, …)` | Route through the `debug()` helper. |
| `// eslint-disable-next-line react-hooks/exhaustive-deps` | Suppress the warning | Read the dependency through a `ref` inside the effect. |
| Inline webpart GUID in `mount.tsx` | Paste the id as a string key | Import from `kudosRuntimeContract`. |
| Two different 72px literals (padding + sentinel) | Repeat the literal | Use `SAFE_ZONE_SIZE_PX`. |
| Ad-hoc `:focus-visible` on a new control | Hand-author a new outline rule | Route the control through a governance / surface-family variant whose CSS module already owns focus styling. |

---

## 5. Pull-request checklist for HB Kudos changes

Before you ask for review, confirm:

- [ ] `pnpm -F @hbc/spfx-hb-webparts check-types` clean.
- [ ] `pnpm -F @hbc/spfx-hb-webparts test -- --run src/homepage/__tests__/kudosDoctrineGuards.test.ts` — **all 16** guards pass.
- [ ] Full vitest run — failure count does not exceed the baseline
      recorded at the start of your work; no new Kudos-owned failures.
- [ ] If you touched a manifest: version bumped following the SPFx
      4-part schema; id + alias unchanged.
- [ ] If you touched `mount.tsx`: still uses
      `HB_KUDOS_WEBPART_ID` / `HB_KUDOS_COMPANION_WEBPART_ID`.
- [ ] If you touched a Kudos surface TSX: no new raw hex / rgba, no
      new `<style>` block, no new Unicode icon.
- [ ] If you touched a Kudos hook: no new `exhaustive-deps`
      suppression; any effect that reads state uses a ref.
- [ ] Commit body states what was verified, not just what changed.

---

## 6. What is NOT governed by this note

- Business-logic decisions about the recognition workflow itself
  (moderation rules, role model, audit-event schema) — governed by
  the Decision Lock Appendix.
- Visual refinements that respect every invariant above. This note
  does not forbid evolution; it forbids erosion.
- Wave-5+ slices that were explicitly handed off (companion queue-
  row decomposition, `kudosGovernanceWriter.ts` split, shared
  reduced-motion module). Those are future work, not drift.

---

## 7. Handoff standard

HB Kudos is **done** when:
- every acceptance gate in `phase-22/Prompt-02`'s final matrix is
  ✅ (currently all 26 are), **and**
- `kudosDoctrineGuards.test.ts` is green, **and**
- the repo has this governance note beside the webpart so future
  contributors cannot miss it.

HB Kudos stops being done the moment any of those three conditions
stops holding. Restoring them is the next contributor's first job.
