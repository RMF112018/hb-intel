# Shared Models Reference

> Pagination, query options, and common type aliases used across all domains.

**Package:** `@hbc/models` | **Module:** `shared`

## Interfaces

### `IPagedResult<T>`

Offset-based paginated result set.

| Field | Type | Description |
|-------|------|-------------|
| `items` | `T[]` | Items for the current page |
| `total` | `number` | Total items across all pages |
| `page` | `number` | Current page number (1-based) |
| `pageSize` | `number` | Items per page |

### `ICursorPageResult<T>`

Cursor-based paginated result set.

| Field | Type | Description |
|-------|------|-------------|
| `items` | `T[]` | Items for the current page |
| `cursor` | `string \| null` | Opaque cursor for next page |
| `hasMore` | `boolean` | Whether more pages exist |

### `IListQueryOptions`

Common query options for list endpoints.

| Field | Type | Description |
|-------|------|-------------|
| `page?` | `number` | Page number (1-based) |
| `pageSize?` | `number` | Items per page |
| `sortBy?` | `string` | Field name to sort by |
| `sortOrder?` | `'asc' \| 'desc'` | Sort direction |
| `search?` | `string` | Free-text search string |

## Type Aliases

| Type | Definition | Description |
|------|-----------|-------------|
| `SortOrder` | `'asc' \| 'desc'` | Sort direction |
| `DateString` | `string` | ISO-8601 date string |
| `EntityId` | `string \| number` | Opaque entity identifier |

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `DEFAULT_PAGE_SIZE` | `25` | Default items per page |
| `MAX_PAGE_SIZE` | `100` | Maximum allowed page size |

## Import Examples

```ts
import type { IPagedResult, IListQueryOptions } from '@hbc/models';
import { DEFAULT_PAGE_SIZE } from '@hbc/models';
// Sub-path import:
import type { IPagedResult } from '@hbc/models/shared';
```
