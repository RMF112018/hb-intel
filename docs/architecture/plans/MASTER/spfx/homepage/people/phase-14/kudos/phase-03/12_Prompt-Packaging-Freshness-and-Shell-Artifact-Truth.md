# Prompt — Packaging Freshness and Shell Artifact Truth

## Objective
Close the packaging-confidence gap by rebuilding the HB webparts package, aligning generated shell artifacts with current source, and producing direct proof that the current Kudos source is what is actually packaged.

## Repo truth
Work directly against the live repo:
- `https://github.com/RMF112018/hb-intel`

Do not re-read files that are already in your current context or memory.

## Governing authority
Use repo truth and at minimum:
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
- current live `@hbc/ui-kit`
- current live `docs/reference/ui-kit/`


## Scope
- `apps/hb-webparts/config/package-solution.json`
- `tools/spfx-shell/config/package-solution.json`
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `tools/spfx-shell/release/manifests/*`
- current HB Kudos manifests and mount wiring

## Non-negotiable requirements
- Do not treat existing generated release manifests as sufficient proof that the currently shipped package is fresh.
- Resolve version/config drift between source package metadata and generated shell package metadata.
- Rebuild `hb-webparts.sppkg` and inspect the result directly.
- Produce explicit proof that the two Kudos manifests and current shell-entry assets are in the rebuilt package.

## Guardrails
- Repo truth first.
- Do not accept comments, manifest descriptions, or stale reports as proof by themselves.
- Do not leave “writer support exists” as a substitute for a runtime-complete workflow.
- Do not preserve weak bespoke local UI where shared homepage-safe promotion is warranted.
- Do not claim closure unless code, runtime behavior, tests, and documentation align.

## Required outputs
- rebuilt package artifacts
- packaging freshness proof written under `docs/architecture/reviews/`
- any necessary code/config changes to eliminate drift

## Verification
- show exact commands used
- show direct package inspection proof for the two Kudos webparts
- show hash/version/path alignment between source and packaged outputs
