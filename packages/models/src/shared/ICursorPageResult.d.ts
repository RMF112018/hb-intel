/**
 * Paginated result using cursor-based pagination.
 *
 * Cursor pagination is preferred for large data sets or real-time feeds
 * where offset-based pagination may skip or duplicate rows.
 *
 * @typeParam T - The type of items in the result set.
 *
 * @example
 * ```ts
 * const page: ICursorPageResult<ILead> = {
 *   items: [lead1, lead2],
 *   cursor: 'eyJpZCI6MTB9',
 *   hasMore: true,
 * };
 * ```
 */
export interface ICursorPageResult<T> {
    /** The items for the current page. */
    items: T[];
    /** Opaque cursor for fetching the next page, or `null` if no more pages. */
    cursor: string | null;
    /** Whether additional pages exist beyond the current cursor. */
    hasMore: boolean;
}
//# sourceMappingURL=ICursorPageResult.d.ts.map