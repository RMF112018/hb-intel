# Prompt-05 — Install Flow Integration and Binding Publication

## Objective

Integrate the app-binding slice into the existing Phase 6 setup/install lane so the Admin control plane publishes the correct binding state as part of backend setup/bootstrap rather than leaving it as a disconnected follow-up.

## Important execution rules

- Reuse the existing install/bootstrap orchestration and setup UX wherever safe.
- **Do not re-read files that are still within active context or memory unless they changed, the context is stale, or the scope widened.**
- Keep the work narrow: this is about binding publication within the existing install flow, not redesigning the whole Phase 6 lane.

## Inputs

Use:
- the Phase 6 setup/install docs and implementation
- the app-binding architecture docs
- the binding store/API from Prompt-04
- existing install orchestrator and setup wizard logic

## Required work

### A. Extend install/bootstrap outputs
Update the install/bootstrap orchestration so it can produce or assemble the binding payload for each target app it provisions/supports.

At minimum handle:
- Accounting
- Project Setup

### B. Publish binding during or immediately after install
Implement the correct step or post-step publication flow so the active binding is written durably as part of setup/bootstrap completion.

### C. Make publication auditable
Ensure publication/republication writes:
- audit event(s)
- actor context
- timestamp
- linkage back to the originating install/setup run
- evidence references if appropriate

### D. Update setup/install docs
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-install-binding-publication.md`

Explain:
- where binding publication fits in the setup/install flow,
- what data it derives from,
- what happens on partial failure,
- how it interacts with checkpoints or verification.

## Required boundaries

- Do not rely on hidden manual steps to complete binding publication.
- Do not publish bindings only in the browser.
- Do not create a second parallel install workflow just for bindings.

## Validation

Add focused tests for:
- install flow publishes binding when expected
- publication failure behavior is explicit and durable
- rerun/reapply behavior is deterministic
- audit linkage to run ID is preserved

Run the smallest meaningful validation set and document it.

## Completion condition

Stop after binding publication is integrated into the setup/install flow, documented, and validated.
Do not integrate target-app runtime resolution in this prompt.
