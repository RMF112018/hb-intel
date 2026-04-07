# Prompt 02 — PrimaryImage Resolver Correction

## Objective

Implement the narrowest correct source-code fix to prevent unresolved SharePoint `PrimaryImage` values from being passed into Spotlight image rendering.

## Problem to Solve

The current behavior appears to allow a non-browser-ready `PrimaryImage` value — likely including a reserved image attachment token shape — to survive the raw mapping path and become the final image `src`.

That is the fault line to correct.

## Scope

Focus on the **resolver / mapping layer** only.

Primary target:
- `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts`

Secondary targets only if required:
- immediate helper used by the Spotlight list source
- normalization helper if and only if the resolver output contract needs a guardrail

## Required Behavior

Implement a robust `PrimaryImage` resolution path that handles the following safely:

1. **Absolute URL**
   - preserve if valid

2. **Server-relative URL**
   - preserve or resolve correctly against site context as needed

3. **Known SharePoint object / JSON image payload**
   - extract the correct URL-bearing property
   - prefer the property that is actually browser-fetchable in SharePoint-hosted runtime

4. **Reserved / opaque image token string**
   - do **not** pass through as `image.src`
   - return `undefined` / no image instead of emitting a bad URL
   - optionally log a development-only diagnostic if the project already has a safe pattern for that

5. **Malformed / empty value**
   - fail closed
   - do not emit bad image URLs

## Correction Requirements

- Keep the correction minimal and local.
- Do not break manifest-seeded fallback images.
- Do not change the Spotlight component’s fallback rendering unless absolutely required.
- Do not introduce SharePoint-host-specific assumptions unless grounded in the actual list payload shape.
- Do **not** re-read files that are already in your active context window; use current context first and only open additional files when needed to complete the task safely and correctly.

## Required Proof Work

Within the code change and completion note, explicitly trace:

- raw `PrimaryImage` input
- resolver output
- mapped Spotlight contract image value
- final component consumption path

## Deliverables

1. Code change implementing the corrected resolver behavior
2. Short completion note with:
   - `What Changed`
   - `Accepted Input Shapes`
   - `Rejected Input Shapes`
   - `Why Reserved Token Values No Longer Reach <img src>`
   - `Any Remaining Ambiguity`

## Risk Exposure

Call out specifically if any of these remain possible after your fix:

- one SharePoint image shape still unhandled
- rail thumbnails using a different path than featured image
- server-relative URLs not resolving correctly in tenant runtime
- overfitting to one observed payload shape

## Standards / Best Practices

- Normalize SharePoint image fields before rendering
- Never trust opaque reserved attachment tokens as final URLs
- Keep UI fallback in the presentation layer, not the data-resolution layer
- Fail closed when image resolution is uncertain

## Validation Gate

Before moving on, prove all of this in your completion note:

- valid absolute and server-relative URLs still work
- unresolved reserved token strings no longer become `image.src`
- no unrelated files were modified
