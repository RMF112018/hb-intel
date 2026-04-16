# 05 — Package Rebuild Rationale

## Why the attached remediation package was not enough

The attached package had three main weaknesses:

### 1. it treated some partially remediated areas as if they were still untouched
That would have caused a fresh code agent to spend effort rediscovering good work already landed rather than finishing the real remaining gap.

### 2. it under-described schema/list hardening implications
The earlier package identified key governance and lineage issues, but it did not force a clear schema-owner answer or structured error/lineage architecture decisions.

### 3. it left a real operability gap as a recommendation rather than required work
The current publishing-errors surface is still too weakly structured for support-grade backend operations.
That should not remain a soft note.

## Rebuild decisions made

1. retained the original five issue clusters because they are still the right core closure items
2. strengthened each prompt with:
   - current repo reality
   - residual gap only
   - required surfaces
   - non-negotiable rules
   - more specific test requirements
3. added a sixth prompt for structured publishing-error operability
4. made Prompt 04 explicitly resolve schema authority rather than only saying “harden keys”
5. made Prompt 05 explicitly build on existing supersededBinding work rather than pretending no lineage mitigation exists
6. kept broader destination/scheduler/lookups work intentionally out of scope

## Net result

The enhanced package is more forceful, more precise, and more executable for a local code agent.
