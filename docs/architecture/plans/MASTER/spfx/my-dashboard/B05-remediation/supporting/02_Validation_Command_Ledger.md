# Validation Command Ledger

Use the repo's actual scripts and update this ledger as commands run.

## Frontend My Dashboard

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
```

## Backend Functions

Run if any backend contract/test seam is touched:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

## Package Build

```bash
npx tsx tools/build-spfx-package.ts --domain my-dashboard
```

For production-package proof, use the operator-approved packaging environment containing at least:

```bash
BACKEND_MODE=production
FUNCTION_APP_URL=<approved_function_app_public_origin>
API_AUDIENCE=<approved_api_audience_uri>
```

Do not commit secrets. Do not invent production values.

## Artifact Inspection Requirements

After packaging:
- confirm the `.sppkg` version matches the intended source posture,
- confirm package manifest requests the expected delegated API permission,
- confirm runtime JS/shell artifact includes non-empty backend-mode/config markers when intended for production,
- capture package-truth evidence in a dedicated repo artifact or closeout doc as required by current project conventions.
