# Narrow Remediation Package Summary — Project Spotlight Image Failure

## Objective

Provide the implementation summary and execution logic for the narrow Project Spotlight image remediation package.

## Root Cause the Package Is Designed to Address

Most likely fault line:

- the SharePoint list-backed `PrimaryImage` field is sometimes not a browser-ready URL
- a reserved / opaque image token shape is being trusted too early
- that unresolved value becomes the final image `src`
- the browser request fails
- the Spotlight component falls back to placeholder state

## What This Package Deliberately Does

- isolates the data / resolver layer
- corrects `PrimaryImage` normalization behavior
- validates both featured and rail image paths
- verifies the rebuilt `.sppkg` preserves the fix
- requires tenant runtime proof before closeout

## What This Package Deliberately Avoids

- UI polish
- layout changes
- typography / color / spacing changes
- shell-extension work
- unrelated homepage webpart work
- architecture refactors beyond the minimal correction

## Execution Order

1. `01_PrimaryImage_Remediation_Scope_Lock.md`
2. `02_PrimaryImage_Resolver_Correction.md`
3. `03_Featured_and_Rail_Image_Validation.md`
4. `04_SPPKG_Rebuild_and_Package_Truth_Verification.md`
5. `05_SharePoint_Runtime_Proof_and_Closeout.md`

## Key Risks

- fixing only one image surface
- allowing another unresolved field shape to pass through
- validating source but not package
- validating package but not tenant runtime
- masking the issue with fallback rather than fixing the resolver

## Success Criteria

The package is successful only when:

- list-backed featured image renders
- list-backed rail thumbnails render
- unresolved reserved token strings no longer reach `<img src>`
- rebuilt package contains the corrected logic
- SharePoint runtime proof confirms the actual fix

## Recommended Working Style

Use short completion notes after each prompt. Keep every step evidence-based and narrow. Do not widen scope unless a blocking dependency is proven.
