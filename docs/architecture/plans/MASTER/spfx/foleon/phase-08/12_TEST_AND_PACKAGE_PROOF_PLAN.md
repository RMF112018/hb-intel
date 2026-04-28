# HB Central Leadership Message Foleon Reader Rescue

**Date:** 2026-04-27  
**Scope:** Repo-truth audit, screenshot-hosted UI/UX assessment, subject-matter research, remediation plan, and prompt package for the Leadership Message Foleon reader lane.  
**Status:** Planning / code-agent implementation package. No production code is changed by this package.

> Audit boundary: this package is based on the live `main` branch inspected through GitHub connector access, the user-provided hosted screenshot, and public subject-matter research. Hosted validation was screenshot-based only; no authenticated browser automation was run against the tenant in this session.


## Test and Package Proof Plan

## Required validation commands

Run from repo root:

```bash
git status --short
pnpm --filter @hbc/foleon-reader lint
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

Adjust filters only if repo truth shows different package names.

## Unit test requirements

### View model

- Preview state produces no sample byline, role, quote, or audience.
- Ready state does not surface missing byline as visible copy.
- Ready state does not derive production pull quote from summary unless explicitly accepted.
- External-only state produces CTA `Open in Foleon`.
- Missing embed URL produces blocked state with employee-safe reason.
- Context items exclude cadence/archive group in employee model.
- Audience omitted when generic `Companywide`, unless deliberately retained.

### Layout

- H2 headline is user-facing.
- DOM does not contain forbidden copy strings.
- Visible CTA exists in live state.
- CTA is disabled with described reason in blocked state.
- Preview state renders preview-safe copy.
- No inline iframe.
- No nested interactive controls.
- Full-window viewer opens from CTA.
- Keyboard activation works.
- Focus return works after viewer close.
- Sibling Project Spotlight and Company Pulse layouts remain stable.

### CSS / breakpoint

- Snapshot or DOM tests verify compact class/state markers.
- No fixed max pixel width that breaks SharePoint columns.
- Optional media/identity rail hides/stacks below threshold.

## Hosted validation screenshots required

Capture and store evidence for:

- homepage row where Leadership Message appears;
- Leadership Message live state;
- preview/sample state;
- no live message state;
- blocked/unavailable state;
- mobile/narrow state;
- full-window viewer launch;
- focus return after viewer close;
- SharePoint edit mode;
- 100% zoom;
- 75% zoom;
- short-height condition.

## Hosted validation checks

- Confirm deployed JS contains new copy strings and no forbidden old strings.
- Confirm app catalog package version matches source version.
- Confirm no stale bundle is being loaded by SharePoint cache.
- Confirm console has no runtime errors.
- Confirm CTA opens the correct Foleon target.
- Confirm blocked/external states do not look broken.
- Confirm no horizontal overflow.

## Package proof

Required package proof should include:

- package path;
- generated `.sppkg` filename;
- manifest version;
- webpart version;
- SHA or checksum;
- grep proof for new strings in packaged JS;
- grep proof old forbidden strings are absent from packaged JS, unless retained only in docs/tests.

## Acceptance evidence folder

Recommended evidence path:

```text
docs/architecture/plans/MASTER/spfx/foleon-reader/leadership-message-reader-rescue/evidence/
```

Recommended files:

```text
HOSTED_SCREENSHOT_INDEX.md
PACKAGE_PROOF.md
TEST_OUTPUT.md
BROWSER_CONSOLE_REVIEW.md
FORBIDDEN_COPY_SCAN.md
```
