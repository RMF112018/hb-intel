# Narrow Runtime CSS Remediation Package

## Objective

This package instructs the local code agent to resolve the specific failure seam where the rebuilt Signature Hero markup is rendering in SharePoint, but the intended premium CSS styling is not being applied at runtime.

This is **not** a redesign package.
This is **not** a packaging-registry package.
This is a **narrow CSS runtime / shell-entry / asset-attachment package**.

## Confirmed Failure Pattern

Current source truth indicates:
- rebuilt `HbSignatureHero.tsx`
- rebuilt `signature-hero.module.css`
- cleaned Signature Hero manifest

Current SharePoint runtime indicates:
- rebuilt hero content is present
- but the visual result looks largely unstyled / vanilla
- dark premium surface, layout containment, logo sizing, and hierarchy are not taking effect

Treat this as a runtime CSS loading / attachment problem until proven otherwise.

## Package Sequence

Run these prompts in order:

1. `Prompt-01-Forensic-Runtime-CSS-Audit.md`
2. `Prompt-02-Fix-CSS-Emission-And-Shell-Attachment.md`
3. `Prompt-03-Validate-SharePoint-CSS-Load-Path.md`
4. `Prompt-04-Clean-Rebuild-And-Deployment-Proof.md`

## Hard Gates

- Do not redesign the hero again in this phase.
- Do not treat package staleness as the current primary issue unless CSS proof shows otherwise.
- Do not stop at “the CSS exists in source.”
- Do not stop at “the CSS exists in the package.”
- Do not mark complete until SharePoint runtime proof shows the hero styles are actually active in the browser.
- Do not re-read files that are still within your current context window or memory. Re-open files only when necessary to verify changed or unresolved details.

## Required Outcome

The next generated `.sppkg` and SharePoint runtime must prove:
- hero CSS module is emitted correctly
- emitted CSS asset is loaded by SharePoint
- shared shell-entry/runtime attaches the correct CSS asset
- CSS-module class rules are active in the browser
- rebuilt hero renders with its intended premium surface and hierarchy
