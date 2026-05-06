---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# 03 — Project Identity and Profile Source Contract

## Purpose

Ensure the shell uses a credible preview project identity source and does not show conflicting project facts.

## Resolved Decision

Use the **fixture-selected project profile** as the authoritative preview identity source for the hosted PCC shell.

Do not continue using a generic shell-only placeholder as the visible identity source.

## Required Identity Source Order

For this phase:

1. If a selected project profile fixture is available, use it.
2. If multiple fixture profiles are available, use the selected/default preview profile.
3. If read-model profile is explicitly wired and stable, use the read-model profile.
4. If no profile is available, render a controlled missing-profile shell state.
5. Do not use SharePoint page/site metadata as authoritative yet unless a later phase maps it into `IProjectProfile`.

## Locked Hero Fact Rules

The hero must show only these mandatory facts:

- location;
- estimated value;
- scheduled completion;
- project stage.

The hero must not show:

- project number;
- client;
- project status;
- source confidence;
- last updated.

## Project Number Exclusion

Project number is excluded from the hero because it is visible in SharePoint chrome. The implementation must add tests or documentation evidence that project number is not rendered by `PccProjectHeroBand`.

## Identity Consistency Rules

The shell and Project Home must not show conflicting:

- project name;
- location;
- estimated value;
- scheduled completion;
- project stage.

If the Project Home surface has deeper project intelligence, it must use the same source profile or clearly label derived/secondary values.

## Missing Profile State

If profile data is unavailable, the shell must render:

- primary title: `Project Control Center`;
- secondary title: active surface name;
- state card: `Project profile unavailable`;
- explanation: `Project context could not be loaded for this preview.`;
- no fake placeholder client/value/location.

## Acceptance Criteria

- No `Reference Client`, `Reference Location`, or `$0` in final hosted hero unless those are intentionally part of the selected fixture.
- Project number not present in hero.
- Mandatory facts present where profile data exists.
- Missing profile state is intentional, not blank.
- Tests cover source alignment and excluded facts.
