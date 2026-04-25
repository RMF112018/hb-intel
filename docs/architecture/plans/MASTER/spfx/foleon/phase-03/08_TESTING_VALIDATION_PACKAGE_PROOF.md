# Testing, Validation, and Package Proof

## Schema / tenant tests

- Leadership `ReaderKey` choice exists.
- Leadership `HomepageSlot` choice exists.
- Leadership `PlacementKey` choice exists.
- Leadership `PageContext` choice exists.
- Existing Project Spotlight and Company Pulse schema remains intact.

## Shared package tests

- `LeadershipMessageReader` is exported.
- `FoleonEmbeddedReaderLane` supports all three lane configs.
- Three lanes can render simultaneously in a single React tree.
- No `window.__hbIntel_foleon` dependency exists in the shared reader path.
- No module-level global root is used by embedded components.

## Standalone Foleon tests

- `leadershipMessage` route parses.
- `leadershipMessage` route renders.
- route announcement exists.
- runtime proof route union accepts leadership.
- package proof includes Leadership Message toolbox entry if added.
- preview state has no fake CTA/iframe/telemetry.

## Homepage tests

- Project Portfolio Spotlight occupant renders Foleon Project Spotlight.
- Company Pulse occupant renders Foleon Company Pulse.
- Leadership Message occupant renders Foleon Leadership Message.
- Legacy modules no longer render in those zones.
- Protected shell layout diagnostics do not regress.
- Config is passed to all three embedded lanes.
- Expected Foleon version is passed.
- Accepted origins are passed.
- No tenant GUIDs are hardcoded.

## Validation commands

Use repo-truth scripts. Expected commands include:

```bash
pnpm --filter @hbc/foleon-reader lint
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader test

pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build

pnpm --filter @hbc/spfx-hb-homepage lint
pnpm --filter @hbc/spfx-hb-homepage build

pnpm --filter @hbc/spfx-hb-webparts lint
pnpm --filter @hbc/spfx-hb-webparts check-types
pnpm --filter @hbc/spfx-hb-webparts test
```

Package build/proof:

```bash
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
npx tsx tools/build-spfx-package.ts --domain hb-homepage
```

Run package proof/authority checks documented in repo instructions.

Use Node 18 where SPFx tooling requires it.

## Final closure evidence

The final Prompt 05 evidence record is
[`17_FINAL_CLOSURE_EVIDENCE.md`](./17_FINAL_CLOSURE_EVIDENCE.md). It records:

- every validation command documented for this closure pass, including command, exit code, passed/failed/blocked status, result summary, and scope classification;
- the focused homepage cutover test command and passing count (`5` files, `20` tests);
- known unrelated blockers for broad `@hbc/spfx-hb-webparts` and `@hbc/spfx-hb-homepage lint` checks;
- homepage package artifact proof for `dist/sppkg/hb-intel-homepage.sppkg`;
- proof JSON paths and generated-artifact staged status.

Do not claim broad-suite green until the unrelated broad-suite blockers listed in the final evidence record are resolved or explicitly excepted.
