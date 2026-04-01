# Prompt-04 — Phase 6: Migration, Compatibility, and Schema Validation Hardening

## Objective

Establish the formal migration / compatibility posture for the Project Setup SharePoint schema and add any validation needed to prevent schema drift from silently breaking production behavior.

## Required work

1. Determine whether the current repo should:
   - keep legacy/internal-name compatibility permanently
   - support it temporarily with explicit migration notes
   - or require a normalized schema for production

2. Start from the actual current repo posture:
   - legacy imported `field_N` columns are real
   - newer named columns are also real
   - the repo currently uses a mixed schema
   - any normalization target is future-state unless this phase explicitly implements it

3. Implement any appropriate safeguards such as:
   - startup validation
   - repository-level assertions
   - schema mismatch warnings
   - documentation of required production list fields
   - migration helper docs or scripts if appropriate

4. Explicitly document:
   - what schema shape is required in production today
   - what legacy shapes are tolerated
   - what fields are mandatory
   - what mismatches are warning-only vs blocking
   - whether current production can continue safely on the live mixed schema shape

5. Update the review artifact with:
   - current compatibility posture
   - recommended production posture
   - operational risk if legacy mappings remain
   - any migration work intentionally deferred

## Required deliverables

- schema validation / compatibility code updates as appropriate
- updated schema readiness documentation
- explicit note on whether production can continue safely on current schema shape

## Acceptance criteria

- production schema posture is explicit
- tolerated legacy compatibility is explicit
- warning-only vs blocking mismatches are explicit
- the repo no longer hides schema drift assumptions
