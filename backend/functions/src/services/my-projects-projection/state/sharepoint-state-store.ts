import { GraphListClient } from '../../legacy-fallback/graph-list-client.js';

export interface ISharePointStateRow {
  readonly id: number;
  readonly etag?: string;
  readonly fields: Record<string, unknown>;
}

function toFilterValue(value: string): string {
  return value.replace(/'/g, "''");
}

export class SharePointStateStore {
  private readonly graph: GraphListClient;
  private readonly siteIdPromise: Promise<string>;

  constructor(siteUrl: string, graph?: GraphListClient) {
    this.graph = graph ?? new GraphListClient(siteUrl);
    this.siteIdPromise = this.graph.resolveSiteId();
  }

  async listByFilter(args: {
    listTitle: string;
    filter: string;
    select: readonly string[];
    top?: number;
  }): Promise<ISharePointStateRow[]> {
    const rows = await this.graph.listItems(args.listTitle, {
      filter: args.filter,
      select: args.select,
      top: args.top,
    });
    return rows.map((row) => ({ id: Number(row.id), fields: row.fields }));
  }

  async getByTextField(args: {
    listTitle: string;
    field: string;
    value: string;
    select: readonly string[];
  }): Promise<ISharePointStateRow | null> {
    const rows = await this.listByFilter({
      listTitle: args.listTitle,
      filter: `fields/${args.field} eq '${toFilterValue(args.value)}'`,
      select: args.select,
      top: 1,
    });
    return rows[0] ?? null;
  }

  async getByNumericField(args: {
    listTitle: string;
    field: string;
    value: number;
    select: readonly string[];
  }): Promise<ISharePointStateRow | null> {
    const rows = await this.listByFilter({
      listTitle: args.listTitle,
      filter: `fields/${args.field} eq ${args.value}`,
      select: args.select,
      top: 1,
    });
    return rows[0] ?? null;
  }

  async add(args: { listTitle: string; fields: Record<string, unknown> }): Promise<ISharePointStateRow> {
    const created = await this.graph.addItem(args.listTitle, args.fields);
    return { id: Number(created.id), fields: created.fields };
  }

  async update(args: {
    listTitle: string;
    itemId: number;
    fields: Record<string, unknown>;
  }): Promise<void> {
    await this.graph.updateItemAllowNulls(args.listTitle, args.itemId, args.fields);
  }

  async resolveSiteId(): Promise<string> {
    return this.siteIdPromise;
  }
}
