# HB Brand Font License Clearance

## Clearance Status

- Status: Approved (Owner-directed override for Prompt 06 execution)
- Approval owner: Repository owner override (Prompt 06 execution authority)
- Approval date: 2026-04-29
- License/source reviewed: `docs/reference/brand/HB-Brand-Guide.zip` (`Fonts/Futura®.zip`) reviewed for contained family and format availability; formal legal record pending.
- Permitted internal-use scope: Internal HB Intel product surfaces through governed UI-kit theme layer only.
- Permitted web/app embedding scope: UI-kit-packaged web embedding for internal HB Intel runtime use only.
- Redistribution restrictions: No redistribution outside repository-controlled product bundles; no inclusion in prompt artifacts/docs exports/public issue artifacts.
- Approved font formats: OTF (owner override for Prompt 06); convert-to-web format policy deferred.
- Approved repo placement: `packages/ui-kit/src/theme/fonts/` only.
- Fallback stack: `"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif`.
- Review expiration or revisit trigger: Revisit on any external distribution request, license update, package publication scope change, or by 2026-07-31 (whichever occurs first).

## Implementation Boundary

Approved font files may be placed only in:

`packages/ui-kit/src/theme/fonts/`

Consumers must use governed UI-kit theme exports/tokens, not raw font paths.

## Non-Redistribution Rule

Font binaries must not be included in generated prompt packages, exported documentation zips, public artifacts, issue bodies, screenshots, or summaries.
