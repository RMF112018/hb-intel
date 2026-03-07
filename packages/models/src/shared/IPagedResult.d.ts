/**
 * Paginated result using offset-based pagination.
 *
 * @typeParam T - The type of items in the result set.
 *
 * @example
 * ```ts
 * const result: IPagedResult<ILead> = {
 *   items: [lead1, lead2],
 *   total: 50,
 *   page: 1,
 *   pageSize: 25,
 * };
 * ```
 */
export interface IPagedResult<T> {
    /** The items for the current page. */
    items: T[];
    /** Total number of items across all pages. */
    total: number;
    /** Current page number (1-based). */
    page: number;
    /** Number of items per page. */
    pageSize: number;
}
//# sourceMappingURL=IPagedResult.d.ts.map