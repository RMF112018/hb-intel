# Phase 18 Wave 01 — Prompt 01 Closure

**Status:** Closed
**Closure date:** 2026-04-16
**Manifest bump:** `hb-publisher` `1.0.0.60` → `1.0.0.61`
**Scope:** Freshness enforcement and freshness proof for `hb-publisher` packaging.

## What changed

`tools/build-spfx-package.ts` previously hard-enforced fresh-build cleanup and
packaged-bundle SHA verification only for `hb-webparts`. Publisher — the
current audit target — could package from stale `apps/hb-publisher/dist/`
output with no detection.

This prompt closes the gap by moving the freshness policy into the domain
registry itself so it is declarative, domain-aware, and uniform across any
future domain that joins the audit posture.

### Code changes (`tools/build-spfx-package.ts`)

1. Extended `DomainConfig` with `freshBuildRequired?: boolean`.
2. Set `freshBuildRequired: true` on `hb-webparts` and `hb-publisher`.
3. Replaced the inline `domain.dir === 'hb-webparts'` checks at the fresh-build
   gate and the packaged-bundle verification gate with
   `domain.freshBuildRequired === true` / `enforceFreshBuild`.
4. Promoted `verifyPackagedBundleFreshness` to return
   `PackagedFreshnessResult { ok, packagedSha, details }` so the caller can
   write a Publisher freshness proof without re-extracting the archive.
5. Added `writeFreshnessProof()` helper and wired it in on both the Publisher
   failure and success paths. Webparts continues to use its richer shim /
   package-truth proofs (left untouched).

### Proof artifact

New auditable artifact at `dist/sppkg/hb-publisher-freshness-proof.json`:

```
{
  "domain": "hb-publisher",
  "generatedAt": "…",
  "packagingRunId": "…",
  "sppkgFile": "hb-publisher.sppkg",
  "sourceBundle": { "fileName": "hb-publisher-app.js", "sha256": …, … },
  "packagedBundle": { "fileName": "hb-publisher-app-<hash>.js", "sha256": … },
  "freshness": { "pass": true, "details": [...] }
}
```

## Verification performed

Command: `npx tsx tools/build-spfx-package.ts --domain hb-publisher`

Observed (with a stale `apps/hb-publisher/dist/` present):

```
✓ Freshness gate: removed stale dist directory apps/hb-publisher/dist
  Building app with Vite (fresh build enforced)...
  ✓ Freshness evidence captured: hb-publisher-app.js (sha256:8e540b4ee18e..., ...)
  ✓ .sppkg structure verified
  ✓ Packaged bundle freshness verified (hb-publisher-app-8e540b4e.js, sha256:8e540b4ee18e...)
  ✓ Packaged shell asset references hb-publisher-app-8e540b4e.js and __hbIntel_hbPublisher
  ✓ Freshness proof written: dist/sppkg/hb-publisher-freshness-proof.json
  ✅ hb-publisher.sppkg (359.4 KB)
✅ All 1 domain(s) packaged successfully.
```

Additionally:
- Standalone TypeScript check of the modified orchestrator: clean
  (`tsc --noEmit --skipLibCheck --lib es2021,dom tools/build-spfx-package.ts`).
- `dist/sppkg/hb-publisher-freshness-proof.json` read back: source and
  packaged SHAs match byte-for-byte; `freshness.pass: true`.
- `hb-webparts-shim-proof.json` and `hb-webparts-package-truth-proof.json`
  are untouched (unchanged mtime in `dist/sppkg/`).

## Out of scope (handled by later prompts in this wave)

- Full package-truth proof generalization to Publisher (shim-less,
  single-manifest) — Prompt-02.
- Domain-aware `collectRuntimeSourceFingerprints` for Publisher — Prompt-02.
- Shell-entry simplification for single-manifest Publisher — Prompt-03.
- Hosted instantiation / load proof in SharePoint — Prompt-04.
