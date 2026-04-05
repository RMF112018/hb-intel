# Phase 05 Risk Exposure — Navigation Governance and Branding Rules

## Primary risk

Phase 05 is the first phase where the program moves from custom code lanes into the governance lane. The major risk is not technical breakage — it is architectural drift caused by unclear operating rules.

## Key risks

### 1. Navigation duplication
If Lane C is not clearly defined, teams may duplicate the same destination in:
- homepage utility rails
- shell ribbon links
- global navigation
- hub navigation
- one-off page links

**Impact:** Confusing IA, redundant paths, erosion of trust.

### 2. Unsupported customization creep
Admins or developers may attempt to use branding or nav work as a reason to recreate native SharePoint shell behavior.

**Impact:** Brittle tenant experience, maintenance risk, contradiction of the supported posture.

### 3. Homepage dilution
If Lane A patterns are treated as generic components for every page, the homepage loses its role as the premium signature surface.

**Impact:** Visual sprawl, overuse of custom surfaces, weaker editorial hierarchy.

### 4. Governance without ownership
If nav and template rules exist without named owners/approvers, the docs will not constrain real-world change requests.

**Impact:** Informal exceptions, inconsistent application.

### 5. Over-engineered template doctrine
If Phase 05 creates too many template variants or too much ceremony, site owners will ignore it.

**Impact:** Standards bypass, shadow practices.

## Mitigations required in the phase

- Explicit ownership and approval tables
- clear supported-vs-prohibited statements
- decision rules for native nav vs homepage webpart vs shell-extension vs standalone page/site
- limited, practical template families
- admin/site-owner guidance written for operational use, not just architecture review
