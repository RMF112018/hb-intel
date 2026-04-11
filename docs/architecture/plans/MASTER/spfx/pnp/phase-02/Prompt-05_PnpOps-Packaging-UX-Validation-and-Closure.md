# Prompt 05 — PnP Ops Packaging, UX Validation, and Closure

## Objective

Complete the refactor by validating the end-to-end non-Azure PnP Ops path, tightening the operator UX, and proving that the PnP Ops webpart still packages correctly inside `hb-webparts.sppkg`.

---

## Critical instruction

**Do not re-read files that are already in your active context or memory.**

Use the prior prompt outputs and only inspect additional files when needed to close real gaps.

---

## Required goals

1. Prove the PnP Ops webpart still packages into `hb-webparts.sppkg`.
2. Remove stale Azure-centric operator messaging from the PnP Ops path.
3. Validate local-runner and remote-runner modes.
4. Keep mock mode useful for UI/dev validation.
5. Produce a final completion/closure report.

---

## Required tasks

### 1. UX cleanup
Update the PnP Ops surface so the messaging is clean and accurate.

The user should be able to tell:

- whether the app is in local mode,
- remote mode,
- mock mode,
- or deprecated legacy mode if still temporarily present.

Failure states must be mode-specific, for example:

- local runner not installed
- local runner certificate not trusted
- remote runner unreachable
- remote runner auth failed
- PowerShell/PnP prerequisites missing
- target validation failed

Do not retain stale Azure-backend guidance as the primary operator message for live extraction.

### 2. Final validation pass
Validate at least:

- action catalog load
- preflight
- launch
- run status refresh
- artifact manifest
- artifact download
- local-runner mode
- remote-runner mode
- mock mode

If any mode is only partially validated, say so explicitly.

### 3. Packaging proof
Audit and prove that the packaged PnP Ops app remains included in `hb-webparts.sppkg`.

At minimum:

- verify `apps/hb-webparts/src/webparts/pnp/PnpOpsWebPart.manifest.json`
- verify mount registration
- verify release manifest / shell mapping
- verify build script behavior
- run the relevant package build
- inspect the resulting `.sppkg` artifact
- confirm the PnP Ops manifest and asset entries are present

Do not merely assume packaging because the source manifest exists.

### 4. Package metadata cleanup
If the `hb-webparts` solution metadata or descriptions are now stale relative to the packaged contents, tighten them appropriately without causing collateral churn.

### 5. Docs cleanup
Ensure docs exist for:
- local runner setup
- remote runner setup
- mode selection
- packaging proof / validation summary

---

## Deliverables

1. Final code cleanup for operator-facing UX.
2. Packaged build proof for `hb-webparts.sppkg`.
3. Final closure report written to an appropriate docs path.
4. Completion report in chat with:
   - changed files,
   - exact validation performed,
   - what is fully proven,
   - what remains partially proven,
   - recommended next actions.

---

## Acceptance criteria

- Live PnP Ops no longer requires Azure backend services.
- Local runner is the preferred path and is reflected in UX.
- Remote runner is a usable fallback.
- Mock mode still works for dev/UI testing.
- `hb-webparts.sppkg` still contains the packaged PnP Ops webpart.
- Final reporting is explicit and honest.
