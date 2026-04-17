import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import type { ProfilePhotoResolver } from '../../homepage/helpers/peopleCultureSplitModel.js';
import type { ModuleConfigSlices, RendererContext, ShellLayoutInput } from './shell/shellTypes.js';

export type { ModuleConfigSlices, RendererContext, ShellLayoutInput };

export const HB_HOMEPAGE_WEBPART_ID = 'e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf';

// ---------------------------------------------------------------------------
// External props — what mount.tsx passes in.
// `config` remains Record<string, unknown> for backward compatibility;
// the shell validation layer parses it into ModuleConfigSlices + ShellLayoutInput.
// ---------------------------------------------------------------------------

export interface HbHomepageProps {
  config?: Record<string, unknown>;
  identity?: HomepageIdentityInput;
  assetBaseUrl?: string;
  siteUrl?: string;
  getGraphToken?: () => Promise<string>;
  getApiToken?: () => Promise<string>;
  kudosListHostUrl?: string;
}

// ---------------------------------------------------------------------------
// Zone props — what each zone wrapper receives from the shell.
// Config is now typed as ModuleConfigSlices instead of Record<string, unknown>.
// ---------------------------------------------------------------------------

export interface HbHomepageZoneProps {
  moduleConfig: ModuleConfigSlices;
  identity?: HomepageIdentityInput;
  assetBaseUrl?: string;
  siteUrl?: string;
  getGraphToken?: () => Promise<string>;
  profilePhotoResolver?: ProfilePhotoResolver;
  kudosListHostUrl?: string;
}
