# Prompt 06 — Secret Hygiene and Consent Proof

You are working in the live `hb-intel` repository and Microsoft tenant administration surfaces.

## Objective

Ensure the publish settings artifact and Entra/API permissions are handled safely and verify that the Safety frontend can acquire a delegated token for the HB Intel backend API.

## Sensitive Artifact Rule

The Function App publish settings file contains deployment credentials. It must not be committed, pasted into prompts, uploaded into GitHub, stored in docs, or included in artifacts. Only the following non-secret values may be referenced:

```text
functionAppUrl = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
acceptedBackendOrigin = https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net
```

## Entra/API Values to Verify

From the Entra app manifest:

```text
Application ID URI / apiAudience = api://08c399eb-a394-4087-b859-659d493f8dc7
Delegated scope = access_as_user
Safety roles = HBIntelSafetyOperator, HBIntelSafetySubmitter, HBIntelSafetyReviewer
```

## Required Verification

1. Confirm the repo does not contain publish settings or deployment credentials:

```bash
git status --short
git ls-files | grep -Ei "publishsettings|publish-settings|\.PublishSettings|secret|credential"
git grep -n "userPWD\|publishProfile\|hb-intel-function-app.*scm.azurewebsites.net" -- .
```

2. Confirm SPFx package requests the backend API delegated permission:

- Inspect `apps/safety/config/package-solution.json`.
- Confirm `webApiPermissionRequests` includes:
  - resource: `hb-intel-api-production`
  - scope: `access_as_user`

3. Confirm tenant/admin consent:

- SharePoint Admin Center → Advanced → API access.
- Entra Admin Center → Enterprise Applications → relevant service principal → Permissions.
- Verify the backend API delegated scope has admin consent.

4. Confirm user role claims:

- Signed-in test user should receive at least one relevant Safety role claim where required:
  - `HBIntelSafetyOperator`
  - `HBIntelSafetySubmitter`
  - `HBIntelSafetyReviewer`

## Required Proof of Closure

Provide:

- Screenshot or exported evidence of API permission approval.
- Screenshot or exported evidence of relevant app role assignment.
- Browser/runtime proof that token acquisition succeeds for:
  - `api://08c399eb-a394-4087-b859-659d493f8dc7`
- Backend smoke proof that a non-destructive endpoint behaves as expected with the delegated token.

## Constraints

- Do not rotate or delete credentials without explicit approval.
- If the publish settings file was exposed outside controlled troubleshooting, recommend regeneration/rotation.
- Do not include actual token values in reports.
- Do not include secrets in screenshots.
