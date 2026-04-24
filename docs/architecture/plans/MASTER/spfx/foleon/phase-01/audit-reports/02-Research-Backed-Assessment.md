# 02 — Research-Backed Production-Readiness Assessment

## Governing Guidance Summary

### Foleon API / Backend Boundary

Foleon’s API uses OAuth client credentials with a `client_id` API key and `client_secret` API secret. This confirms that Foleon API sync/auth must run server-side or in a trusted backend; SPFx must not receive or bundle those secrets.

Foleon exposes Docs APIs for retrieving Docs and fields such as `status` and `is_visible`. The target app’s Reader gate should therefore treat published/visible/embed-safe status as a governed data contract, not as informal UI state.

Foleon’s Analytics API supports query dimensions, measures, filters, and date ranges, and its docs note performance guidance around filtering by account/workspace. This supports a backend sync/snapshot design rather than ad hoc client-only analytics from SharePoint pages.

### SharePoint / SPFx Host Guidance

Microsoft describes SPFx client-side web parts as browser-executed controls deployed to SharePoint pages. That means this app must assume tenant-hosted browser execution, SharePoint page lifecycle constraints, and no trusted secret storage inside the bundle.

Microsoft’s HTML Field Security guidance allows site collection admins to control external iframe domains and explicitly warns against allowing iframes from any domain for security reasons. Foleon Reader allowlists must therefore align with SharePoint site-level iframe domain policy, not only in-app URL checks.

Microsoft’s iframe performance guidance recommends using thumbnails/links where possible, minimizing iframe count, and keeping iframes out of viewport where practical. This strongly supports the claimed “no iframe on homepage highlights” rule.

Microsoft has retired SPFx domain isolated web parts for existing tenants as of April 2, 2026. A new Foleon package should not use domain-isolated SPFx as a security strategy.

### Browser / Security / Accessibility Guidance

MDN’s `postMessage` guidance confirms that cross-origin iframe communication is valid but must be origin-validated and shape-validated before use.

MDN’s `frame-ancestors` guidance makes clear that a leaf page’s CSP controls whether it can be embedded by parent frames. HB Central can allow a Foleon origin, but Foleon or custom-domain headers must also permit SharePoint as an ancestor.

MDN iframe guidance around referrer policy supports explicitly controlling iframe referrer leakage, especially when embedding third-party content from a SharePoint intranet.

W3C/WAI Technique H64 supports requiring a descriptive iframe `title` attribute so assistive technology users can identify the embedded content.

OWASP XSS guidance supports avoiding unsafe HTML injection and sanitizing any author-supplied rich text if the app ever renders Foleon metadata or custom summaries as HTML.

## Assessment Against Repo Truth

Because the implementation is absent from the inspected `main`, no code-level claim can be certified. The research-backed assessment therefore becomes a target-state readiness test:

| Area | Production Requirement | Current Status | Decision |
|---|---|---:|---|
| Foleon secrets | API key/secret only in backend | Not inspectable | Must prove before release |
| Foleon Docs sync | Server-side retrieval and normalization | Deferred / not inspectable | Production blocker if manual lists are broad rollout source |
| Foleon Analytics | Backend snapshot/sync model | Deferred / not inspectable | Wave-two or blocker depending metrics expectations |
| SPFx host | Non-isolated webpart, responsive, tenant-safe | Not inspectable | Must prove |
| SharePoint iframe domains | Site-level allowlist aligned with app allowlist | Not inspectable | Must prove before Reader release |
| Homepage performance | No iframe on highlights | Not inspectable | Must prove with tests/E2E |
| postMessage | Exact origin + shape + bounds + cleanup | Not inspectable | Must prove with unit + browser tests |
| Accessibility | iframe title, focus, loading/error states | Not inspectable | Must prove with UI tests/manual checklist |

## Preserve / Tighten / Redesign

- **Preserve:** the architectural principles in the implementation narrative: no SPFx secrets, exact-origin allowlist, no homepage iframe, list-by-GUID, typed Reader gates, backend-ready telemetry interface.
- **Tighten:** runtime config validation, SharePoint list schema/index proof, package-truth proof, route/deep-link semantics, and user/admin error messaging.
- **Redesign if currently absent:** backend sync/admin/data contracts must be designed as first-class seams, not afterthoughts. Manual list maintenance alone is not production-sufficient for broad HB Central rollout.

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
