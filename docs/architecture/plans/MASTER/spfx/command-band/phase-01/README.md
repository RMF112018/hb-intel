# Priority Actions Band Provisioning Prompt Package

## Objective

Provision the new homepage command-band data model at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral` by extending the existing local PnP runner workflow in `tools/pnp-runner-local/` **if that path is technically viable**, using **Device Login** authentication, extracting the currently configured SharePoint Quick Links card destinations from the live HBCentral homepage, and seeding the new `Priority Actions Band Items` list with that data.

## Package order

Read and honor the binding schema files first, then run the prompts in order:

0. `05-List-Schema-Priority-Actions-Band-Config.md`
0. `06-List-Schema-Priority-Actions-Band-Items.md`
1. `Prompt-01_Audit-Runner-And-Homepage-Seams.md`
2. `Prompt-02_Extend-Runner-For-Provisioning-And-Extraction.md`
3. `Prompt-03_Provision-Lists-And-Seed-From-QuickLinks.md`
4. `Prompt-04_Update-SharePoint-List-Documentation.md`
5. `Prompt-05_Final-Validation-And-Closure.md`

## Binding schema artifacts included in this package

This package now includes the authoritative list-schema files for the two command-band lists:

- `05-List-Schema-Priority-Actions-Band-Config.md`
- `06-List-Schema-Priority-Actions-Band-Items.md`

These are not reference extras. They are binding implementation inputs. The code agent must provision, seed, validate, and document against those exact list titles, internal names, field definitions, defaults, and validation rules unless repo truth forces a deliberate migration/update in the same pass.

## Locked requirements

- The implementation target is the existing local runner area: `tools/pnp-runner-local/`.
- Prefer extending the current runner/server/PowerShell bridge rather than creating disconnected provisioning scripts.
- Use **Device Login** auth for the provisioning/extraction path.
- The target SharePoint site is **only** `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- Extract the existing homepage Quick Links configuration and use it to seed `Priority Actions Band Items`.
- Provision both lists:
  - `Priority Actions Band Config`
  - `Priority Actions Band Items`

- Treat the included schema files as the binding contract for provisioning and seeding:
  - `05-List-Schema-Priority-Actions-Band-Config.md`
  - `06-List-Schema-Priority-Actions-Band-Items.md`
- Do not invent, rename, or silently drift field definitions away from those schema files.
- Update the SharePoint list documentation under:
  - `/Users/bobbyfetting/hb-intel/docs/reference/sharepoint/list-schemas/hbcentral/**`
- No deferrals. If a capability is required, implement it now.
- Do not re-read files that are already in active context unless you need to verify drift, dependencies, or uncertainty after making changes.

## Repo-truth context to honor

- The authoritative field contract for the two new lists is included directly in this package and must be treated as binding input for runner extensions, provisioning, seeding, runtime descriptors, and docs:
  - `05-List-Schema-Priority-Actions-Band-Config.md`
  - `06-List-Schema-Priority-Actions-Band-Items.md`

- The local runner already exists at `tools/pnp-runner-local/`.
- The runner already supports HTTPS, loopback-local execution, persisted run workspaces, and PowerShell-backed PnP extraction.
- The runner config already defaults auth mode to `DeviceLogin` unless explicitly set to `Interactive`.
- The existing PowerShell bridge currently supports extraction-oriented actions only; provisioning will require a deliberate extension, not hand-waving.
- The homepage utility/priority actions model already exists in:
  - `apps/hb-webparts/src/homepage/webparts/utilityContracts.ts`
  - `apps/hb-webparts/src/homepage/helpers/utilityConfig.ts`
  - `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- The hero banner admin/list descriptor implementation is the strongest existing pattern for canonical SharePoint-backed homepage configuration and should be used as the reference model for descriptor/read/write/doc discipline.

## Expected outcome

By the end of this package, the repo should contain:

- provisionable list schema support for the new command-band data model

- the two authoritative schema docs preserved in-package and reflected exactly in code, provisioning, and docs
- a local-runner-backed extraction + provisioning path using Device Login
- seeded `Priority Actions Band Items` rows derived from the existing live HBCentral Quick Links configuration
- updated SharePoint list documentation in `docs/reference/sharepoint/list-schemas/hbcentral/**`
- validation evidence and closure notes proving the model, seeding path, and docs are complete

## Evidence standard

Every prompt in this package expects concrete proof:
- changed files
- commands run
- validation output
- seeded row counts / extracted item counts
- doc files added or updated
- any mismatch between extracted Quick Links inputs and seeded outputs explained explicitly

No “should be fine,” no future TODOs, no soft closure.
