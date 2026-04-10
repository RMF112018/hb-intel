# Prompt-05 Packaging Proof

## Objective

Prove that `PnpOps` remains packaged in `dist/sppkg/hb-webparts.sppkg` after the non-Azure runner refactor.

## Source registration checks

Confirmed source-side registration and wiring:
- `apps/hb-webparts/src/webparts/pnp/PnpOpsWebPart.manifest.json` (`id: 9e2dd84a-a121-4fb3-a964-f43a94abf9fd`, version `0.0.7.0`)
- `apps/hb-webparts/src/mount.tsx` includes renderer registration for `9e2dd84a-a121-4fb3-a964-f43a94abf9fd`
- `apps/hb-webparts/config/package-solution.json` solution metadata aligned with current package scope
- `tools/build-spfx-package.ts` domain packaging path for `hb-webparts`

## Packaging commands run

```bash
pnpm --filter @hbc/spfx-hb-webparts build
npx tsx tools/build-spfx-package.ts --domain hb-webparts
```

Both commands completed successfully.

## Artifact proof

Primary artifact:
- `dist/sppkg/hb-webparts.sppkg`
- Size: `3.0M`
- mtime: `2026-04-10 04:48:33`

Command evidence:

```bash
unzip -l dist/sppkg/hb-webparts.sppkg | rg "9e2dd84a-a121-4fb3-a964-f43a94abf9fd|shell-entry-9e2dd84a-a121-4fb3-a964-f43a94abf9fd|WebPart_9e2dd84a-a121-4fb3-a964-f43a94abf9fd|hb-webparts-app|spfx-hb-webparts.css"
```

Observed entries:
- `1f447e99-a2c7-43e5-83d8-d2ed78ed1a96/WebPart_9e2dd84a-a121-4fb3-a964-f43a94abf9fd.xml`
- `ClientSideAssets/hb-webparts-app-e3b47356.js`
- `ClientSideAssets/shell-entry-9e2dd84a-a121-4fb3-a964-f43a94abf9fd-455629af.js`
- `ClientSideAssets/spfx-hb-webparts.css`

Also verified package identity:

```bash
unzip -p dist/sppkg/hb-webparts.sppkg AppManifest.xml | rg -n "39b8f2ea-59bd-45b7-b4ec-b590b316833b|hb-webparts"
```

Observed:
- `Name="hb-webparts"`
- `ProductID="39b8f2ea-59bd-45b7-b4ec-b590b316833b"`

## Conclusion

`PnpOps` is present in the built `.sppkg` and mapped to packaged shell/client assets. Packaging proof requirement is satisfied.
