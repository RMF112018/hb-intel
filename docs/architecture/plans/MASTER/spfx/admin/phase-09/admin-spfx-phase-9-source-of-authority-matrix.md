# Phase 9 Source-of-Authority Matrix

## Purpose

Define the source-of-authority routing rules for every identity object type that Phase 9 handles. This matrix is the canonical reference that the source-of-authority router in the backend must implement.

---

## Authority types

| Type | Code | Meaning |
|------|------|---------|
| AD DS authoritative | `ad-ds` | Mastered in on-prem AD; synced to Entra via Azure AD Connect. Lifecycle mutations execute against AD DS. |
| Entra authoritative | `entra` | Exists only in Entra ID (cloud-only). Lifecycle mutations execute against Graph. |
| Coordinated | `coordinated` | Action spans both authority domains; router determines per-object routing at execution time. |
| Visibility-only | `visibility` | Read-only query against Graph regardless of authority source. No mutation. |

---

## Synced users

Objects where `onPremisesSyncEnabled === true` in Entra ID.

| Action class | Authority | Execution boundary | Sync implication |
|-------------|-----------|-------------------|-----------------|
| Read / search / view profile | Visibility-only | Graph service | None — reads cloud-side copy |
| Read sync status | Visibility-only | Graph service | None — reads sync metadata |
| Create | AD DS authoritative | AD DS adapter | Object appears in Entra after next sync cycle (typically 30 min) |
| Update profile attributes | AD DS authoritative | AD DS adapter | Changes propagate to Entra after next sync cycle |
| Disable account | AD DS authoritative | AD DS adapter | Disabled state propagates after next sync cycle |
| Enable account | AD DS authoritative | AD DS adapter | Enabled state propagates after next sync cycle |
| Delete | AD DS authoritative | AD DS adapter | Object removed from Entra after next sync cycle; may enter soft-delete |
| Reset password | AD DS authoritative (deferred) | AD DS adapter | Password writeback or direct AD DS reset; deferred from Phase 9 |

**Operator UX note:** After any AD DS mutation on a synced user, the UI must display a sync-pending indicator and offer S-04 (verify sync propagation) as a follow-up action.

---

## Cloud-only users

Objects where `onPremisesSyncEnabled === false` or `null` in Entra ID.

| Action class | Authority | Execution boundary | Sync implication |
|-------------|-----------|-------------------|-----------------|
| Read / search / view profile | Visibility-only | Graph service | None |
| Create | Entra authoritative | Graph service | Immediate — no sync delay |
| Update profile attributes | Entra authoritative | Graph service | Immediate |
| Disable account | Entra authoritative | Graph service | Immediate |
| Enable account | Entra authoritative | Graph service | Immediate |
| Delete | Entra authoritative | Graph service | Immediate; enters 30-day soft-delete |
| Reset password | Entra authoritative (deferred) | Graph service | Deferred from Phase 9 |

---

## AD-synced security groups

Groups where `onPremisesSyncEnabled === true`.

| Action class | Authority | Execution boundary | Sync implication |
|-------------|-----------|-------------------|-----------------|
| Read / search / view properties | Visibility-only | Graph service | None — reads cloud-side copy |
| View membership | Visibility-only | Graph service | None |
| Read sync status | Visibility-only | Graph service | None |
| Create | AD DS authoritative | AD DS adapter | Group appears in Entra after next sync cycle |
| Update group properties | AD DS authoritative | AD DS adapter | Changes propagate after next sync cycle |
| Add members | AD DS authoritative | AD DS adapter | Membership propagates after next sync cycle |
| Remove members | AD DS authoritative | AD DS adapter | Membership propagates after next sync cycle |
| Delete | AD DS authoritative | AD DS adapter | Group removed from Entra after next sync cycle |

**Critical rule:** Do NOT attempt to modify membership of an AD-synced group through Graph. This will fail or create a conflict with the sync engine.

---

## Cloud-only groups

Groups where `onPremisesSyncEnabled === false` or `null`.

| Action class | Authority | Execution boundary | Sync implication |
|-------------|-----------|-------------------|-----------------|
| Read / search / view properties | Visibility-only | Graph service | None |
| View membership | Visibility-only | Graph service | None |
| Create | Entra authoritative | Graph service | Immediate |
| Update group properties | Entra authoritative | Graph service | Immediate |
| Add members | Entra authoritative | Graph service | Immediate |
| Remove members | Entra authoritative | Graph service | Immediate |
| Delete | Entra authoritative | Graph service | Immediate |

---

## Rollout-critical access / membership setup

Actions A-01 and A-02 from the catalog. These are coordinated because the target groups may be a mix of AD-synced and cloud-only.

| Scenario | Authority routing | Execution boundary |
|----------|------------------|-------------------|
| All target groups are cloud-only | Entra authoritative | Graph service |
| All target groups are AD-synced | AD DS authoritative | AD DS adapter |
| Mixed target groups | Coordinated | Both — AD DS adapter for synced groups, Graph for cloud-only groups |

**Routing logic:**
1. Resolve the target user's identity (Graph lookup).
2. For each target group, check `onPremisesSyncEnabled`.
3. Route each group membership operation to the correct execution boundary.
4. Aggregate results and sync-state for the operator.

---

## Sync-status checks and post-action verification

| Check | Authority | Data source | When used |
|-------|-----------|-------------|-----------|
| User sync status | Visibility-only | Graph `onPremisesSyncEnabled`, `onPremisesLastSyncDateTime` | Before mutation (routing), after AD DS mutation (verification) |
| Group sync status | Visibility-only | Graph `onPremisesSyncEnabled`, `onPremisesLastSyncDateTime` | Before mutation (routing), after AD DS mutation (verification) |
| Organization last sync time | Visibility-only | Graph `/organization` `onPremisesLastSyncDateTime` | Dashboard / health visibility |
| Post-mutation sync propagation | Visibility-only | Graph — poll target object after AD DS mutation | Auto-triggered by AD DS mutation actions; display sync-pending indicator |

**Sync propagation UX:**
- After AD DS mutations, display an estimated sync window (typically 30 min for delta sync).
- Provide a manual "check sync status" button (S-04).
- Do not block the operator — the mutation succeeded in AD DS; sync is eventual.
- Record sync verification result in the audit trail when checked.

---

## Authority resolution algorithm

```
function resolveAuthority(object, action):
  if action.isReadOnly:
    return 'visibility'  // always Graph

  syncEnabled = object.onPremisesSyncEnabled

  if syncEnabled === true:
    return 'ad-ds'        // AD DS authoritative
  else:
    return 'entra'        // cloud-only, Entra authoritative
```

For coordinated actions (A-01, A-02) that span multiple objects:
```
function resolveCoordinatedAuthority(targets):
  for each target in targets:
    target.authority = resolveAuthority(target, action)
  
  if all authorities are same:
    return single authority
  else:
    return 'coordinated'  // execute in both boundaries
```

---

## Cross-references

| Document | Purpose |
|----------|---------|
| `admin-spfx-phase-9-identity-action-catalog.md` | Action definitions with authority assignments |
| `admin-spfx-phase-9-risk-taxonomy.md` | Risk tiers referenced by authority routing |
| `admin-spfx-phase-9-hybrid-identity-architecture-baseline.md` | Architecture baseline defining authority model |
