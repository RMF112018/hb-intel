# 05 — B02 Targeted Web Verification Notes

## Objective

Record the narrow set of external platform facts that materially support B02’s deployment, SPFx auth, and Azure Functions security posture. These findings were checked against current Microsoft Learn material on 2026-05-12 and should be treated as verification notes, not as a substitute for the repo-truth audit.

---

## W1 — Full-width SPFx web parts on communication sites

**Verified platform fact:** modern SharePoint communication sites support a full-width column layout, and SPFx web parts must explicitly set:

```json
"supportsFullBleed": true
```

to be placeable there. Microsoft also states that the SharePoint workbench does not support testing the full-width column layout; deployment to a communication site is required for host-accurate validation.

**B02 consequence:** the My Dashboard manifest must set `supportsFullBleed: true`, and later hosted validation cannot be replaced by workbench-only confidence.

---

## W2 — API access approval for SPFx solutions

**Verified platform fact:** SPFx solutions that call Microsoft Entra ID-secured APIs declare required permissions in the package solution, and administrators manage those requests from the SharePoint admin center API access page.

**B02 consequence:** My Dashboard `package-solution.json` must declare the enterprise API permission request, and deployment documentation must assume admin approval is a prerequisite to live protected-route validation.

---

## W3 — SPFx should use framework-mediated token acquisition

**Verified platform fact:** Microsoft’s SPFx guidance uses framework token plumbing (`AadHttpClient` / `AadHttpClientFactory`) for Entra-secured API access rather than application authors implementing OAuth flow mechanics directly in the web part.

**B02 consequence:** the repo’s `createSpfxApiTokenProvider(...)` abstraction remains the correct local implementation seam because it uses SPFx’s token provider machinery while preserving the HB Intel backend-client architecture.

---

## W4 — Enterprise API package permission request examples remain current

**Verified platform fact:** Microsoft’s enterprise API SPFx tutorial still demonstrates adding a `webApiPermissionRequests` array to `package-solution.json`, using a resource name and delegated scope, followed by SharePoint admin API access approval.

**B02 consequence:** the B02 package/auth contract remains directionally aligned with current SPFx platform documentation.

---

## W5 — Azure Functions access keys are not a public-client auth substitute

**Verified platform fact:** Microsoft warns that distributing shared function-access keys in public apps is poor practice; stronger production security should use positive authentication such as Entra/App Service Authentication, APIM, network controls, or equivalent architecture.

**B02 consequence:** My Dashboard must not receive function keys, Adobe secrets, or similar credentials through runtime config or property pane.

---

## W6 — Azure Functions CORS should be restricted

**Verified platform fact:** Microsoft recommends restricting CORS to known origins rather than using wildcards.

**B02 consequence:** when the My Dashboard backend host becomes live in a later batch, deployment guidance should explicitly allow the SharePoint tenant/site origin as required and avoid permissive wildcard CORS.

---

## External source list used for these notes

- Microsoft Learn — *Use web parts with the full-width column*.
- Microsoft Learn — *Manage access to Microsoft Entra ID-secured APIs*.
- Microsoft Learn — *Connect to Entra ID-secured APIs in SharePoint Framework solutions*.
- Microsoft Learn — *Consume enterprise APIs secured with Azure AD in SharePoint Framework*.
- Microsoft Learn — *Securing Azure Functions*.
- Microsoft Learn — *Work with access keys in Azure Functions*.
