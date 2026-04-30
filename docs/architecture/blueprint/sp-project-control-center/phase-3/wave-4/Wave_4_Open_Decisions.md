# Phase 3 / Wave 4 — Open Decisions

**Classification:** Canonical Normative Plan (decision register, active wave).
**Audited HEAD:** `876a08742`.
**Audited date:** 2026-04-30.
**Companion:** `Wave_4_Scope_Lock.md`.

This register freezes Wave 4 default positions before source implementation begins. Frozen entries are binding for Prompts 02–07; only an explicit user authorization can re-open them.

Status legend:

- **Frozen** — binding default; source-implementation prompts must implement to this position.
- **Open** — actively undecided; a Wave 4 prompt is expected to close the entry.
- **Deferred** — intentionally held until a later wave or ADR.

---

## W4-OD-001 — SPFx read-model mode / config name and default

**Status:** Frozen.
**Default:** Introduce a typed data-mode field, e.g. `readModelMode: 'fixture' | 'backend'`. The default value is `'fixture'`. Backend mode is selected only by explicit caller opt-in via the SPFx `mount`/config seam.
**Rationale:** Wave 3 closed with a dormant client and a fixture-driven runtime. Wave 4's objective is opt-in introduction of backend reads without changing the default. The two-value enum keeps the future `mock`/`local` mode (already supported by the envelope) out of SPFx scope.
**Owning prompt:** Prompt 02.
**Carries forward:** Wave 3 W3-OD-012 (SPFx default to backend? — answered: no, fixture remains default in Wave 4).

## W4-OD-002 — Backend base URL / config source

**Status:** Frozen.
**Default:** Backend base URL is injected through the SPFx `mount(_spfxContext, _config)` seam (currently a forward-compat parameter) and/or a configuration object passed at IIFE-mount time. Wave 4 does **not** auto-discover the base URL from tenant state, environment probes, or runtime resolution.
**Rationale:** Auto-discovery would couple the SPFx surface to tenant state earlier than the wave admits, and would be incompatible with the no-tenant-runtime-confirmation guardrail.
**Owning prompt:** Prompt 02 defines the contract; Prompt 03 consumes it.

## W4-OD-003 — Backend HTTP client placement

**Status:** Frozen.
**Default:** The backend HTTP `IPccReadModelClient` implementation lives under `apps/project-control-center/src/api/` alongside the existing dormant boundary. It implements the same `IPccReadModelClient` interface as the fixture client.
**Rationale:** Preserves the seam Wave 3 established. Avoids splitting client boundaries across packages or apps.
**Owning prompt:** Prompt 03.

## W4-OD-004 — `fetch(` source-scan exception scope

**Status:** Frozen.
**Default:** `fetch(` is permitted **only** in the backend HTTP client implementation file and its colocated tests/mocks. All other source files in `apps/project-control-center/src/**` remain `fetch(`-free. The Wave 4 source-scan guard is updated to encode this exception explicitly and minimally.
**Rationale:** Constrains live network capability to a single auditable file and prevents incidental fetch reintroduction across surfaces.
**Owning prompts:** Prompt 03 (introduces the exception); Prompt 06 (encodes the guard).

## W4-OD-005 — Project Home as the only initial wired consumer

**Status:** Frozen.
**Default:** Wave 4 wires the backend client behind the seam exclusively for **Project Home / Command Center**. Team & Access, Documents, Site Health, External Systems, Project Readiness, Approvals, and Control Center Settings remain on their Wave 2/Wave 3 fixture data sources.
**Rationale:** Limits blast radius of the first opt-in. Lets Wave 4 prove the controlled-consumption guard pattern on a single surface before generalizing.
**Owning prompts:** Prompts 04–05.

## W4-OD-006 — API dormancy guard replacement with controlled-consumption guard

**Status:** Frozen.
**Default:** The Wave 3 dormancy guard (`pcc-api-dormancy.test.ts`) is **replaced**, not deleted, with a controlled-consumption guard. The new guard:

- permits `src/api/` imports only inside the Project Home adapter / view-model layer authored in Prompt 04;
- denies imports from any other surface, shell file, or non-Project-Home code path;
- preserves the original dormancy intent for all surfaces that are not yet opt-in.

**Rationale:** Once Project Home consumes the seam, the strict dormancy assertion is no longer literally true. The replacement guard preserves the architectural invariant (no silent runtime cutover) while admitting the single authorized consumer.
**Owning prompt:** Prompt 06.

## W4-OD-007 — Fallback behavior on missing config and backend-unavailable responses

**Status:** Frozen.
**Default:** When the backend HTTP client is selected but configuration is missing, network access fails, or the backend returns a `backend-unavailable` envelope, the surface falls back to a fixture envelope with `sourceStatus: 'backend-unavailable'`. The user-facing UI surfaces this state explicitly (the existing fixture-unavailable visual treatment is the floor). **Silent failure is forbidden.**
**Rationale:** Aligns with Wave 3's seven-value `sourceStatus` design and the established fixture-unavailable visual treatment. Prevents a partial-success-without-evidence failure mode.
**Owning prompts:** Prompt 04 (state mapping); Prompt 05 (wiring); Prompt 06 (test coverage).

## W4-OD-008 — Package / lockfile / version posture

**Status:** Frozen.
**Default:** Wave 4 does not add dependencies, change package versions, change SPFx manifests, or alter the deploy artifact. `pnpm-lock.yaml` checksum must be unchanged at every prompt's closeout. Any deviation is a hard stop and requires explicit user re-authorization.
**Rationale:** Wave 4 is a runtime-shape change, not a packaging change. Lockfile churn would invalidate the SPFx bundle parity guarantee Wave 3 established.
**Owning prompt:** all (each prompt asserts at closeout).
**Carries forward:** Wave 3 W3-OD-014 (lockfile/package churn discipline).

## W4-OD-009 — Scoped-host ADR / architecture record disposition

**Status:** Open.
**Default position (pending):** Either author an ADR for the scoped-host pattern (`backend/functions/src/hosts/pcc-read-model/`) or schedule it as part of Wave 4 closeout.
**Rationale:** Wave 3 surfaced the scoped-host pattern but deferred ADR placement (Wave 3 W3-OD-018). Wave 4 either closes this with a written ADR or formally re-defers with a target wave/date.
**Owning prompt:** Prompt 07 (closeout decision).

## W4-OD-010 — Wave 5 readiness dependency

**Status:** Frozen.
**Default:** The Priority Actions Rail standalone module (Wave 5) is unblocked for kickoff once Wave 4 Prompts 05 and 06 close successfully. Wave 4 does not author Priority Actions Rail content; it only displays priority actions as part of Project Home's read model where the read model already provides them.
**Rationale:** Decouples Priority Actions Rail authoring from Project Home backend consumption. Wave 5 inherits a stable opt-in seam and a controlled-consumption guard.
**Owning prompt:** Prompt 07 (records readiness in closeout).

---

## Cross-reference to Wave 3 open decisions

| Wave 3 ID | Carry-forward |
| --- | --- |
| W3-OD-012 (SPFx defaults to backend?) | Closed by W4-OD-001 (no — fixture remains default in Wave 4). |
| W3-OD-014 (package/lockfile churn) | Carries into W4-OD-008. |
| W3-OD-017 (SPFx source modification scope) | Narrowed by W4-OD-005 / W4-OD-006 (Project Home only; controlled-consumption guard). |
| W3-OD-018 (ADR for scoped-host pattern) | Carried as W4-OD-009 (Open). |
