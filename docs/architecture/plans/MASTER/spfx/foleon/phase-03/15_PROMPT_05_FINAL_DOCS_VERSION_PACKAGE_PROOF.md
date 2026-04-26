# Prompt 05 — Final Docs, Version, Package Proof, and Tenant Validation

## Objective

Finalize the three-lane Foleon homepage cutover for tenant deployment.

## Global rules

- Work in `/Users/bobbyfetting/hb-intel` on `main`.
- Use live repo truth. Do not rely on summaries without checking current files.
- Do not re-read files still in current context unless verifying a specific contradiction or line.
- Do not touch unrelated `.gitignore`, Safety files, backend files outside Foleon scope, or untracked phase docs.
- Do not hardcode tenant GUIDs.
- Do not mutate tenant lists unless the prompt explicitly authorizes tenant provisioning.
- Do not reintroduce public person-field `$select` or `$expand`.
- Do not mount `window.__hbIntel_foleon` inside the homepage.
- Do not weaken reader gate, origin allowlist, preview URL blocking, or runtime proof redaction.
- Use Node 18 where SPFx tooling requires it.


## Docs

Update:

- homepage deployment docs;
- Foleon reader docs;
- tenant rollout runbook;
- package/version notes;
- persisted property warnings;
- breakpoint evidence docs.

## Validation

Run full validation for:

- `@hbc/foleon-reader`;
- `@hbc/spfx-hb-intel-foleon`;
- `@hbc/spfx-hb-webparts`;
- `@hbc/spfx-hb-homepage`;
- package builds/proof for changed packages.

## Package artifacts

Document:

- Foleon package path if rebuilt;
- homepage package path;
- SHA256;
- staged status.

Final closure evidence is captured in
[`17_FINAL_CLOSURE_EVIDENCE.md`](./17_FINAL_CLOSURE_EVIDENCE.md). This pass does not rebuild Foleon; it documents the existing Foleon `1.0.23.0` package/runtime truth and the audited promotion from the prior accepted homepage `1.1.78.0` cutover target to the coherent homepage `1.1.79.0` package artifact proof.

## Tenant follow-up

Document:

- schema choice verification;
- App Catalog uploads;
- existing page property updates;
- runtime proof;
- three lane validation;
- breakpoint screenshots.

## Commit

```text
hb-homepage: finalize foleon communications lane cutover
```

## Locked execution clarifications

- Documentation/evidence only.
- No tenant list mutation and no tenant webpart property mutation.
- No source changes and no package/version bump.
- No generated `dist/` artifacts staged.
- Broad validation blockers must remain classified separately from focused changed-area validation.
