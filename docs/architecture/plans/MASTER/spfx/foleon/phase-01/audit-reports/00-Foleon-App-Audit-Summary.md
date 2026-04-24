# 00 — Foleon App Audit Summary

## Executive Decision

`hb-intel-foleon 1.0.0.0` is **not production ready** and cannot be certified as a credible repo-backed MVP from the inspected `main` branch.

## Basis

## Repo-Truth Evidence Captured

The audit attempted to verify the claimed Foleon implementation directly against `RMF112018/hb-intel` on `main`.

Observed repo-truth results:

- `apps/hb-intel-foleon/README.md` returned Not Found.
- `apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json` returned Not Found.
- GitHub code search for `Foleon`, `foleon`, `hb-intel-foleon`, and the claimed manifest GUID `2160edb3-675e-4451-92bb-8345f9d1c71e` returned no results.
- GitHub commit fetch for short SHA `b1e27a3c` returned no commit found.
- `tools/build-spfx-package.ts` exists, but the inspected domain registry does not include a Foleon domain. The visible domain registry includes accounting, estimating, project-hub, leadership, business-development, admin, safety, quality-control-warranty, risk-management, operational-excellence, human-resources, project-sites, hb-homepage, hb-webparts, hb-publisher, and hb-shell-extension.
- Root `package.json` exists and contains monorepo scripts, but no observable Foleon package script or explicit Foleon reference was found in the fetched file.
- `pnpm-workspace.yaml` includes `apps/*`, which would include a Foleon app if the directory existed; the direct expected app path did not exist on `main`.

Conclusion from repo truth: the implementation described in the commit summary is not present or not discoverable on the inspected `main` branch. Therefore, the production-readiness answer is not “credible MVP but needs tightening”; it is “not releasable from main because the claimed app cannot be verified.”

## What Is Strong

The implementation narrative in the commit summary describes several sound target-state concepts:

- No iframe rendering on the homepage/highlights surface.
- Exact-origin iframe policy and no wildcard origins.
- Explicit Reader gates before embedding.
- List-by-GUID access rather than title binding.
- No Foleon API secrets in SPFx.
- A future backend telemetry endpoint instead of long-term client-only telemetry.
- A runtime binding proof concept.

These are directionally correct, but they are not confirmed implementation facts in `main`.

## Production Blockers

1. **Implementation absent from repo truth.** The app path, manifest path, code-search hits, and claimed commit could not be verified.
2. **No package registration evidence.** The inspected packaging domain registry does not include a Foleon domain.
3. **No inspectable SharePoint list schema.** The claimed lists and indexes are not proven.
4. **No inspectable Reader/origin policy implementation.** The highest-risk iframe behavior cannot be verified.
5. **No deployable artifact proof.** The Vite IIFE, manifest ID, package version, and global binding are not proven.

## Production Readiness Answer

- Current production readiness: **No**.
- Credible MVP status from repo truth: **No, not until the app exists on `main` and package seams prove it.**
- Likely architectural direction: **Reasonable, if implemented as claimed and hardened with schema, route, iframe, telemetry, and release gates.**
- Immediate action: **Resolve source-of-truth drift before any deeper code-level audit.**

## Research Sources Used

- Foleon API authentication: https://developers.foleon.com/apis/authentication/obtainoauthtoken
- Foleon Docs API: https://developers.foleon.com/apis/docs/getdocbyid
- Foleon Analytics API: https://developers.foleon.com/apis/foleon-analytics
- Microsoft Support — SharePoint HTML Field Security / iframe domain controls: https://support.microsoft.com/en-us/office/allow-or-restrict-the-ability-to-embed-content-on-sharepoint-pages-e7baf83f-09d0-4bd1-9058-4aa483ee137b
- Microsoft Learn — SPFx client-side web parts: https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/overview-client-side-web-parts
- Microsoft Learn — SPFx isolated web parts retirement: https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/isolated-web-parts-retirement
- Microsoft Learn — Optimize iFrames in SharePoint: https://learn.microsoft.com/en-us/microsoft-365/enterprise/modern-iframe-optimization
- MDN — window.postMessage: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
- MDN — iframe element and referrer policy: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe
- MDN — CSP frame-ancestors: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors
- OWASP XSS Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- W3C/WAI WCAG Technique H64: https://www.w3.org/WAI/WCAG21/Techniques/html/H64
