# Prompt-06 — Resolution Engine and Run-to-Config Traceability

## Objective

Implement the effective-config resolution layer and tie it to downstream admin-run traceability.

This is the prompt that makes the hybrid model operational instead of merely storable.

## Important execution rules

- Do not re-invent catalog or store semantics already implemented.
- Preserve a clear distinction between:
  - config catalog definition,
  - live override value,
  - effective resolved value,
  - run-time snapshot/provenance.
- Do not attempt to retrofit every existing run domain in one pass unless clearly justified.

## Inputs

Use:
- Prompt-02 baseline
- Prompt-03 catalog model
- Prompt-04 provider/store layer
- Prompt-05 version/audit model
- existing run/audit foundations in backend functions

## Required implementation work

Implement:

1. a resolution service that computes effective config values
2. provenance output that states where the effective value came from
3. effective-version identity or snapshot identity
4. integration points for downstream runs to capture:
   - config version ID
   - snapshot ID or equivalent
   - selected standards version
   - relevant resolved values if needed
5. compatibility seams for provisioning / SharePoint control / future Entra control runs

## Required precedence behavior

The resolution engine must make precedence explicit.
If the baseline did not already freeze precedence, use the canonical order from Prompt-02.

The output must not be ambiguous.
For any resolved item, the system should be able to answer:
- what value was used,
- where it came from,
- what version was active,
- who last changed the live version,
- and whether the value was code-default, live override, or infrastructure-provided.

## Documentation requirement

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-10/admin-spfx-phase-10-resolution-and-traceability.md`

## Validation requirement

Add focused tests proving:
- effective-value resolution
- provenance reporting
- fallback to defaults
- run snapshot linkage or stored config version linkage
- no invalid live override can bypass catalog validation

## Completion condition

Stop when the resolution engine and run-traceability seams are in place and validated.
