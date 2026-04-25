# Prompt 03 — Correct Hosted Path and Shell Equivalence

You are working in the live `hb-intel` repository on `main`.

## Objective

Resolve the host-path defect that causes the SharePoint Safety page to be classified as unsafe `shell-webpart`, or make the shell-hosted path provide equivalent Safety-specific governance guarantees before allowing initialization.

## Governing Files / Seams

Inspect and update only as required:

- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.manifest.json`
- `tools/spfx-shell/config/config.json`
- `tools/build-spfx-package.ts`
- `apps/safety/src/mount.tsx`
- `apps/safety/src/runtime/safetyRuntimeContract.ts`
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx`
- `apps/safety/src/webparts/safety/SafetyWebPart.manifest.json`
- `apps/safety/config/package-solution.json`

Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Current Gap

The observed hosted runtime is consistent with this chain:

1. The Safety page loads `safety-app-*.js`.
2. The mount receives SPFx context and shell-style config containing `webPartId`.
3. `apps/safety/src/mount.tsx` classifies that as `hostSource = "shell-webpart"`.
4. The runtime contract intentionally blocks `shell-webpart`.
5. The shell does not pass the full Safety governance contract.

## Required Implementation Outcome

Pick one clear production posture and implement it completely.

### Option A — Dedicated Safety Webpart Path

Use the dedicated `SafetyWebPart` as the hosted authority.

Requirements:

- Ensure the packaged Safety `.sppkg` actually compiles and deploys the dedicated Safety webpart class or a domain-specific wrapper that supplies the same contract.
- Ensure the hosted SharePoint page contains the dedicated Safety webpart instance, not a stale shell/orchestrator instance.
- Ensure page provisioning or app installation deterministically sets/derives all binding values.

### Option B — Governed Shell-Compatible Safety Path

Allow shell-hosted Safety only when the shell supplies equivalent binding guarantees.

Requirements:

- Shell must pass the complete Safety runtime binding:
  - `functionAppUrl = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net`
  - `acceptedBackendOrigin = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net`
  - `apiAudience = api://08c399eb-a394-4087-b859-659d493f8dc7`
  - `expectedManifestId = ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e`
  - `expectedPackageVersion = 1.2.36.0`
  - `expectedHostedGuidOverlayFingerprint = fnv1a32:36b2f764`
- Safety runtime must not classify all configs containing `webPartId` as blocked unless they lack a valid Safety binding proof.
- If a host declares shell ownership, it must also declare a valid Safety-equivalent binding proof.
- Invalid shell-hosted Safety remains blocked.

## Required Proof of Closure

Provide:

```bash
git grep -n "__hbIntel_safety" apps/safety tools/spfx-shell tools/build-spfx-package.ts
git grep -n "webPartId" apps/safety tools/spfx-shell
git grep -n "shell-webpart" apps/safety tools/spfx-shell
git grep -n "ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e" apps/safety tools/spfx-shell tools/build-spfx-package.ts
pnpm --filter @hbc/spfx-safety test
pnpm --filter @hbc/spfx-safety build
npx tsx tools/build-spfx-package.ts --domain safety
```

Also provide a source explanation answering:

- Which class is the actual SPFx webpart class in the packaged `.sppkg`?
- Is the hosted Safety page supposed to use dedicated Safety webpart or shell-hosted Safety?
- What exact condition allows initialization?
- What exact condition blocks initialization?
- How does the page prove it is not using a stale or wrong webpart instance?

## Constraints

- Do not merely remove the shell-hosted blocker.
- Do not silently infer production binding from `webPartId` alone.
- Do not use manual page editing as the only durable fix.
- Do not change unrelated shell apps.
