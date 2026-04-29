---
name: hb-spfx-runtime-parity
description: Review HB Intel SPFx source, build, manifest, package, runtime, hosted behavior, Vite/IIFE mounts, runtime globals, and app catalog readiness for parity risks.
when_to_use: Use when the task asks whether SPFx source changes will run in SharePoint, whether hosted behavior is stale, whether a package aligns with source, or whether webpart manifests/runtime bindings are correct.
argument-hint: "[SPFx surface, package, webpart, or parity question]"
context: fork
agent: hb-spfx-runtime-parity-auditor
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*)
---

# HB SPFx Runtime Parity

Review SPFx runtime parity for:

```text
$ARGUMENTS
```

## Objective

Determine whether source, build output, manifests, package versioning, runtime binding, and hosted SharePoint behavior can be trusted to represent the intended current implementation.

## Review Areas

1. **Source Truth**
   - Identify the source webpart/app/package.
   - Confirm the current implementation path and package manifest.

2. **Build / Bundle Truth**
   - Identify the build process.
   - Check whether generated artifacts are stale, ignored, or version-mismatched.

3. **Manifest / Version Truth**
   - Check manifest IDs, package versions, webpart versions, and solution package metadata.
   - Flag any package/manifest version changes that lack explicit authorization.

4. **Runtime Binding Truth**
   - Check runtime configuration bridge, property pane inputs, accepted origins, API audience, function host URL, and runtime proof globals where applicable.
   - Flag missing preview fallback or fail-closed behavior where required.

5. **Hosted / App Catalog Truth**
   - Do not assume deployment.
   - Hosted proof requires explicit authorization and sensitive-operation gating.

6. **Validation**
   - Recommend local deterministic validation first.
   - Only recommend `.sppkg`, app catalog, hosted smoke, or live `curl` proof when explicitly authorized.

## Output Format

## Parity Verdict

Use one:

- **Parity Likely**
- **Parity Unproven**
- **Parity Broken**
- **Hosted Proof Required**

## Evidence

- <files inspected, manifests, configs, proof seams>

## Risks

- <stale package, wrong manifest, runtime config gap, hosted mismatch, version drift>

## Required Next Validation

- <local first; hosted only if authorized>


## Standing Constraints

- Use current repo truth before historical summaries.
- Do not re-read files still in active context unless they may have changed, line-level proof is needed, validation/closeout requires proof, scope expanded, or the user asked for a repo-truth audit.
- Separate evidence from recommendation.
- State uncertainty explicitly.
- Do not broaden scope into adjacent cleanup unless the user explicitly authorizes it.
- Do not claim completion without stating what was actually inspected or verified.

