# Prompt 01 — Pipeline Audit and Repo Truth

## Objective

Perform a repo-truth audit of the current `hb-webparts` / PnP Operations build and packaging path, focusing on stale artifact reuse, package/source drift, and the exact points where a fresh source change can fail to make it into the final `.sppkg`.

## Prompt

```text
You are working in the live local repo and have direct filesystem/build access.

Your job in this task is to perform a comprehensive repo-truth audit of the PnP Operations SPFx packaging path before making code changes.

Primary target:
- `apps/hb-webparts/src/webparts/pnp/`

Additional critical paths:
- `apps/hb-webparts/src/mount.tsx`
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `tools/spfx-shell/config/package-solution.json`
- `tools/spfx-shell/release/manifests/`
- `dist/sppkg/`

Important working rule:
- Do not re-read files that are still within your active context or memory window unless needed for precision.

Audit goals:
1. Trace the end-to-end path from PnP source files to the final `hb-webparts.sppkg`
2. Identify every place where stale output can be reused
3. Determine whether `apps/hb-webparts/dist` can bypass a fresh Vite build
4. Determine whether checked-in release assets/manifests can drift from current source
5. Determine whether the package verification logic proves structural correctness only, or actual freshness and source alignment
6. Determine whether the runtime shell diagnostics are strong enough to isolate “webpart added but not rendered” failures
7. Determine whether the authoring/configuration surface for PnP Ops is adequate for real deployment
8. Determine whether the current package can truthfully be called “fresh” without deleting prior build output

Required deliverable:
Create a markdown audit at:
- `docs/architecture/reviews/pnp-ops-gap-closure-prework-audit.md`

Required sections:
- Objective
- Scope
- Repo-Truth Findings
- Freshness Failure Modes
- Package-Truth Failure Modes
- Render/Runtime Diagnostic Gaps
- Authoring/Configuration Gaps
- Ranked Root Causes
- Recommended Fix Sequence

Requirements:
- Be exact and path-specific
- Distinguish facts from inferences
- Cite concrete files/functions/branches in prose
- Do not stop at “likely stale package”; trace exactly how that could happen in this repo
- Call out every existing proof that is insufficient or overly structural
- End with a sequenced implementation plan the next prompts can execute

Do not implement changes in this task unless a trivial audit-enabling instrumentation change is absolutely required.
```
