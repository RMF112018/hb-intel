# Prompt 02 — Runtime Loader Contract and SharePoint-Hosted Proof

## Objective

Implement the **runtime loader-contract and SharePoint-hosted proof** pass for Tool Launcher / Work Hub so the packaged launcher is validated under real homepage runtime conditions, not just source inspection or local composition preview.

## Context you must respect

- Prompt 01 should already have validated the launcher against the cumulative `hb-webparts` build path.
- The launcher is rendered through the homepage mount / dispatch seam and must survive SharePoint-hosted loading.
- The composition reference is useful, but it is not the production runtime path.

## Repo-truth targets

Audit and validate the runtime surfaces at minimum under:

- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- launcher-adjacent docs and build notes if they need runtime-proof updates

## Required work

1. Confirm the launcher’s webpart ID, renderer registration, and runtime dispatch path are still correct.
2. Validate SharePoint-hosted rendering for:
   - command band
   - flagship stage
   - utility rail
   - workflow shelves
   - all-platforms overlay / index layer
3. Validate packaged-runtime interaction behavior, including:
   - search and suggestions
   - overlay open / close behavior
   - keyboard and focus handling
   - utility-rail support actions
4. Identify any runtime-only regressions that do not appear in local preview and remediate them precisely.
5. Document the proof steps and runtime outcomes clearly.

## Explicit exclusions

- Do not re-open earlier launcher feature scope unless a real runtime regression requires a narrow fix.
- Do not treat local composition reference behavior as sufficient proof of production readiness.
- Do not broaden into unrelated homepage runtime work.

## Validation requirements

- prove the launcher loads and renders correctly in SharePoint-hosted conditions
- prove runtime loader / dispatch behavior still resolves the launcher correctly
- prove packaged interaction behavior is intact
- document all runtime proofs and any environment-specific findings

## Deliverables

- runtime loader-contract validation
- SharePoint-hosted proof notes
- any narrow runtime remediation required
- documentation updates capturing hosted-runtime behavior and proof steps

## Working rules

- repo truth first
- do not re-read files still in current context unless needed
- do not broaden scope
- validate hosted runtime behavior explicitly
- prefer narrow evidence-based fixes if runtime regressions are found
