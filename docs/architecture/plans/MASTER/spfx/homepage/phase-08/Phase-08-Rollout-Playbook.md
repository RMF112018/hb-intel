# Phase 08 Rollout Playbook

Deployment sequence, validation steps, rollback criteria, and decision ownership for the SharePoint homepage ecosystem.

## Deployment Sequence

### Step 1: Pre-release validation (Day −1)

**Owner:** Architecture Reviewer + SharePoint Admin

| Check | Command / Action | Pass Criteria |
|-------|-----------------|---------------|
| Lane A type-check | `pnpm --filter @hbc/spfx-hb-webparts check-types` | Zero errors |
| Lane A lint | `pnpm --filter @hbc/spfx-hb-webparts lint` | Zero errors |
| Lane A build | `pnpm --filter @hbc/spfx-hb-webparts build` | JS < 400 KB, CSS < 10 KB |
| Lane A tests | `pnpm --filter @hbc/spfx-hb-webparts test` | All 72 tests pass |
| Lane B type-check | `pnpm --filter @hbc/spfx-hb-shell-extension check-types` | Zero errors |
| Lane B lint | `pnpm --filter @hbc/spfx-hb-shell-extension lint` | Zero errors |
| Lane B build | `pnpm --filter @hbc/spfx-hb-shell-extension build` | JS < 300 KB, CSS < 10 KB |
| Lane B tests | `pnpm --filter @hbc/spfx-hb-shell-extension test` | All 29 tests pass |
| Bundle budget | `npx tsx tools/spfx-bundle-check.ts` | No hard-fail violations |
| `.sppkg` build | `npx tsx tools/build-spfx-package.ts --domain hb-webparts` | 10 manifests, 10 shell entries |
| Documentation | Review release checklist (Phase 07) | All items checked |

### Step 2: Deploy Lane A (Day 0)

**Owner:** SharePoint Admin

1. Upload `hb-webparts.sppkg` to the tenant App Catalog
2. Trust the package (or overwrite previous version)
3. Verify the solution appears in the App Catalog with correct version
4. Add one homepage webpart to a test page — confirm it renders
5. Proceed to full homepage composition deployment

### Step 3: Deploy Lane B (Day 0 or Day +1)

**Owner:** SharePoint Admin

1. Upload `hb-shell-extension.sppkg` to the tenant App Catalog (when Application Customizer wiring is ready)
2. Trust the package
3. Navigate to any modern page — verify top/bottom placeholders render (if configured)
4. Verify safe no-op when no content is configured

### Step 4: Post-deployment smoke tests (Day 0)

**Owner:** Product Owner + Architecture Reviewer

Run the smoke-test plan below.

### Step 5: Release confirmation (Day +1)

**Owner:** Product Owner

- Confirm smoke tests pass
- Confirm no user-reported issues
- Record sign-off in release log

---

## Production Smoke-Test Plan

### Lane A smoke tests

| # | Test | Expected Result |
|---|------|-----------------|
| S-01 | Place HbHeroBanner on a page via webpart gallery | Hero renders with headline; empty state if no config |
| S-02 | Place PersonalizedWelcomeHeader | Greeting renders with user name |
| S-03 | Place PriorityActionsRail with audience filter | Filtered actions render; empty state if no match |
| S-04 | Navigate homepage with keyboard (Tab key) | Focus moves through all CTAs in zone order |
| S-05 | Check console for `[HB-Intel ShellWebPart] Module resolved` | Appears for each webpart placed |
| S-06 | Check network for `shell-entry-*.js` loads | 200 OK for each webpart's entry file |
| S-07 | Check network for `hb-webparts-app-*.js` | 200 OK |
| S-08 | Verify empty state renders when webpart has no config | Authoring message visible |
| S-09 | Verify loading state renders (if isLoading can be triggered) | Spinner visible |

### Lane B smoke tests

| # | Test | Expected Result |
|---|------|-----------------|
| S-10 | Navigate to any modern page with extension deployed | Top placeholder renders (if configured) or empty container |
| S-11 | Configure a test alert with severity "warning" | Alert band renders with amber styling |
| S-12 | Dismiss a dismissible alert | Alert disappears; page remains stable |
| S-13 | Navigate to page without placeholder support | No errors in console; graceful no-op |
| S-14 | Check footer rail renders when configured | Footer links and support text visible |
| S-15 | Keyboard-navigate through ribbon and alert links | Focus rings visible on all interactive elements |

### Cross-lane coexistence tests

| # | Test | Expected Result |
|---|------|-----------------|
| S-16 | Homepage with both Lane A webparts and Lane B placeholders | Both render without conflict |
| S-17 | Non-homepage page with Lane B only | Shell extension renders; no Lane A content appears |
| S-18 | Verify no duplicate navigation between Lane B ribbon and global nav | No overlapping links |

---

## Rollback Criteria

| Condition | Action | Owner |
|-----------|--------|-------|
| Any webpart fails to load (`Could not load ... in require`) | Retract Lane A package from App Catalog | SharePoint Admin |
| Shell extension causes page errors | Retract Lane B package | SharePoint Admin |
| Performance degradation (page load >5s increase) | Retract affected package | Architecture + Admin |
| Accessibility regression reported by users | Hotfix or retract depending on severity | Product + Architecture |
| Lane A/B conflict (rendering interference) | Retract Lane B first, then investigate | Architecture |

### Rollback procedure

1. Navigate to SharePoint Admin Center → App Catalog
2. Select the affected `.sppkg` package
3. Click **Retract** (not delete — retract preserves the package for re-deployment)
4. Verify the retracted lane no longer renders on affected pages
5. Document the rollback reason and create a remediation plan

---

## Decision Ownership

| Decision | Owner |
|----------|-------|
| Go/No-Go for deployment | Product Owner |
| Technical readiness sign-off | Architecture Reviewer |
| App Catalog operations | SharePoint Admin |
| Content readiness | Corporate Communications |
| Rollback decision | Architecture Reviewer (can be initiated by any role) |
| Post-deployment monitoring | Product Owner + Architecture |
