# Wave 2 Decision Closure Register — Executed-State Ledger

**Canonical source:** `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/01_Wave_2_Decision_Closure_Register.md`.

This document is the executed-state ledger for the Wave 2 closed decisions. The plan-folder register remains canonical for decision content and revisions; this blueprint copy annotates each decision with its current state, the audit evidence that releases or constrains it, and any cross-link relevant to Wave 2 implementation prompts.

States used:

- **Closed** — decision is settled; no further negotiation in Wave 2.
- **Proof-Gated** — decision becomes actionable only when the named proof is verified by the audit.
- **Deferred** — explicitly out of Wave 2; revisited in Wave 3 or later.

---

## W2-ODR-001 — Target App Location

> Create/use `apps/project-control-center/` as the dedicated PCC shell app target. Use `packages/spfx` only for shared SPFx host/root exports if repo pattern requires it. Do not place PCC shell code in `apps/hb-webparts/` or extend `apps/project-sites/`.

**State:** Closed.
**Audit evidence:** `apps/project-control-center/` scaffold is present after Prompt 02, and the locked shell target remains `apps/project-control-center/` with no conflicting PCC shell location introduced.
**Cross-link:** `Wave_2_Scope_Lock.md` §1.

## W2-ODR-002 — App Scaffold Authorization

> Wave 2 may create the new app scaffold after Prompt 01 verifies clean repo state and Wave 1 closeout. (Proof-Gated)

**State:** Proof-Gated → Released and executed by Prompt 02.
**Audit evidence:** Wave 1 closeout and Prompt 01 repo-truth gate released the scaffold authorization, and Prompt 02 executed the scaffold creation. `apps/project-control-center/` is present.
**Cross-link:** `Wave_2_Scope_Lock.md` §1, §4.

## W2-ODR-003 — No Initial Manifest/Solution/Package Version Bump

> No manifest, solution, or package version bump in initial Wave 2 scaffold unless a specific implementation prompt authorizes it.

**State:** Closed.
**Audit evidence:** Prompt 01 introduces no version, manifest, or solution change. Future scaffold prompt is bound by this constraint unless it explicitly negotiates an exception.
**Cross-link:** `Wave_2_Scope_Lock.md` §3.

## W2-ODR-004 — Vite/Local Preview & Dev-Harness Wiring

> Allow Vite/local preview wiring. Defer dev-harness tab wiring unless the implementation agent proves an existing repo-supported pattern and no production/manifest impact. (Proof-Gated)

**State:** Split.

- **Vite/local-preview portion: Proof-Gated → Released for later implementation.** Repo-wide SPFx Vite precedent (e.g. `apps/accounting/`) satisfies the proof requirement. Documented in `Wave_2_Repo_Truth_Audit.md` §6.
- **Dev-harness tab-wiring portion: Deferred.** Remains deferred until an implementation agent demonstrates a non-disruptive existing pattern with no production/manifest impact.

**Cross-link:** `Wave_2_Scope_Lock.md` §2, §3.

## W2-ODR-005 — App-Local Adapters

> Use app-local preview/read-model adapters under `apps/project-control-center/src/`. Do not create a shared adapter package in Wave 2.

**State:** Closed.
**Cross-link:** `Wave_2_Scope_Lock.md` §2.

## W2-ODR-006 — Internal State/Tab Navigation

> Use internal state/tab navigation backed by `PCC_MVP_SURFACE_IDS`. Do not add a router library unless Prompt 01 proves an existing convention requires it.

**State:** Closed.
**Audit evidence:** Prompt 01 found no convention requiring a router library; internal state/tab navigation governs Wave 2.
**Cross-link:** `Wave_2_Wireframe_and_Layout_Contract.md` §6.

## W2-ODR-007 — Wave 1 Fixtures Only

> Use Wave 1 deterministic fixtures as the default project context. Allow optional injected runtime context only as non-live display input. No backend API, Graph, PnP, Procore, or tenant call.

**State:** Closed.
**Audit evidence:** `PCC_FIXTURES` aggregate confirmed in `@hbc/models/pcc` (`Wave_2_Repo_Truth_Audit.md` §2).
**Cross-link:** `Wave_2_Scope_Lock.md` §5.

## W2-ODR-008 — Persona/Capability Metadata is Display Only

> Treat persona/capability metadata as display hints only. It must not become authoritative authorization.

**State:** Closed.
**Cross-link:** `Wave_2_Wireframe_and_Layout_Contract.md` §5; `Wave_2_Scope_Lock.md` §5.

## W2-ODR-009 — Required State Catalog

> Require preview, empty, loading, error, missing-config, unavailable-fixture, and unauthorized-persona states.

**State:** Closed.
**Cross-link:** `Wave_2_UIUX_Basis_of_Design.md` §5; `Wave_2_Wireframe_and_Layout_Contract.md` §4.

## W2-ODR-010 — Guard Tests Are App-Local

> Place no-runtime/no-forbidden-import guard tests in the touched PCC app package. Promote only later if repeated across packages.

**State:** Closed.
**Cross-link:** `Wave_2_Scope_Lock.md` §2, §4.

## W2-ODR-011 — Wave 1 Closeout Precondition

> Implementation is blocked until Prompt 01 verifies Wave 1 closeout on `main`. (Proof-Gated)

**State:** Proof-Gated → Released.
**Audit evidence:** Wave 1 closeout verified on `main` (`Wave_2_Repo_Truth_Audit.md` §1).

## W2-ODR-012 — Deferred to Wave 3+

> Live reads, persisted project data, authoritative authorization, live Site Health, workflow counts, access execution, approval execution, repair execution, and tenant seams wait for Wave 3 or later. (Deferred)

**State:** Deferred. No relaxation in Wave 2.
**Cross-link:** `Wave_2_Scope_Lock.md` §3.

## W2-ODR-013 — Document Control Two-Lane Architecture (Preview-Only in Wave 2)

> Document Control follows a two-lane architecture: (1) Microsoft Files Lane for SharePoint Drive / SharePoint document libraries and OneDrive as a future Microsoft Graph-backed file-management surface rendered as disabled/preview-only affordances in Wave 2; and (2) External Document Systems Lane for Procore Files, Document Crunch, Adobe Sign, and future external systems rendered as launch/deep-link/missing-config/access-issue states. No standalone submittal workflow replacement, no transmittal/revision-routing replacement, no document review/routing workflow execution in Wave 2, no approval execution in Wave 2, and no live Graph/PnP/API/file operations in Wave 2.

**State:** Closed.
**Cross-link:** `Wave_2_Wireframe_and_Layout_Contract.md` §3.

## W2-ODR-014 — External Systems Are Launch + Missing-Config Only

> Launch links and missing-configuration states only. No sync, mirror, write-back, API client, secrets, or direct SPFx-to-external-system path.

**State:** Closed.
**Cross-link:** `Wave_2_Wireframe_and_Layout_Contract.md` §3; `Wave_2_Scope_Lock.md` §3.

## W2-ODR-015 — Site Health Read-Model Frame Only

> Read-model summary/indicator frame only, using fixtures. Include repair-request entry placeholder only. No scanner, runner, repair executor, Graph/PnP, or backend persistence.

**State:** Closed.
**Cross-link:** `Wave_2_Wireframe_and_Layout_Contract.md` §3.

## W2-ODR-016 — Team & Access Placeholder Only

> Project team summary placeholder and access-request entry placeholder only. No permission mutation, no group mutation, no approval execution.

**State:** Closed.
**Cross-link:** `Wave_2_Wireframe_and_Layout_Contract.md` §3.

## W2-ODR-017 — Wave 2 Includes Real Shell-Frame UI/UX

> Wave 2 includes real shell-frame UI/UX work: layout, visual hierarchy, navigation, responsive behavior, state handling, preview cards, and accessibility. It does not include live module operations.

**State:** Closed.
**Cross-link:** `Wave_2_UIUX_Basis_of_Design.md` §3, §5; `Wave_2_Wireframe_and_Layout_Contract.md` §1, §2.

## W2-ODR-018 — No Homepage Paired-Row Layout

> PCC must not reuse the `hb-intel-homepage` fixed paired-row layout. PCC shall use a controlled flexible bento/masonry-style layout with unique card heights and spans.

**State:** Closed.
**Cross-link:** `Wave_2_UIUX_Basis_of_Design.md` §4; `Wave_2_Wireframe_and_Layout_Contract.md` §1, §2.

## W2-ODR-019 — Saved Design Reference Asset Governs

> The saved design reference at `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png` is the governing visual-direction asset for Wave 2 UI/UX.

**State:** Closed.
**Audit evidence:** Asset present and readable (`Wave_2_Repo_Truth_Audit.md` §3).
**Cross-link:** `Wave_2_UIUX_Basis_of_Design.md` §2.

---

## Net Wave 2 Posture (Post-Prompt-02 + Document Control Correction)

- Prompt 01 repo-truth/scope-lock gates were completed and released applicable proof-gated decisions.
- Prompt 02 executed the app scaffold authorization for `apps/project-control-center/`; scaffold is present and target remains locked.
- W2-ODR-013 now reflects the corrected two-lane Document Control architecture and supersedes prior access-hub-only language.
- W2-ODR-004 remains split: Vite/local-preview released; dev-harness tab wiring remains deferred.
- W2-ODR-012 remains deferred; all other Wave 2 decisions are closed and binding.
