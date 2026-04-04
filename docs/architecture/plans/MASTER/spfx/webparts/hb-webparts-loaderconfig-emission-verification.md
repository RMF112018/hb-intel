# hb-webparts LoaderConfig Emission Verification

## Verification Matrix

| Webpart title | Manifest/component ID | Packaged `entryModuleId` | Packaged `scriptResources` module key(s) | Referenced runtime asset(s) | Actual compiled module identity in asset(s) | Contract match |
| --- | --- | --- | --- | --- | --- | --- |
| Company Pulse | `0b53f651-fd92-4f7f-a9da-f7797017f5eb` | `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0` | `@microsoft/sp-loader`, `@microsoft/sp-webpart-base`, `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0` | `ClientSideAssets/shell-web-part_66a8874d87ce501231b6.js` | `define("0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0", ...)` | Yes |
| HB Hero Banner | `39762a4d-c7fd-44a6-a11e-4f8de9f5778d` | `39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0` | `@microsoft/sp-loader`, `@microsoft/sp-webpart-base`, `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0`, `39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0` | `ClientSideAssets/shell-entry-39762a4d-c7fd-44a6-a11e-4f8de9f5778d.js`, `ClientSideAssets/shell-web-part_66a8874d87ce501231b6.js` | `define("39762a4d-c7fd-44a6-a11e-4f8de9f5778d_1.0.0", ["0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0"], ...)` and base shell `define("0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0", ...)` | Yes |
| Project / Portfolio Spotlight | `8370ab0c-b6df-4db0-82f1-24b54750f508` | `8370ab0c-b6df-4db0-82f1-24b54750f508_1.0.0` | `@microsoft/sp-loader`, `@microsoft/sp-webpart-base`, `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0`, `8370ab0c-b6df-4db0-82f1-24b54750f508_1.0.0` | `ClientSideAssets/shell-entry-8370ab0c-b6df-4db0-82f1-24b54750f508.js`, `ClientSideAssets/shell-web-part_66a8874d87ce501231b6.js` | `define("8370ab0c-b6df-4db0-82f1-24b54750f508_1.0.0", ["0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0"], ...)` and base shell `define("0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0", ...)` | Yes |
| Priority Actions Rail | `b3f07190-79cf-437d-a1d6-ecbf3f77e616` | `b3f07190-79cf-437d-a1d6-ecbf3f77e616_1.0.0` | `@microsoft/sp-loader`, `@microsoft/sp-webpart-base`, `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0`, `b3f07190-79cf-437d-a1d6-ecbf3f77e616_1.0.0` | `ClientSideAssets/shell-entry-b3f07190-79cf-437d-a1d6-ecbf3f77e616.js`, `ClientSideAssets/shell-web-part_66a8874d87ce501231b6.js` | `define("b3f07190-79cf-437d-a1d6-ecbf3f77e616_1.0.0", ["0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0"], ...)` and base shell `define("0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0", ...)` | Yes |

## Old vs New Behavior Assertions

- Old package behavior reused `entryModuleId: 0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0` across unrelated webparts.
- New package behavior emits per-webpart `entryModuleId` values for unrelated webparts.
- Old package behavior exposed only the first-webpart runtime module key in `scriptResources` for representative unrelated webparts.
- New package behavior exposes per-webpart shim module keys + base shell module mapping in `scriptResources`.
- The incorrect reuse of `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0` as the requested runtime module for unrelated representative webparts is eliminated.

## Package inventory checks

- Artifact inspected: `dist/sppkg/hb-webparts.sppkg`
- Packaged runtime assets include:
  - `ClientSideAssets/shell-web-part_66a8874d87ce501231b6.js`
  - `ClientSideAssets/shell-entry-*.js` (9 per-webpart shim assets)
  - `ClientSideAssets/hb-webparts-app-ab43ba83.js`

## Secondary warning status

`The children of a Card component should be of type CardItem or CardSection.` remains a separate UI follow-up and is not part of loader metadata contract validation.
