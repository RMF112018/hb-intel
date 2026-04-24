# 04 — Reader / iframe / Origin Policy Assessment

## Current Status

The Reader route, `FoleonOriginPolicy`, `FoleonReaderGate`, iframe component, and `postMessage` listener implementation were not found on `main`. Therefore, the claimed hard gates cannot be certified.

## Required Reader Gate Predicates

The Reader must reject before iframe render unless all of these pass:

- content item exists by stable ID
- `IsVisible = true`
- `PublishStatus = Published`
- display window is active
- `AllowEmbed = true`
- `RequiresExternalOpen = false`
- published/embed URL exists
- URL parses successfully
- scheme is HTTPS
- exact origin is in configured allowlist
- preview URL is rejected unless explicit admin/test `allowPreview` mode is active
- SharePoint HTML Field Security allows the same origin
- Foleon/custom-domain response headers allow SharePoint as an iframe ancestor

## Typed Failure Reasons

Required typed gate failures:

- `CONTENT_NOT_FOUND`
- `CONTENT_NOT_VISIBLE`
- `CONTENT_NOT_PUBLISHED`
- `CONTENT_NOT_IN_DISPLAY_WINDOW`
- `EMBED_NOT_ALLOWED`
- `EXTERNAL_OPEN_REQUIRED`
- `URL_MISSING`
- `URL_INVALID`
- `URL_NOT_HTTPS`
- `ORIGIN_NOT_ALLOWED`
- `PREVIEW_NOT_ALLOWED`
- `SHAREPOINT_DOMAIN_NOT_TRUSTED`
- `FOLEON_FRAME_ANCESTOR_BLOCKED`
- `CONFIG_MISSING`

Each should map to both user-facing and admin-facing messages. User copy should be safe and non-technical; admin diagnostics should include correlation IDs and configuration fingerprints.

## postMessage Requirements

- Listen only while the iframe is mounted.
- Remove listener on unmount or URL/content change.
- Check `event.origin` against the exact allowed origin for the current iframe URL.
- Check that `event.source` is the iframe content window where possible.
- Parse only expected message formats.
- Reject unknown event names.
- Accept height only when numeric and within explicit min/max bounds.
- Avoid continuous layout thrash from frequent height updates.
- Ignore malformed JSON/string payloads safely.
- Never trust page-change, route, or URL messages for navigation without validation.

## iframe Attributes

Recommended baseline:

- descriptive `title`
- `loading="lazy"` where compatible with UX
- explicit `referrerPolicy`, likely `strict-origin-when-cross-origin` or stricter depending business need
- sandbox only if Foleon functionality can operate with a tested minimal capability set
- no broad `allow` permissions unless explicitly required
- no iframe on the homepage/highlights surface

## SharePoint Trusted-Domain Implications

The app allowlist is not enough. SharePoint site collection HTML Field Security must also allow the Foleon/custom domain. Microsoft warns against allowing iframes from any domain for security reasons, so the tenant posture should be specific-domain allowlisting, not wildcard or “any domain.”

## Browser Security Implications

CSP `frame-ancestors` is controlled by the embedded Foleon/custom-domain page. If Foleon or a custom domain sends a `frame-ancestors` policy that excludes SharePoint, the iframe will not load even if HB Central allows the origin.

## Decision

Reader/origin/embed policy is **production-blocking** until implemented and proven with unit tests, browser tests, SharePoint-hosted tests, malformed-message tests, and tenant trusted-domain proof.

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
