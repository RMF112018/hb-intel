# Repo-Truth Seam Map

## 1. Primary implementation seams

### Project Links read-model provider
```text
backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts
```

Relevant symbols / seams:
- `loadRegistryRows()`
- `createDefaultSourceDeps()`
- `getMyProjectLinks(...)`
- `reconcileProjectLinks(...)`
- `myProjectLinks.read.sources.result`
- `myProjectLinks.read.reconcile.result`

### Runtime diagnostics
```text
backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-runtime-diagnostics.ts
```

Relevant symbols:
- `MyProjectLinksRuntimeEventName`
- `MyProjectLinksRuntimeDiagnosticProperties`
- diagnostic privacy constraints

### Graph list client
```text
backend/functions/src/services/legacy-fallback/graph-list-client.ts
```

Relevant symbols:
- `GraphListClient.resolveSiteId()`
- `GraphListClient.resolveListId(...)`
- `GraphListClient.listItems(...)`
- `cachedSiteId`
- `listIdByTitle`

---

## 2. Schema documents that govern safe narrowing

### Registry schema
```text
docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md
```

Implementation-relevant fields:
- `IsActive`
- `MatchStatus`

The schema reference identifies them as indexed and implementation-relevant filter keys.

### Projects schema
```text
docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md
```

Used only as adjacent context. This package does not optimize the Projects source lane.

---

## 3. Existing telemetry contract

Trace-based events already present:
- `myProjectLinks.read.sources.result`
- `myProjectLinks.read.reconcile.result`

Current telemetry has proven:
- registry duration,
- projects duration,
- row counts,
- reconcile duration,
- matched output counts.

---

## 4. Candidate test files to inspect or extend

The agent must confirm exact current test paths at repo truth before editing, but likely seams include:

- provider unit tests for `my-project-links-read-model-provider`
- runtime diagnostics tests
- Graph list client tests if present, or a new focused unit test colocated with the client where the repository convention allows

---

## 5. Do Not Re-Read Rule

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
