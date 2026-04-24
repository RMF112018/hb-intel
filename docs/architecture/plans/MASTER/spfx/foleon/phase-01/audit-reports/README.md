# HB Intel Foleon SharePoint Integration Audit Package

Generated: 2026-04-24T16:03:01

## Audit Position

This package executes the uploaded audit objective against the accessible repository truth and current external guidance. The central result is a repo-truth failure: the claimed Foleon implementation could not be found on `main`.

## Package Files

- `00-Foleon-App-Audit-Summary.md`
- `01-Foleon-App-Implementation-Map.md`
- `02-Research-Backed-Assessment.md`
- `03-SharePoint-List-And-Data-Contract-Assessment.md`
- `04-Reader-Iframe-Origin-Policy-Assessment.md`
- `05-Runtime-Binding-Packaging-Deployment-Proof-Assessment.md`
- `06-Telemetry-Observability-Supportability-Assessment.md`
- `07-Deferred-Work-Production-Impact.md`
- `08-Production-Readiness-Gap-Register.md`
- `09-Prioritized-Remediation-Plan.md`
- `10-Recommended-Execution-Waves.md`

## How to Use This Package

1. Treat `08-Production-Readiness-Gap-Register.md` as the controlling issue list.
2. Execute the Wave 01 implementation prompt package first; it resolves source-of-truth and package scaffolding blockers.
3. Execute Wave 02 only after Wave 01 can prove repo truth, build truth, package truth, and runtime config truth.

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
