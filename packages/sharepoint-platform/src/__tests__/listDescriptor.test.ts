import { describe, it, expect } from 'vitest';
import {
  buildListItemsEndpoint,
  buildListFieldsEndpoint,
  type SharePointListDescriptor,
} from '../listDescriptor.js';

const SITE = 'https://example.sharepoint.com/sites/HBCentral';
const DESC: SharePointListDescriptor = {
  id: 'b01fa4d2-29b1-4e11-b581-4cb3d0951a79',
  title: 'Sample List',
  urlSegment: 'Sample List',
};

describe('buildListItemsEndpoint', () => {
  it('binds by GUID with no query', () => {
    expect(buildListItemsEndpoint(SITE, DESC)).toBe(
      `${SITE}/_api/web/lists(guid'${DESC.id}')/items`,
    );
  });

  it('includes select, expand, filter (encoded), and top', () => {
    const url = buildListItemsEndpoint(SITE, DESC, {
      select: 'Id,Title',
      expand: 'Author',
      filter: "Title eq 'abc'",
      top: 1,
    });
    expect(url).toContain('$select=Id,Title');
    expect(url).toContain('$expand=Author');
    expect(url).toContain(`$filter=${encodeURIComponent("Title eq 'abc'")}`);
    expect(url).toContain('$top=1');
    expect(url.startsWith(`${SITE}/_api/web/lists(guid'${DESC.id}')/items?`)).toBe(true);
  });
});

describe('buildListFieldsEndpoint', () => {
  it('binds by GUID with no filter', () => {
    expect(buildListFieldsEndpoint(SITE, DESC)).toBe(
      `${SITE}/_api/web/lists(guid'${DESC.id}')/fields`,
    );
  });

  it('includes encoded filter and InternalName select when filter provided', () => {
    const url = buildListFieldsEndpoint(SITE, DESC, "InternalName eq 'Title'");
    expect(url).toContain(`$filter=${encodeURIComponent("InternalName eq 'Title'")}`);
    expect(url).toContain('$select=InternalName');
  });
});
