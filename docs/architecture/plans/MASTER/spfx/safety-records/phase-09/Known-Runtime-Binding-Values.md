# Known Runtime Binding Values

## Values recovered from supplied artifacts

### Backend Function App URL

```text
https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
```

Use this for `functionAppUrl`.

### Accepted Backend Origin

```text
https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
```

Use this for `acceptedBackendOrigin`.

### API Audience

```text
api://08c399eb-a394-4087-b859-659d493f8dc7
```

This comes from the Entra application manifest `identifierUris`.

### Delegated API Scope

```text
access_as_user
```

The app registration exposes this delegated scope.

### Safety Role Claim Values

```text
HBIntelSafetyOperator
HBIntelSafetySubmitter
HBIntelSafetyReviewer
```

These are the canonical Safety-specific delegated role values to enforce and validate in token claims.

### Expected Safety Webpart Manifest ID

```text
ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e
```

### Expected Package Version

```text
1.2.36.0
```

Treat `1.2.36.0` as current package truth unless repo truth has advanced on `main`.

### Expected Hosted GUID Overlay Fingerprint

```text
fnv1a32:36b2f764
```

This is derived from the hard-coded hosted Safety SharePoint list/library GUID overlay.

## Values not provided by the artifacts

- SharePoint page instance webpart properties.
- App Catalog package version currently deployed to the tenant.
- Whether the page contains the dedicated Safety webpart, generic shell webpart, or stale webpart instance.
- Whether SharePoint Admin API access requests have been approved.
- Whether the current signed-in user receives one or more Safety role claims in the backend token.
