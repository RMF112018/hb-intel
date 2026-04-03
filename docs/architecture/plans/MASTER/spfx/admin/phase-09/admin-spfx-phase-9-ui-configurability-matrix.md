# Phase 9 UI Configurability Matrix

## Purpose

For every implement-now action and connector dependency, state what IT must be able to configure through the UI, the editability and security posture of each value, and whether any external prerequisite remains.

**Hard rule:** No action may be marked "implement now" if its normal setup still depends on post-deployment code edits.

---

## Connector configurability

### AD DS connector (`ad-ds`)

| Setting | UI-configurable | Editable after save | Rotatable | Testable | Shown after save | Masked / write-only | Admin role required | External prerequisite |
|---------|----------------|--------------------|-----------|---------|-----------------|--------------------|--------------------|--------------------|
| Display name | Yes | Yes | N/A | N/A | Yes | No | `admin:identity:connections` | None |
| Server endpoint (FQDN/IP) | Yes | Yes | N/A | Yes — connectivity check | Yes | No | `admin:identity:connections` | AD DS infrastructure must exist |
| Port | Yes | Yes (default 636) | N/A | Yes — connectivity check | Yes | No | `admin:identity:connections` | None |
| Use LDAPS | Yes | Yes (default true) | N/A | Yes — TLS check | Yes | No | `admin:identity:connections` | None |
| Base DN | Yes | Yes | N/A | Yes — search base validation | Yes | No | `admin:identity:connections` | AD DS domain structure must exist |
| Service account UPN/DN | Yes | Yes | N/A | Yes — bind test | Yes | No | `admin:identity:connections` | Service account must be provisioned by IT |
| Authentication method | Yes | Yes | N/A | Yes — bind test | Yes | No | `admin:identity:connections` | None |
| Service account password | Yes | Yes | **Yes** — enter new, validate, replace | Yes — bind test | **No — write-only** | **Yes — masked** | `admin:identity:connections` | Service account password must be known by IT |
| Certificate reference | Yes | Yes | **Yes** — provide new, validate, replace | Yes — bind test | Thumbprint only | Partial — thumbprint shown, private key never | `admin:identity:connections` | Certificate must be provisioned |

### Graph identity connector (`graph-identity`)

| Setting | UI-configurable | Editable after save | Rotatable | Testable | Shown after save | Masked / write-only | Admin role required | External prerequisite |
|---------|----------------|--------------------|-----------|---------|-----------------|--------------------|--------------------|--------------------|
| Permission confirmed | Yes | Yes (toggle) | N/A | Yes — Graph API test call | Yes | No | `admin:identity:connections` | Admin consent must be granted in Entra portal |
| Confirmed by | Auto-captured | Read-only | N/A | N/A | Yes | No | N/A | None |
| Confirmed at | Auto-captured | Read-only | N/A | N/A | Yes | No | N/A | None |
| Notes | Yes | Yes | N/A | N/A | Yes | No | `admin:identity:connections` | None |

---

## Connection health display

| Health property | Shown in UI | Editable | Updated by |
|----------------|-------------|----------|-----------|
| Connection status (healthy / unhealthy / untested) | Yes — badge/indicator | Read-only | Connection test result |
| Last tested at | Yes — timestamp | Read-only | Connection test |
| Last test result | Yes — success/failure with detail | Read-only | Connection test |
| Last tested by | Yes — actor UPN | Read-only | Connection test |
| Last successful test at | Yes — timestamp | Read-only | Connection test |
| Error detail (on failure) | Yes — actionable message | Read-only | Connection test |

---

## Action configurability

For implement-now actions, no per-action configuration is code-bound. All actions derive their execution configuration from:

| Configuration source | How set | Code-bound? |
|---------------------|---------|-------------|
| AD DS connector settings | UI-managed connection registry | **No** — UI-configurable |
| Graph permission state | UI-managed connection registry | **No** — UI-configurable |
| Managed Identity permissions | Deployment infrastructure (admin consent) | **Acceptable** — external admin-page step |
| AD DS service account permissions | External infrastructure (OU delegation) | **Acceptable** — external infrastructure prerequisite |
| Operator authorization | `@hbc/auth` permission model | **No** — governed by access-control page |
| Target OU for create actions | Entered by operator in action form (or defaulted from connector base DN) | **No** — runtime input |

### Per-action UI input requirements

| Action | Operator input at execution time | Source | Code-bound? |
|--------|--------------------------------|--------|-------------|
| U-01, U-02 Search/read users | Search query (name, UPN, etc.) | Form field | No |
| U-03 Create user (AD DS) | User attributes (name, UPN, OU, etc.) | Form with validation | No |
| U-04 Create cloud-only user | User attributes (name, UPN, etc.) | Form with validation | No |
| U-05 Update user (AD DS) | Changed attributes | Form with before/after preview | No |
| U-06 Update cloud-only user | Changed attributes | Form with before/after preview | No |
| U-07, U-08 Disable user | Target user selection + confirmation | Selection + dialog | No |
| U-09, U-10 Enable user | Target user selection + confirmation | Selection + dialog | No |
| U-11, U-12 Delete user | Target user selection + double confirmation | Selection + double dialog | No |
| G-01, G-02, G-03 Search/read groups | Search query | Form field | No |
| G-04 Create cloud-only group | Group name, description | Form with validation | No |
| G-05 Update cloud-only group | Changed properties | Form with preview | No |
| G-06, G-09 Add members | Group selection + member UPNs | Form with member picker | No |
| G-07, G-10 Remove members | Group selection + member selection | Selection + confirmation | No |
| G-08 Delete cloud-only group | Target group + double confirmation | Selection + double dialog | No |
| G-11 Create AD group | Group name, OU, description | Form with validation | No |
| G-12 Delete AD group | Target group + double confirmation | Selection + double dialog | No |
| A-01, A-02 Rollout-critical access | Target user + group assignments | Multi-select form with preview | No |
| S-01–S-04 Sync checks | Target object | Selection or auto-triggered | No |

---

## External admin-page prerequisites by action

| Action group | External prerequisite | Where IT completes it |
|-------------|---------------------|--------------------|
| All Graph read actions (U-01, U-02, G-01–G-03, S-01–S-04) | Admin consent for `User.Read.All`, `Group.Read.All`, `GroupMember.Read.All`, `Organization.Read.All` | Entra admin portal |
| Cloud-only user writes (U-04, U-06, U-08, U-10, U-12) | Admin consent for `User.ReadWrite.All` | Entra admin portal |
| Cloud-only group writes (G-04, G-05, G-08) | Admin consent for `Group.ReadWrite.All` | Entra admin portal |
| Cloud-only membership writes (G-06, G-07, A-01, A-02) | Admin consent for `GroupMember.ReadWrite.All` | Entra admin portal |
| All AD DS actions | AD DS service account with delegated OU permissions + network connectivity | IT identity team + IT network team |

---

## Compliance with no-code handoff gate

| Gate requirement | Status |
|-----------------|--------|
| All connector settings are UI-configurable | **Met** — AD DS connector and Graph confirmation are fully UI-managed |
| Sensitive values are write-only / masked | **Met** — passwords never returned in API responses; certificate private keys never exposed |
| Connections are testable through UI | **Met** — test button for both connectors |
| Connections are rotatable through UI | **Met** — password and certificate rotation via UI update + retest |
| No action requires code edits for normal setup | **Met** — all 26 implement-now actions derive configuration from UI-managed sources |
| External prerequisites are documented, not hidden | **Met** — admin consent and AD DS infrastructure are explicit |

---

## Cross-references

| Document | Purpose |
|----------|---------|
| `admin-spfx-phase-9-identity-action-catalog.md` | Action definitions |
| `admin-spfx-phase-9-connection-dependency-matrix.md` | Connector requirements per action |
| `admin-spfx-phase-9-connection-management-baseline.md` | Connection management architecture |
| `admin-spfx-phase-9-no-code-handoff-gate.md` | No-code handoff gate definition |
| `admin-spfx-phase-9-permission-access-role-and-consent-matrix.md` | Permission requirements |
