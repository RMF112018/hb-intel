# Project Spotlight — Narrow Image Remediation Prompt Package

## Objective

Implement the smallest correct code change necessary to fix the **Project / Portfolio Spotlight** list-backed image failure in SharePoint-hosted runtime.

This package is intentionally narrow. It is based on the forensic audit that found the most likely fault line to be the **`PrimaryImage` field normalization / resolution path**, where a SharePoint reserved image attachment token is being allowed to survive into the final browser `<img src>` value instead of being resolved into a fetchable URL or rejected cleanly.

## Package Contents

- `01_PrimaryImage_Remediation_Scope_Lock.md`
- `02_PrimaryImage_Resolver_Correction.md`
- `03_Featured_and_Rail_Image_Validation.md`
- `04_SPPKG_Rebuild_and_Package_Truth_Verification.md`
- `05_SharePoint_Runtime_Proof_and_Closeout.md`
- `09_Remediation_Package_Summary.md`

## Dependency Order

Execute in this order:

1. Scope lock
2. Resolver correction
3. Featured + rail validation
4. SPPKG rebuild and package-truth verification
5. SharePoint runtime proof and closeout

## Rules of Engagement

- Stay narrow to the **image-loading failure**.
- Do **not** widen into UI polish, styling, layout refactors, list schema redesign, or general homepage improvements.
- Do **not** re-read files that are already in your active context window; use current context first and only open additional files when needed to complete the task safely and correctly.
- Treat **repo truth** as authoritative.
- Validate both **source truth** and **package truth**.
- Prefer small, reversible corrections over broad rewrites.

## Expected End State

Successful completion means all of the following are true:

- the Spotlight featured image renders from the SharePoint list when valid data exists
- supporting rail thumbnails also render correctly
- unresolved `PrimaryImage` token values are **not** passed through as browser image URLs
- the rebuilt `.sppkg` preserves the corrected behavior
- SharePoint-hosted runtime proof confirms the fix
