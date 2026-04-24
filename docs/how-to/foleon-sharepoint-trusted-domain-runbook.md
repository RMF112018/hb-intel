# Foleon Reader — SharePoint trusted-domain & frame-ancestors runbook

How to make Foleon publications render inside the HB Intel Foleon Reader web part on SharePoint Online, and how to verify the trust path end-to-end before claiming "Reader works."

## Audience

- SharePoint tenant administrators (Microsoft 365 Global / SharePoint admin role).
- Foleon account administrators with publishing-domain access.
- HB Intel platform engineers debugging Reader-load failures.

## What needs to be true for the Reader to work

Three independent allowlists must all permit the embed:

1. **HB Intel app allowlist** — the Foleon viewer origin must appear in
   `acceptedFoleonOrigins` on the Foleon web part configuration. Default:
   `https://viewer.us.foleon.com`. Custom Foleon publishing subdomains (for
   example `https://stories.hedrickbrothers.com`) must be added explicitly. The
   app rejects wildcards and rejects `http:` schemes by default.
2. **SharePoint HTML Field Security** — the tenant must allow the Foleon
   viewer domain (and any custom publishing domain) to be embedded inside
   SharePoint pages. Without this, SharePoint silently strips or refuses the
   iframe.
3. **Foleon publisher response headers** — the Foleon viewer (or custom
   domain) must not return `X-Frame-Options: DENY/SAMEORIGIN` and its
   `Content-Security-Policy: frame-ancestors` must include the SharePoint
   tenant origin (`https://<tenant>.sharepoint.com`).

If any of the three is missing, Reader will appear blank, throw a console CSP
error, or fall back to the gate-blocked state.

## Step 1 — Verify the HB Intel allowlist

In the SharePoint page where the Foleon web part is configured, open the
property pane and confirm:

- `acceptedFoleonOrigins` contains every Foleon origin you intend to embed,
  one entry per line, scheme-included, exact origin only:
  - `https://viewer.us.foleon.com`
  - `https://stories.hedrickbrothers.com` (example custom domain)
- `allowPreview` is **false** for production. Set to `true` only on
  admin-review pages where preview/draft URLs need to render.

The runtime contract publishes a fingerprint of the configured origin set to
`window.__hbIntel_foleonRuntimeBindingProof.fingerprints.originAllowlistSha`.
A non-empty SHA confirms the allowlist was applied; a SHA of zero entries means
the property pane value did not normalize (most often a wildcard, a non-https
scheme, or a malformed URL).

## Step 2 — Configure SharePoint HTML Field Security

SharePoint HTML Field Security is the tenant-level allowlist of domains that
SharePoint pages may embed via `<iframe>`.

1. Sign in to the [Microsoft 365 admin center](https://admin.microsoft.com)
   with a Global or SharePoint Administrator role.
2. Open **Show all → Admin centers → SharePoint**.
3. In the SharePoint admin center go to **Policies → Sharing** (or **Settings**
   in legacy tenants), then **Site collection features / HTML Field Security**.
   On modern tenants, HTML Field Security is configured per site collection in
   **Site Settings → HTML Field Security** under the Site Collection
   Administration section.
4. Add each Foleon publishing origin you intend to embed:
   - `viewer.us.foleon.com`
   - any custom domain (for example `stories.hedrickbrothers.com`)
5. Save.

Reference: Microsoft Learn — **Allow or restrict the ability to embed content
on SharePoint pages**
(<https://support.microsoft.com/en-us/office/allow-or-restrict-the-ability-to-embed-content-on-sharepoint-pages-e7baf83f-09d0-4bd1-9058-4aa483ee137b>).

## Step 3 — Verify Foleon publisher CSP / X-Frame-Options

SharePoint can host the iframe, but the embedded page itself must permit the
SharePoint origin as a frame ancestor. Verify with browser DevTools:

1. Open a Foleon publication URL (for example
   `https://viewer.us.foleon.com/published/<docId>/`) in a new tab.
2. Open DevTools → **Network** → reload.
3. Click the top-level document request and inspect **Response Headers**:
   - `Content-Security-Policy` should contain a `frame-ancestors` directive
     that lists the SharePoint origin pattern, for example:
     `frame-ancestors 'self' https://*.sharepoint.com`
   - `X-Frame-Options` should be **absent** or set to `ALLOWALL` (note
     `X-Frame-Options` is overridden by `frame-ancestors` when both are
     present; modern browsers honor `frame-ancestors`).
4. If the publication uses a Foleon custom domain, repeat the check at the
   custom-domain URL — the response headers may differ from `viewer.us.foleon.com`.

Reference: MDN — **CSP `frame-ancestors`**
(<https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors>).

If `frame-ancestors` does not include the tenant SharePoint origin, ask the
Foleon administrator to update the project-level publishing settings (Foleon
Project → Settings → Embedding) to add the SharePoint tenant origin to the
allowed embedding domains. Coordinate with Foleon support if the option is
not exposed in the project UI.

## Step 4 — End-to-end verification on the SharePoint page

On a SharePoint page that hosts the Foleon Reader web part with a published,
embed-allowed content registry record:

1. Hard-reload the page (Ctrl+Shift+R / Cmd+Shift+R).
2. Open DevTools → **Console**. Filter for `CSP` and `Refused to frame`.
   - No CSP errors → trust path is good.
   - A `Refused to frame ... because an ancestor violates the following
     Content Security Policy directive: frame-ancestors ...` error → Step 3
     allowlist is missing the tenant origin.
   - A `Blocked autofocus on a <iframe>` style warning is unrelated and can
     be ignored.
3. Confirm the iframe rendered with the hardened attributes:

   ```js
   const f = document.querySelector('iframe[title]');
   ({
     sandbox: f.getAttribute('sandbox'),
     allow: f.getAttribute('allow'),
     referrerPolicy: f.getAttribute('referrerpolicy'),
     loading: f.getAttribute('loading'),
   });
   ```

   Expected values:
   - `sandbox` includes at minimum `allow-scripts`, `allow-same-origin`,
     `allow-popups`, `allow-popups-to-escape-sandbox`, `allow-forms`,
     `allow-top-navigation-by-user-activation`.
   - `allow` is `fullscreen; clipboard-write`.
   - `referrerpolicy` is `strict-origin-when-cross-origin`.
   - `loading` is `lazy`.

4. Scroll the publication and confirm the iframe height adjusts smoothly.
   The Foleon viewer posts `set-height` messages; the Reader honors values
   between 600px and 50000px, ignores anything else, and ignores any message
   whose `event.source` is not the iframe's own `contentWindow`.

## Failure-mode triage

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Reader card flashes then renders empty white box | Foleon CSP `frame-ancestors` missing the SharePoint tenant origin | Step 3 — update Foleon project embedding allowlist |
| Reader shows "Unable to load this publication" | Allowlist mismatch in HB Intel `acceptedFoleonOrigins`, or content record `AllowEmbed` is false | Step 1 — re-check property pane value; verify content registry record |
| Reader shows blocked-state copy ("Open in new tab") | Gate predicate failed: `IsVisible=false`, `PublishStatus≠Published`, display window expired, preview URL with `allowPreview=false`, or `RequiresExternalOpen=true` | Inspect content registry row; correct field values |
| Console: `Refused to frame ...` | SharePoint HTML Field Security missing the Foleon origin | Step 2 — add origin to tenant allowlist |
| Console: `Mixed Content: ... was loaded over HTTPS, but requested an insecure resource ...` | Content registry has an `http://` URL | Update record to https URL; Reader rejects http under default policy |
| Iframe never resizes — stuck at 600px | Foleon viewer is on a different origin than the configured allowlist, or postMessage shape changed publisher-side | Step 1 origin verification, then check publisher viewer console for postMessage debugging |
| Iframe scrolls to top on every page change | Expected — `page-change` events trigger `scrollIntoView`. If undesired, request a Foleon viewer setting change or filter the event in the web part configuration |

## References

- MDN — Window: `postMessage()` event:
  <https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage>
- MDN — `<iframe>` `sandbox` attribute:
  <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#sandbox>
- MDN — Permissions Policy (`allow` attribute):
  <https://developer.mozilla.org/en-US/docs/Web/HTTP/Permissions_Policy>
- MDN — `Referrer-Policy`:
  <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy>
- W3C WAI — accessible iframe technique (H64):
  <https://www.w3.org/TR/WCAG20-TECHS/H64.html>
- Microsoft Learn — SharePoint HTML Field Security:
  <https://support.microsoft.com/en-us/office/allow-or-restrict-the-ability-to-embed-content-on-sharepoint-pages-e7baf83f-09d0-4bd1-9058-4aa483ee137b>
- HB Intel — Foleon audit report:
  `docs/architecture/plans/MASTER/spfx/foleon/phase-01/audit-reports/04-Reader-Iframe-Origin-Policy-Assessment.md`
- HB Intel — Foleon Reader gate code:
  `apps/hb-intel-foleon/src/services/FoleonReaderGate.ts`,
  `apps/hb-intel-foleon/src/services/FoleonOriginPolicy.ts`,
  `apps/hb-intel-foleon/src/components/FoleonIframeHost.tsx`
