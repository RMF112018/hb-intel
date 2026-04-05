# hb-webparts LoaderConfig Emission Verification

## Verification Matrix

| Webpart title | Manifest/component ID | Packaged `entryModuleId` | Packaged `scriptResources` module key(s) | Referenced runtime asset(s) | Actual compiled module identity in asset(s) | Contract match |
| --- | --- | --- | --- | --- | --- | --- |
| Company Pulse | `0b53f651-fd92-4f7f-a9da-f7797017f5eb` | `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0` | `@microsoft/sp-loader`, `@microsoft/sp-webpart-base`, `9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0`, `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0` | `ClientSideAssets/shell-entry-0b53f651-fd92-4f7f-a9da-f7797017f5eb-<hash>.js`, `ClientSideAssets/shell-web-part_<hash>.js` | shim `define("0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0", ["9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0"], ...)` + base `define("9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0", ...)` | Yes |
| HB Hero Banner | `39762a4d-c7fd-44a6-a11e-4f8de9f5778d` | `39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0` | `@microsoft/sp-loader`, `@microsoft/sp-webpart-base`, `9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0`, `39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0` | `ClientSideAssets/shell-entry-39762a4d-c7fd-44a6-a11e-4f8de9f5778d-<hash>.js`, `ClientSideAssets/shell-web-part_<hash>.js` | shim `define("39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0", ["9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0"], ...)` + base `define("9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0", ...)` | Yes |
| Project / Portfolio Spotlight | `8370ab0c-b6df-4db0-82f1-24b54750f508` | `8370ab0c-b6df-4db0-82f1-24b54750f508_1.0.0` | `@microsoft/sp-loader`, `@microsoft/sp-webpart-base`, `9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0`, `8370ab0c-b6df-4db0-82f1-24b54750f508_1.0.0` | `ClientSideAssets/shell-entry-8370ab0c-b6df-4db0-82f1-24b54750f508-<hash>.js`, `ClientSideAssets/shell-web-part_<hash>.js` | shim `define("8370ab0c-b6df-4db0-82f1-24b54750f508_1.0.0", ["9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0"], ...)` + base `define("9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0", ...)` | Yes |
| Priority Actions Rail | `b3f07190-79cf-437d-a1d6-ecbf3f77e616` | `b3f07190-79cf-437d-a1d6-ecbf3f77e616_1.0.0` | `@microsoft/sp-loader`, `@microsoft/sp-webpart-base`, `9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0`, `b3f07190-79cf-437d-a1d6-ecbf3f77e616_1.0.0` | `ClientSideAssets/shell-entry-b3f07190-79cf-437d-a1d6-ecbf3f77e616-<hash>.js`, `ClientSideAssets/shell-web-part_<hash>.js` | shim `define("b3f07190-79cf-437d-a1d6-ecbf3f77e616_1.0.0", ["9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0"], ...)` + base `define("9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0", ...)` | Yes |

## Assertions

- Packaged shared shell AMD module identity is neutral and stable for this remediation:
  - `9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0`
- Packaged webpart manifests map `scriptResources[entryModuleId]` to versioned shim filenames (`shell-entry-<webpart-id>-<hash>.js`).
- No packaged manifest references a legacy non-versioned shim filename (`shell-entry-<webpart-id>.js`).
- Each `entryModuleId` has a corresponding packaged shim asset with matching AMD `define(...)` and neutral-base dependency.
- Toolbox registrations remain separate for intended homepage webparts.

## Package inventory checks

- Artifact inspected: `dist/sppkg/hb-webparts.sppkg`
- Packaged runtime assets include:
  - `ClientSideAssets/shell-web-part_<hash>.js`
  - `ClientSideAssets/shell-entry-<webpart-id>-<hash>.js` (10 per-webpart shim assets)
  - `ClientSideAssets/hb-webparts-app-<hash>.js`
- Machine-readable proof artifact:
  - `dist/sppkg/hb-webparts-shim-proof.json`

## Live deployment verification (operator)

1. Upload and deploy `hb-webparts.sppkg`, then open a page containing **HB Hero Banner**.
2. In DevTools Network, search for `shell-entry-39762a4d` and confirm hashed filename suffix is present.
3. Open the live shim response and confirm:
   - `define("39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0"`
   - dependency array includes `"9a2f7f61-6f4d-4fdb-8f54-9a857f8b3d4e_1.0.0"`
4. Confirm console does not emit `Could not load 39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0 in require`.
5. If failure persists, classify source:
   - stale asset state: network filename differs from package proof (`hb-webparts-shim-proof.json`)
   - code defect: network filename matches package proof but loader failure persists

## Runtime evidence note

- Tenant page runtime validation was not executed in this local environment.
- Residual release step: perform the operator checklist above in target tenant after App Catalog deployment.

## Secondary warning status

`The children of a Card component should be of type CardItem or CardSection.` remains a separate follow-up and is not the primary loader contract blocker for this remediation.
