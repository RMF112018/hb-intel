# Prompt 03 — Managed Identity, Storage, and Secrets Hardening

You are continuing the **HB Intel Estimating / Project Setup SPFx** Phase 4 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Implement the **managed identity / storage / secrets hardening** work required for a production-safe Project Setup deployment.

This prompt is focused on identity-bound infrastructure dependencies and runtime credential posture.

## Critical instructions

- Use the Phase 4 baseline and Prompt 02 output as governing sources.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** drift into broad business-logic redesign.
- Do **not** keep unclear or unjustified secret usage when a better identity/config boundary should be used.

## Required working approach

1. Inventory all retained managed-identity and credential-dependent service paths.
2. Classify each remaining config/secret value as:
   - required secret
   - required non-secret setting
   - replaceable with managed identity
   - removable
3. Review Azure Storage usage for Functions host/runtime and any retained application dependency.
4. Harden secret/config handling and remove ambiguous patterns.
5. Document the production identity and storage requirements clearly.

## Specific outcomes required

By the end of this prompt:
- the identity posture for retained services should be explicit
- storage/runtime prerequisites should be documented and justified
- unnecessary or ambiguous secret handling should be removed or marked for removal with exact rationale
- the codebase should better communicate which services run with which identity/config dependency

## Required implementation outputs

Make the code and documentation changes necessary to:
- clarify managed-identity usage
- reduce unclear secret reliance
- document storage/runtime dependencies
- improve configuration classification and operator guidance

Update or create markdown summarizing:
- retained identities and their purposes
- remaining required secrets/settings
- storage requirements
- removed or deprecated secret-like patterns

## Acceptance criteria

- Managed identity and remaining secrets are deliberate, minimal, and documented.
- Storage/runtime dependencies are explicit and production-appropriate.
- Engineers and operators can tell which identity/config path each retained capability depends on.

## Required summary back to me

When done, report:
- files changed
- identity paths clarified or changed
- secrets/settings removed, reclassified, or retained
- storage/runtime dependencies documented
- any risky credential patterns still unresolved
