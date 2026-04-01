# Backend Boundary Remediation Decision — Project Setup Service Resolution

> **Created:** 2026-04-01 (P9-G3-02)
> **Status:** Decided — Option A selected

## Executive Summary

**Decision: Option A — switch Project Setup route handlers to the scoped `createProjectSetupServiceFactory()` in both hosts.**

The monolithic host will receive the narrower PS container for PS routes. This is acceptable because PS handlers only access services available in `IProjectSetupServiceContainer` (verified by service-access audit). The dual-host coexistence model is transitional per ADR-0124.

## Option Assessment

| Option | Description | Verdict |
|--------|-------------|---------|
| **A** | Switch PS handlers to scoped factory in both hosts | **Selected** — simplest, preserves DRY, no new abstractions |
| B | Host-aware factory selection / DI | Rejected — adds complexity with no benefit given handlers don't access CRUD services |
| C | Duplicate route registrations per host | Rejected — violates DRY, increases maintenance burden |

## Why Option A

1. **Type-safe.** `IProjectSetupServiceContainer` contains all 9 core services. PS handlers access only these. No compilation errors.
2. **No behavioral change.** The scoped factory provides identical service implementations — same classes, same initialization.
3. **Narrower scope is correct.** PS handlers should not have access to domain CRUD services even transitionally.
4. **DRY preserved.** Same route module files serve both hosts — no duplication.
5. **Transitional host is acceptable.** The monolithic host is documented as transitional (ADR-0124). Getting narrower PS containers for PS routes is an improvement, not a regression.

## Implementation Impact

15 files require import changes:
- 5 handler files: factory import `createServiceFactory` → `createProjectSetupServiceFactory`
- 10 saga/step/notification files: type import `IServiceContainer` → `IProjectSetupServiceContainer`

No logic changes. No new files. No new abstractions.
