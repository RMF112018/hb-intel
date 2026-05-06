# 07 — Implementation Order and Risk Register

## Recommended Implementation Order

### Step 1 — Scope Lock and Repo-Truth Audit

- Re-read only the files needed for shell, hero, tabs, command affordance, active surface metadata, profile identity, tests, and README.
- Confirm current branch/worktree status.
- Confirm no current local changes should be overwritten.
- Confirm current source still matches assumptions from this package.

### Step 2 — Project Identity Source Alignment

- Replace shell usage of `PCC_PROJECT_PLACEHOLDER` with a profile-derived shell view model.
- Use `SAMPLE_PROJECT_PROFILE` as default preview profile.
- Preserve future compatibility with read-model profile when explicitly available.
- Remove visible `Reference Client`, `Reference Location`, and `$0` from shell default.

### Step 3 — Hero Restructure

- Recompose hero into identity, facts, and disabled command zones.
- Render only locked mandatory facts.
- Remove excluded facts.
- Add strong visual hierarchy and separation from tab rail.
- Preserve host-safe sizing and no `100vh` shell dependency.

### Step 4 — Disabled Command Affordance

- Replace input-style search with disabled preview command affordance.
- Add accessible helper copy.
- Remove typing/search illusion.

### Step 5 — Tab Rail Remediation

- Remove icons.
- Rename tab label to `External Platforms`.
- Use stronger selected state.
- Add animated active indicator.
- Preserve keyboard behavior.
- Improve focus-visible state.

### Step 6 — Accessibility and Panel Relationship

- Wire stable tab `aria-controls` and active panel semantics without breaking bento direct-child invariants.
- Add tests.

### Step 7 — Responsive Fit

- Verify 8-mode behavior.
- Tune wrapping/collapse rules.
- Avoid first-screen bloat.

### Step 8 — Docs and Evidence

- Update README.
- Create evidence index.
- Capture before/after and breakpoint evidence.
- Write closeout with residual risks.

## Risk Register

| Risk | Severity | Mitigation |
|---|---:|---|
| Adding a tabpanel wrapper breaks bento direct-child layout | High | Apply panel semantics to an existing safe container or design a non-grid-breaking wrapper. Add tests. |
| Hero becomes too tall and pushes content below fold | High | Use compact density rules and responsive fact collapse. Capture short-height evidence. |
| Disabled search still looks like an input | High | Remove input styling and render a disabled preview chip/button with clear copy. |
| Tab rail animation becomes brittle due to DOM measurements | Medium | Prefer per-tab CSS indicator before shared measured indicator. |
| External Platforms label conflicts with model id `external-systems` | Medium | Keep internal ids for now; remap only user-facing labels. Add tests. |
| Removing icons reduces scan speed | Low/Medium | Strengthen text, spacing, and active indicator. Revisit iconography in a future dedicated pass. |
| Brand colors are used inconsistently | Medium | Use existing UI-kit tokens only; document any exception. |
| Docs overclaim flagship readiness | High | State that this is shell remediation; no final 56/56 unless evidence proves it. |
| Project profile source becomes confused with live tenant source | Medium | Label as preview/reference in docs, not necessarily hero. Preserve read-only posture. |

## Validation Commands

Run the narrowest relevant validation first, then expand only if failures require it.

Recommended:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center test -- PccProjectHeroBand PccHorizontalTabs PccShell
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm exec prettier --check apps/project-control-center/src apps/project-control-center/README.md docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A
md5 pnpm-lock.yaml
```

If test filters do not work in the current runner, run the app package test suite:

```bash
pnpm --filter @hbc/spfx-project-control-center test
```

Do not update lockfile.
