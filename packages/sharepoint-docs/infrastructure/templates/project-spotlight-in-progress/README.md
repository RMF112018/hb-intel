# Project Spotlight In-Progress Page Template

This folder contains a reusable, page-scoped PnP provisioning artifact extracted from:

- `/sites/ProjectSpotlight/SitePages/Templates/Project-Spotlight---In-Progress.aspx`

## Files

- `Project-Spotlight-In-Progress.page-template.xml`  
  Single-page PnP provisioning template exported with `Export-PnPPage`.
- `bindings-report.md`  
  Extracted reference inventory for remaining environment-specific bindings.

## What Was Extracted

- Page metadata (`PageName`, title, comments/news/template flags)
- Title area/header configuration
- Section and column layout structure
- Canvas controls/webparts and their JSON payload
- Text/image content embedded in control properties

## What Was Intentionally Excluded

- Other site pages
- List/library schema provisioning
- Navigation/security/site-scoped artifacts
- Unrelated site configuration

## Reuse / Apply

1. Connect to target site:

```powershell
Connect-PnPOnline -Url "https://<tenant>.sharepoint.com/sites/<target-site>" -ClientId "<app-id>" -Tenant "<tenant-id>" -DeviceLogin
```

2. Apply template:

```powershell
Invoke-PnPSiteTemplate -Path "./Project-Spotlight-In-Progress.page-template.xml"
```

## Notes and Limitations

- The artifact is page-scoped and intended as a repeatable starting page shell.
- Custom/SPFx webparts are preserved by component IDs and control JSON; those components must be available in the target environment.
- Some bindings can remain environment-specific (e.g., URLs, IDs). Review `bindings-report.md` before reusing across tenants/sites.
- Deterministic absolute source-site URLs were tokenized to `${site}` where safe in template text.
