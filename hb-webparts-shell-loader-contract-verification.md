# hb-webparts Shell Loader Contract Verification

## Contract Verification Matrix

| Webpart Title               | Component ID                           | Packaged entryModuleId                       | Packaged runtime asset path            | Compiled module identity (`define(...)`)     | Contract match |
| --------------------------- | -------------------------------------- | -------------------------------------------- | -------------------------------------- | -------------------------------------------- | -------------- |
| Company Pulse               | `0b53f651-fd92-4f7f-a9da-f7797017f5eb` | `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0` | `ClientSideAssets/shell-web-part_*.js` | `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0` | Yes            |
| Personalized Welcome Header | `46bfde64-f0cb-4f62-9f6b-a466f8fadc1f` | `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0` | `ClientSideAssets/shell-web-part_*.js` | `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0` | Yes            |
| Shared shell asset          | `n/a`                                  | `n/a`                                        | `ClientSideAssets/shell-web-part_*.js` | `0b53f651-fd92-4f7f-a9da-f7797017f5eb_1.0.0` | Yes            |

## Assertions

- `entryModuleId` is shared and identical across hb-webparts manifests.
- `scriptResources` uses the same shared key as `entryModuleId`.
- `shell-web-part` key is no longer used as hb-webparts packaged `entryModuleId`.
- The packaged shell JS module identity equals the `entryModuleId` used by representative webparts.
