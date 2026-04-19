# Prompt 01 — Prove Hosted Runtime Parity and Isolate the Mismatch

You are working in the local checked-out live repo.

## Objective

Determine **why the hosted SharePoint screenshot still shows a generic sparse Priority Actions Rail** even though the repo appears to already contain a stronger wrapper-owned flagship rail path.

This is a **parity-first diagnostic prompt**.

Do not redesign the rail in this prompt.
Do not broaden into a homepage audit.
Do not close with “already implemented.”

Your job is to prove, with evidence, which of the following is actually true:

1. the attached `hb-intel-homepage.sppkg` is stale / wrong / incomplete relative to the repo
2. the homepage is not mounting the intended wrapper-owned flagship rail path
3. the flagship context/styling is not reaching the hosted runtime
4. the live rail logic still produces the weak generic outcome even when the intended path is used
5. prior closure reasoning was invalid because hosted evidence contradicted repo commentary

---

## Why this prompt exists

The prior package failed because it allowed repo-level implementation claims to stand without first proving hosted parity.

That failure cannot repeat.

The hosted screenshot is authoritative evidence that the current user-visible result is still not acceptable.
If repo code suggests a stronger implementation but the screenshot still looks generic, you must resolve that contradiction explicitly.

---

## Required inputs

Use all of the following:

1. the attached hosted screenshot
2. the attached `hb-intel-homepage.sppkg`
3. the local repo / `main` truth
4. doctrine and benchmark authority:
   - `docs/reference/ui-kit/doctrine/**`
   - `docs/reference/spfx-surfaces/benchmark/**`

---

## In-scope seams to inspect

### Homepage wrapper / integration
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`

### Public rail
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts`

### Shared surface family
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailAction.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailOverflow.tsx`
- `packages/ui-kit/src/HbcPriorityRail/types.ts`
- `packages/ui-kit/src/HbcPriorityRail/variants.ts`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`

### Packaging / deploy truth
- `apps/hb-webparts/config/package-solution.json`
- the relevant webpart manifests and build/package outputs
- the attached `hb-intel-homepage.sppkg`

---

## Required tasks

### 1. Inspect the attached `.sppkg`
You must determine:

- what version/build/package truth it represents
- whether it contains the implementation path the repo currently claims
- whether the package contents support the homepage wrapper-owned flagship rail outcome
- whether anything about the package strongly suggests stale or missing assets

### 2. Inspect the active repo path
Determine:

- whether `HbHomepageEntryStack` is the real homepage integration path
- whether the embedded rail is explicitly wrapper-owned
- whether the embedded rail is explicitly opted into `homepage-flagship`
- whether the shared flagship rail surface/CSS is actually the path the repo expects

### 3. Compare hosted evidence against repo/package truth
You must answer, concretely:

- is this a **package/deploy parity** problem?
- a **mount/render path** problem?
- a **CSS/class activation** problem?
- a **logic/presentation** problem?
- or a combination?

### 4. Identify the first real blocker
Return a precise statement of the **first blocker that must be solved** before any redesign or polish work can be trusted.

### 5. Refuse false closure
If the repo truly already contains the intended path and the package appears current, but the logic still yields the generic screenshot outcome, state that plainly.

Do **not** protect the existing implementation.
Do **not** treat code presence as success.

---

## Non-negotiable rules

- Do not re-read files already in active context unless needed to confirm drift, dependencies, build/package truth, or uncertainty after changes.
- Do not redesign the rail in this prompt.
- Do not make unrelated homepage changes.
- Do not close with “already implemented.”
- Do not claim success because the repo contains a stronger path in theory.
- Do not stop at commentary; prove the mismatch.

---

## Required output

Return all of the following:

1. **Root-cause determination**
   - one primary cause
   - any secondary contributing causes

2. **Evidence map**
   - exact files / seams inspected
   - `.sppkg` findings
   - any version / manifest / bundle facts that matter

3. **Contradiction resolution**
   - explain why the hosted screenshot and repo truth diverged

4. **Action handoff**
   - the narrowest next implementation target
   - which files must change next
   - which files must not change next

5. **Closure statement for this prompt**
   - a plain statement that explains why Prompt 02 can now proceed
