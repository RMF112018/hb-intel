# hb-webparts LoaderConfig Emission Verification

## Verification Matrix

| Webpart title | Manifest/component ID | Packaged `entryModuleId` | Packaged `scriptResources` module key(s) | Referenced runtime asset(s) | Actual compiled module identity in asset(s) | Contract match |
| --- | --- | --- | --- | --- | --- | --- |
| Company Pulse | `0b53f651-fd92-4f7f-a9da-f7797017f5eb` | `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0` | `@microsoft/sp-loader`, `@microsoft/sp-webpart-base`, `9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0`, `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0` | `ClientSideAssets/shell-entry-0b53f651-fd92-4f7f-a9da-f7797017f5eb.js`, `ClientSideAssets/shell-web-part_33c64341ed81ee506c2a.js` | shim `define("0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0", ["9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0"], ...)` + base `define("9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0", ...)` | Yes |
| HB Hero Banner | `39762a4d-c7fd-44a6-a11e-4f8de9f5778d` | `39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0` | `@microsoft/sp-loader`, `@microsoft/sp-webpart-base`, `9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0`, `39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0` | `ClientSideAssets/shell-entry-39762a4d-c7fd-44a6-a11e-4f8de9f5778d.js`, `ClientSideAssets/shell-web-part_33c64341ed81ee506c2a.js` | shim `define("39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0", ["9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0"], ...)` + base `define("9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0", ...)` | Yes |
| Project / Portfolio Spotlight | `8370ab0c-b6df-4db0-82f1-24b54750f508` | `8370ab0c-b6df-4db0-82f1-24b54750f508_1.0.0` | `@microsoft/sp-loader`, `@microsoft/sp-webpart-base`, `9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0`, `8370ab0c-b6df-4db0-82f1-24b54750f508_1.0.0` | `ClientSideAssets/shell-entry-8370ab0c-b6df-4db0-82f1-24b54750f508.js`, `ClientSideAssets/shell-web-part_33c64341ed81ee506c2a.js` | shim `define("8370ab0c-b6df-4db0-82f1-24b54750f508_1.0.0", ["9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0"], ...)` + base `define("9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0", ...)` | Yes |
| Priority Actions Rail | `b3f07190-79cf-437d-a1d6-ecbf3f77e616` | `b3f07190-79cf-437d-a1d6-ecbf3f77e616_1.0.0` | `@microsoft/sp-loader`, `@microsoft/sp-webpart-base`, `9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0`, `b3f07190-79cf-437d-a1d6-ecbf3f77e616_1.0.0` | `ClientSideAssets/shell-entry-b3f07190-79cf-437d-a1d6-ecbf3f77e616.js`, `ClientSideAssets/shell-web-part_33c64341ed81ee506c2a.js` | shim `define("b3f07190-79cf-437d-a1d6-ecbf3f77e616_1.0.0", ["9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0"], ...)` + base `define("9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0", ...)` | Yes |

## Assertions

- Packaged shared shell AMD module identity is neutral and stable for this remediation:
  - `9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0`
- No representative packaged webpart manifest uses another webpart component ID as shared base shell dependency.
- Each `entryModuleId` has a corresponding `scriptResources` module key with a packaged JS asset that defines that same module identity.
- Toolbox registrations remain separate for intended homepage webparts.
- Prior first-webpart-ID base dependency pattern is eliminated.

## Package inventory checks

- Artifact inspected: `dist/sppkg/hb-webparts.sppkg`
- Packaged runtime assets include:
  - `ClientSideAssets/shell-web-part_33c64341ed81ee506c2a.js`
  - `ClientSideAssets/shell-entry-*.js` (10 per-webpart shim assets)
  - `ClientSideAssets/hb-webparts-app-ab43ba83.js`

## Runtime evidence note

- Tenant page runtime validation was not executed in this local environment.
- Residual validation step for release handoff: upload `hb-webparts.sppkg` and render representative non-base webparts to confirm absence of `Could not load <id>_1.0.0 in require` at runtime.

## Secondary warning status

`The children of a Card component should be of type CardItem or CardSection.` remains a separate follow-up and is not the primary loader contract blocker for this remediation.
