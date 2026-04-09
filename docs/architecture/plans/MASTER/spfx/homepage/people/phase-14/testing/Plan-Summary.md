# Plan Summary — Comprehensive Test Suite for Refactored People & Culture / HB Kudos Surfaces

## Objective

Use the preliminary workflow harness and extracted SharePoint schema knowledge to build a **comprehensive test suite** for the refactored application surfaces after the split and companion implementations are complete.

## Scope

### In scope

- expansion of the preliminary workflow harness into a maintainable suite
- shared test foundation, config, logging, fixtures, and cleanup controls
- comprehensive workflow coverage for:
  - **HB Kudos** public experience
  - **People & Culture** public experience
  - **HB Kudos** companion / moderation workflow
  - **People & Culture** HR operating companion workflow
- role-aware approval, scheduling, publish, suppress, pin, targeting, media, and audit/history validation where supported
- package/deployment smoke validation for the refactored surfaces
- operator documentation and closure reporting

### Out of scope

- major product implementation changes unrelated to testing
- speculative workflow invention unsupported by repo truth or schema truth
- full browser-E2E dependency unless repo truth proves it is required for a specific untestable path
- rewriting the suite into a heavyweight enterprise automation platform

## Target test domains

### 1. Shared workflow foundation
- auth/config loading
- test-data generation
- correlation IDs / synthetic prefixes
- cleanup policy
- list/API helper layer
- assertion/logging/reporting utilities

### 2. HB Kudos comprehensive suite
- create submission
- recipient persistence
- author/submitter persistence
- pending/review state
- approval / rejection transitions
- scheduled / publish-live transitions where supported
- pin / feature behavior where supported
- reactions / celebrate behavior where supported
- archive/history visibility where supported
- audit-event linkage where supported

### 3. People & Culture comprehensive suite
- create announcement
- create celebration / milestone
- create culture-program/event item where supported
- audience targeting vs company-wide behavior
- media/photo source behavior where supported
- draft / approval / scheduled / live / expired / suppressed / archived transitions where supported
- homepage-governance-driving fields where supported

### 4. Companion and role-aware suite
- editor vs approver/admin behaviors
- approvals inbox behavior
- claim/reassign workflow where supported
- homepage governance override paths
- milestone review queue paths
- limited intake and notification-driving fields where supported

### 5. Packaging and deployment smoke suite
- package build validation
- manifest inclusion / registration proof
- stale-artifact prevention checks
- lightweight deployed-surface smoke checks where the repo/runtime supports them

## Non-negotiable outcomes

- the suite must reflect the refactored split architecture
- the suite must be grounded in extracted schema truth and local repo truth
- the suite must distinguish **proven** coverage from **inferred** or **blocked** coverage
- the suite must be safe to run repeatedly with synthetic data
- the suite must be maintainable by humans after the initial build
