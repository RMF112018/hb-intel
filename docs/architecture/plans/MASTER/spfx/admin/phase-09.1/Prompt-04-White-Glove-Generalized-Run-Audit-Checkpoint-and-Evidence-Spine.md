# Prompt-04 — White-Glove Generalized Run, Audit, Checkpoint, and Evidence Spine

## Objective

Extend the current backend run patterns into a generalized white-glove package-run spine with durable audit, checkpoint, and evidence support.

## Important execution rules

- Do **not** re-read files that are already in your current context or memory unless necessary.
- Treat current repo truth as authoritative before making changes.
- Preserve the **Admin SPFx operator console / privileged backend** boundary.
- Do **not** push privileged execution into SPFx.
- Do **not** flatten Windows, macOS, iPhone, and iPad into one generic device workflow.
- Do **not** force Microsoft, Apple, and NinjaOne into one generic adapter.
- Use platform-native ownership honestly.
- Update existing authoritative docs instead of creating duplicate guidance unless this prompt explicitly requires a new authoritative doc.
- Keep acceptance criteria visible and verifiable.

## Inputs

Use the following as primary inputs:

- Prompt-01 through Prompt-03 outputs
- current provisioning run / status / SignalR / retry patterns
- current run / audit / evidence baseline docs under admin phase docs
- current `@hbc/provisioning` contracts and model references

## Required repo / code / docs targets

Update these targets where appropriate:

- `backend/functions/src/services/`
- `backend/functions/src/functions/`
- `packages/provisioning/` only where reuse/generalization is appropriate
- shared models / contracts locations
- `docs/reference/white-glove/`
- `docs/architecture/plans/MASTER/spfx/admin/white-glove/`

## Work to perform

1. Design and implement parent package run and child device run persistence.
2. Add durable models for:
   - package run
   - device run
   - checkpoint event
   - operator action event
   - connector snapshot reference
   - evidence manifest
3. Implement normalized result envelopes for SPFx consumption.
4. Define retry, compensation, and repair semantics for:
   - connector failures
   - enrollment assignment failures
   - package-template validation failures
   - post-enrollment standardization failures
5. Reuse existing SignalR / polling patterns where appropriate.
6. Preserve compatibility with existing provisioning run infrastructure instead of breaking it.
7. Ensure operator actions are attributable and reviewable.

## Acceptance criteria

- Parent and child run contracts exist.
- Checkpoint, audit, and evidence types are durable and concrete.
- Retry / compensation / repair semantics are explicit.
- Existing provisioning behavior is not broken.
- SPFx has a normalized backend result surface to consume.

## Documentation updates required

- Update run / audit / evidence reference docs.
- Document compatibility boundaries with existing provisioning infrastructure.
- Document authoritative store vs compatibility projection if multiple stores are involved.

## Completion condition

Stop after the run / audit / checkpoint / evidence spine is implemented or cleanly scaffolded with stable contracts and store boundaries.
