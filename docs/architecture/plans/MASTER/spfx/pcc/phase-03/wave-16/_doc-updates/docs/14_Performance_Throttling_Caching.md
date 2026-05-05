# 14 — Performance, Throttling, and Caching

## Read strategy
Load summary first, lazy-load dense categories and audit history, avoid polling, and prefer backend-normalized read models.

## Cache strategy
Use backend cache for global definitions/policies, short-lived project effective settings cache, and cache invalidation after request completion or validation recheck.

## Throttling
Honor `Retry-After`, avoid immediate retries, reduce call frequency, batch where supported, and use change notifications/change tracking where later implementation justifies it.

## Large list strategy
Filter first on indexed columns. Avoid all-item scans. Store active/effective records with indexed `IsActive`, `ProjectId`, `SettingKey`, `Scope`, `EnvironmentKey`, and status fields.
