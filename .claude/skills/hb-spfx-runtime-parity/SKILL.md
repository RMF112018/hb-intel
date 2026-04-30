---
name: hb-spfx-runtime-parity
description: Govern SPFx source, manifest, package, runtime, IIFE/global mount, hosted parity, and app catalog risk.
when_to_use: Use for SPFx source/build/manifest/runtime/hosted parity, webpart packaging, `.sppkg`, app catalog, or SharePoint-hosted behavior.
argument-hint: "[SPFx app/surface]"
agent: hb-spfx-runtime-parity-auditor
---

# HB SPFx Runtime Parity

Review SPFx scope:

```text
$ARGUMENTS
```

## Required Sources

- nearest app README and `package.json`
- app `config/**`
- adjacent webpart manifest
- `tools/validate-manifests.ts`
- relevant UI doctrine
- validation reference docs

## Confirm

- manifest/source/package alignment;
- supported hosts;
- IIFE/global mount contract;
- CSS/bundle emission where applicable;
- preview/fallback states;
- no unauthorized `.sppkg`, app catalog, tenant, or hosted probe.

## Output

- Parity status
- Required validation
- Sensitive-operation boundary
- Residual risk
