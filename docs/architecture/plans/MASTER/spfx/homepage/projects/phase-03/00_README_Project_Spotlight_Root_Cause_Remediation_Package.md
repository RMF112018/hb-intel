# Project Spotlight Root-Cause Remediation Prompt Package

## Objective

Identify and resolve the two upstream data-mapping failures currently breaking the SharePoint-hosted Project Spotlight webpart:

1. `PrimaryImage` is not resolving into a valid browser-renderable image URL.
2. HTML / rich-text content is being passed into the card `summary` field and rendered as escaped literal text.

This package is intentionally narrow.

It is **not** a redesign package.
It is **not** a visual polish package.
It is **not** a general SharePoint integration refactor.

The goal is to make the code agent:

- trace the actual list row payload shape,
- identify where image and summary normalization are failing,
- implement the smallest correct fix,
- validate the SharePoint-hosted runtime result,
- and preserve the existing Spotlight UI architecture.

## Package order

1. `01_Project_Spotlight_Root_Cause_Audit.md`
2. `02_Project_Spotlight_PrimaryImage_Field_Mapping_Remediation.md`
3. `03_Project_Spotlight_Summary_Field_HTML_Normalization_Remediation.md`
4. `04_Project_Spotlight_End_to_End_Validation_and_Closure.md`

## Hard gates

- Do not widen scope into layout or styling changes.
- Do not redesign the component.
- Do not alter unrelated data contracts unless required for the narrow fix.
- Treat the SharePoint list as the primary runtime data source.
- Preserve the manifest fallback model for local/demo use.
- Validate in packaged SharePoint-hosted output, not just local source inspection.

## Expected final outcome

- featured image renders when the list row has a valid image asset,
- image fallback remains graceful when the asset is missing,
- summary/body text displays clean editorial text rather than escaped HTML markup,
- and the rest of the webpart remains materially unchanged.
