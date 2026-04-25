# Local Agent Remediation Prompt — HB Intel Foleon SPFx Toolbox / Connector Availability

You are working in the live `hb-intel` repository. Use the current main branch as source of truth. Do not rely on assumptions from prior package builds, screenshots, or deployment claims. Do not re-read files that are still in your current context or memory.

## Objective

Identify and remediate why the Foleon connector/manager experience is not reliably available to add on a SharePoint modern page after deploying the SPFx package. The remediation must make the package truth and tenant behavior unambiguous.

The current inspected package `hb-intel-foleon(2).sppkg` contains a single web part manifest titled `HB Intel Foleon Connector` with default `foleonRoute="highlights"`. The management surface exists at runtime behind `foleonRoute="manage"`, but there is not a dedicated manager toolbox entry.

## Required investigation

1. Inspect the Foleon SPFx source package under the repo.
2. Inspect its manifest(s), package-solution configuration, generated package output, and bundled assets.
3. Confirm whether the intended UX is:
   - one web part with route-driven modes, or
   - separate toolbox entries for highlights, reader, hub, and manager, or
   - separate SPFx components for public and restricted manager surfaces.
4. Audit the generated `.sppkg` by unzipping it and proving:
   - Product ID
   - solution version
   - feature version
   - component IDs
   - preconfigured entries
   - hiddenFromToolbox values
   - supported hosts
   - loader asset paths
   - packaged list schema files
5. Determine whether app catalog / site-installed package drift could explain the tenant showing only a reader entry.
6. Audit list provisioning packaging and upgrade posture. Confirm whether broken existing lists would be repaired by package upgrade or require explicit upgrade actions / reinstall / repair provisioning.

## Required remediation

Implement the least-risk correction that satisfies the user requirement: selected users must be able to manage Foleon content without opening SharePoint lists directly.

At minimum, add a dedicated manager/connector toolbox entry unless repo-truth proves a stronger architecture is required.

Recommended manifest shape:

- Public entry:
  - Title: `HB Intel Foleon Highlights`
  - Properties: `{ "foleonRoute": "highlights" }`
- Manager entry:
  - Title: `HB Intel Foleon Manager`
  - Properties: `{ "foleonRoute": "manage" }`
  - Description: `Manage Foleon content registry, placements, validation, and sync proof.`

If permissions, property pane controls, telemetry, or page authoring requirements differ materially, split manager into its own web part component instead of relying only on multiple preconfigured entries.

## Required proof

Generate proof artifacts under the repo showing:

1. package-truth audit before and after remediation
2. manifest diff
3. package unzip evidence
4. SHA-256 of generated `.sppkg`
5. all toolbox entries found in the generated package
6. list schema packaging evidence
7. route render proof for `highlights`, `manage`, `hub`, and `reader`
8. tenant deployment checklist with commands to detect stale app catalog/site app drift
9. list usability validation plan for the four Foleon lists

## Validation commands

Run the applicable repo commands and include output summaries:

- install/build checks
- typecheck
- lint where available
- package-solution / package generation
- custom package unzip inspection script
- targeted tests for route selection and manifest/preconfigured entries

Do not claim closure unless the generated package itself proves the manager/connector entry is present and not hidden from the toolbox.

## Deliverables

1. Audit report
2. Code changes
3. Package-truth proof output
4. Tenant deployment / drift verification runbook
5. Final closure summary with exact changed files and validation results
