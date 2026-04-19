# Parity-First Replacement Package — Priority Actions Rail + HB Homepage

## Purpose

This package replaces the prior broad enhancement package with a **parity-first enforcement package**.

The hosted screenshot remains materially generic after execution of the prior package. That means the next pass must **stop assuming the live tenant is rendering the intended flagship path** and must instead prove, with evidence, **why the hosted output does not match the stronger Priority Actions Rail path already represented in the repo**.

This package is intentionally narrow.

It targets the **Priority Actions Rail and its HB Homepage wrapper/integration seam**. It does **not** reopen a broad homepage redesign effort. It does **not** permit closure based on repo commentary, prior docs, or “already implemented” reasoning when the hosted screenshot disproves those claims.

---

## Inputs the agent must use

1. The attached hosted screenshot showing the current SharePoint-rendered condition.
2. The attached `hb-intel-homepage.sppkg`.
3. The live repo on the local machine / `main` branch truth.
4. Governing doctrine and benchmark authority:
   - `docs/reference/ui-kit/doctrine/**`
   - `docs/reference/spfx-surfaces/benchmark/**`

---

## Why this package exists

The prior package failed in a specific way:

- the repo already contains explicit homepage wrapper ownership for the rail
- the repo already contains an explicit `homepage-flagship` rail context
- the repo already contains container-aware rail presentation logic
- the repo already contains flagship-specific shared surface styling

Yet the hosted screenshot still looks like a generic sparse card row.

That means one or more of the following is true:

- the tenant is not rendering the package/build the repo appears to describe
- the homepage is not mounting the intended render path
- the intended flagship context or CSS is not actually taking effect
- the live logic still collapses into a generic sparse tile outcome
- stale completion logic allowed “already done” to stand without hosted proof

This package is built to force that answer.

---

## Package contents

- `Plan-Summary.md`
- `00-Parity-First-Audit-Summary.md`
- `01-Hosted-Parity-Failure-Tree.md`
- `02-Execution-and-Closure-Checklist.md`
- `Prompt-01-Prove-Hosted-Runtime-Parity-and-Isolate-the-Mismatch.md`
- `Prompt-02-Force-a-Material-Hosted-Visual-Delta-for-the-Priority-Actions-Rail.md`

---

## Required execution order

1. Run `Prompt-01` first.
2. Do **not** move to `Prompt-02` until `Prompt-01` has identified the actual mismatch or proven that the repo path itself still produces the generic hosted outcome.
3. Run `Prompt-02`.
4. Close only with **hosted proof**, not repo-only reasoning.

---

## Non-negotiable closure rules

- No “already implemented” closure.
- No “0 file changes” closure.
- No closure based only on a local render.
- No closure without proving what the attached `.sppkg` contains and how that relates to the repo.
- No closure if the resulting hosted screenshot is still materially similar to the current screenshot.
- No unrelated homepage drift outside the rail and its immediate wrapper/integration seams.

---

## Required final outputs from the agent

At minimum, the agent must return:

1. the actual root-cause determination
2. the exact files changed
3. the exact build / package commands run
4. the final `.sppkg` output details
5. a before/after explanation tied to hosted rendering
6. screenshot proof that the hosted rail is materially different
7. a concise statement of why this pass succeeded where the previous package failed
