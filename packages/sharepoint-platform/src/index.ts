/**
 * @hbc/sharepoint-platform — Layer 1 shared SharePoint mechanics.
 *
 * UI-free, framework-free primitives. See README for scope.
 */

export {
  storeSiteUrl,
  getSiteUrl,
  storeListHostUrl,
  getListHostUrl,
} from './hostContext.js';

export {
  type SharePointListDescriptor,
  type ListItemsQuery,
  buildListItemsEndpoint,
  buildListFieldsEndpoint,
} from './listDescriptor.js';

export { fetchRequestDigest } from './requestDigest.js';

export { ensureUserByEmail, resolveCurrentUserId } from './users.js';

export { type ItemMeta, fetchItemMetaByFieldValue } from './itemMeta.js';

export { mergeItemById } from './merge.js';

export {
  type FetchResult,
  type WriteResult,
  asError,
} from './results.js';

export {
  type CacheInvalidationBus,
  createCacheInvalidationBus,
} from './cacheInvalidation.js';
