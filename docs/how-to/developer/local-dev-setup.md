# How to Set Up Local Development for Phase 6

**Traceability:** D-PH6-16

## Prerequisites
- Node.js 20 LTS installed
- pnpm 9+ installed (`npm install -g pnpm`)
- [Azure Functions Core Tools v4](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local) installed
- [Azurite](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite) installed (`npm install -g azurite`)
- Access to the HB Construction SharePoint tenant (for real-mode testing only)

## Step 1 — Clone and install
```bash
git clone https://github.com/hbconstruction/hb-intel.git
cd hb-intel
pnpm install
```

## Step 2 — Configure local settings
```bash
cp backend/functions/local.settings.example.json backend/functions/local.settings.json
```
Edit `local.settings.json` and fill in your Entra ID credentials. Leave `HBC_ADAPTER_MODE=mock` for day-to-day development.

## Step 3 — Start Azurite
```bash
azurite --location ~/.azurite
```
Leave this terminal open. Azurite emulates Azure Table Storage and Blob Storage locally.

## Step 4 — Start the Functions host
```bash
cd backend/functions
pnpm start
```
The Functions host starts on `http://localhost:7071`.

## Step 5 — Run unit tests
```bash
pnpm turbo run test --filter=backend-functions --filter=@hbc/provisioning
```

## Test Governance

The monorepo enforces test governance for five P1 (platform-critical) packages via the root `vitest.workspace.ts`.

**P1 packages:** `@hbc/auth`, `@hbc/shell`, `@hbc/sharepoint-docs`, `@hbc/bic-next-move`, `@hbc/complexity`

**Key conventions:**
- Each P1 package has its own `vitest.config.ts` with environment and coverage thresholds.
- Coverage thresholds: lines 95, functions 95, branches 90–95, statements 95.
- CI runs a dedicated `unit-tests-p1` job for these packages (no Azurite needed).

**Run P1 tests locally:**
```bash
pnpm test --filter @hbc/auth
pnpm test --filter @hbc/shell
pnpm test --filter @hbc/sharepoint-docs
pnpm test --filter @hbc/bic-next-move
pnpm test --filter @hbc/complexity
```

For the full test matrix (environments, thresholds, alias requirements, CI jobs), see [`docs/reference/package-testing-matrix.md`](../../reference/package-testing-matrix.md).

---

## Switching to Real SharePoint (integration testing)
Set `HBC_ADAPTER_MODE=real` in `local.settings.json` and provide real Azure credentials for the test app registration (`AZURE_CLIENT_ID_TEST`, `AZURE_CLIENT_SECRET_TEST`). Tests will run against `https://hbconstruction.sharepoint.com/sites/hb-intel-test`.
