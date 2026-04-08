# P04 — Runtime Hardening, Build, Package, and Tenant Validation

## Objective

Finish the People & Culture live-list remediation by hardening runtime behavior, producing a fresh package, and validating that the deployed homepage surface is genuinely list-backed.

## Scope

Perform only the validation and packaging work required to close the remediation.

## Runtime hardening checklist

Confirm all of the following before packaging:

- loading state works
- fallback to manifest props works when live list fetch fails
- no-SPFx-context local/dev rendering still works
- unsupported celebration types do not crash or leak invalid contract values
- missing people, missing taxonomy, or missing image fields do not crash rendering
- pending/unapproved kudos are excluded by the existing normalizer
- malformed internal name assumptions have been eliminated through live metadata resolution
- no stale placeholder-only behavior remains when the site lists are reachable

## Build path

Use the repo-truth packaging script:

```bash
npx tsx tools/build-spfx-package.ts --domain hb-webparts
```

If the environment requires an explicit Node 18 binary, honor the repo’s packaging expectations rather than inventing a parallel build path.

## Package output expectation

Produce a fresh:

```text
dist/sppkg/hb-webparts.sppkg
```

Verify that the package contains the latest People & Culture implementation.

## Required proof steps

### 1. Build/package proof
Capture:
- whether the build succeeded
- whether packaging succeeded
- the final `.sppkg` path
- any exact failure messages if it did not succeed

### 2. Runtime proof
In the SharePoint-hosted homepage placement on:

```text
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
```

verify:
- the webpart renders
- live list content appears
- the output is not obviously manifest-seeded fallback content
- sparse or partial list scenarios still look intentional
- the premium styling survived the live-data switch

### 3. Data proof
Verify:
- announcements are coming from the live announcements list
- kudos are coming from the live kudos list
- celebrations are coming from the resolved celebrations list
- list titles and internal names match what the adapter now uses
- the celebration list URL / title inconsistency was resolved

## Required final implementation note

At the end of execution, write a concise completion note containing:

1. summary of what changed
2. exact files changed
3. final list titles used
4. final field mappings used
5. fallback behavior
6. schema inconsistencies discovered
7. build / packaging status
8. SharePoint validation status

## Acceptance criteria

- fresh `hb-webparts.sppkg` produced unless a concrete build failure blocks it
- exact failure text documented if blocked
- tenant validation confirms list-backed behavior
- final note is concrete and field-specific, not generic
