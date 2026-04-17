import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import type { ProfilePhotoResolver } from '../../homepage/helpers/peopleCultureSplitModel.js';

export const HB_HOMEPAGE_WEBPART_ID = 'e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf';

export interface HbHomepageProps {
  config?: Record<string, unknown>;
  identity?: HomepageIdentityInput;
  assetBaseUrl?: string;
  siteUrl?: string;
  getGraphToken?: () => Promise<string>;
  getApiToken?: () => Promise<string>;
  kudosListHostUrl?: string;
}

export interface HbHomepageZoneProps {
  config?: Record<string, unknown>;
  identity?: HomepageIdentityInput;
  assetBaseUrl?: string;
  siteUrl?: string;
  getGraphToken?: () => Promise<string>;
  profilePhotoResolver?: ProfilePhotoResolver;
  kudosListHostUrl?: string;
}
