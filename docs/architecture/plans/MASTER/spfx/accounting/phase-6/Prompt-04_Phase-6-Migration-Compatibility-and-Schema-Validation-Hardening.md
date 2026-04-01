# Prompt-04 — Phase 6: Migration, Compatibility, and Schema Validation Hardening

## Objective

Establish the formal migration / compatibility posture for the Project Setup SharePoint schema and add any validation needed to prevent schema drift from silently breaking production behavior.

## Required work

1. Determine whether the current repo should:
   - keep legacy/internal-name compatibility permanently
   - support it temporarily with explicit migration notes
   - or require a normalized schema for production

2. Implement any appropriate safeguards such as:
   - startup validation
   - repository-level assertions
   - schema mismatch warnings
   - documentation of required production list fields
   - migration helper docs or scripts if appropriate

3. Explicitly document:
   - what schema shape is required in production
   - what legacy shapes are tolerated
   - what fields are mandatory
   - what mismatches are warning-only vs blocking

4. Update the relevant review docs and readiness notes to reflect:
   - current compatibility posture
   - recommended production posture
   - operational risk if legacy mappings remain

## Required deliverables

- schema validation / compatibility code updates as appropriate
- updated schema readiness documentation
- explicit note on whether production can continue safely on current schema shape
