export type LauncherLogoType =
  | 'official-wordmark'
  | 'official-symbol'
  | 'official-wordmark-plus-symbol'
  | 'tenant-wordmark'
  | 'site-derived-wordmark'
  | 'text-fallback';

export type LauncherThemeVariant = {
  /** Preferred asset path for light surfaces */
  light: string | null;
  /** Preferred asset path for dark surfaces */
  dark: string | null;
};

export type SquareTileTreatment =
  | 'use-wordmark-on-neutral-tile'
  | 'use-symbol-centered-on-neutral-tile'
  | 'use-wordmark-contained-with-padding'
  | 'use-tenant-mark-contained-with-padding'
  | 'use-monogram-fallback-tile';

export type LauncherFallbackStrategy = {
  /** What to render if an official vector asset is unavailable */
  strategy:
    | 'site-wordmark-snapshot'
    | 'tenant-logo-if-available-else-vendor-wordmark'
    | 'text-lockup'
    | 'monogram-tile';
  /** Short display text to use if falling back to text */
  fallbackLabel: string;
  /** Optional Lucide icon name for non-brand fallback states */
  fallbackLucideIcon?:
    | 'Building2'
    | 'Briefcase'
    | 'Receipt'
    | 'Users'
    | 'GraduationCap'
    | 'ShieldCheck'
    | 'Compass'
    | 'FileText';
};

export type LauncherAssetManifestItem = {
  id: string;
  name: string;
  launchUrl: string;
  preferredLogoType: LauncherLogoType;
  logoVariants: LauncherThemeVariant;
  squareTileTreatment: SquareTileTreatment;
  fallback: LauncherFallbackStrategy;
  notes?: string;
};

/**
 * Asset-path convention:
 * - Store vendor files under /assets/tool-launcher/vendors/<vendor>/
 * - Prefer SVG for both light and dark variants.
 * - If only one official asset exists, use the same path for both variants and
 *   place it on a controlled neutral tile surface.
 */
export const toolLauncherAssetManifest: LauncherAssetManifestItem[] = [
  {
    id: 'bamboohr',
    name: 'BambooHR',
    launchUrl: 'https://hedrickbrothers.bamboohr.com/login.php?r=/home/',
    preferredLogoType: 'official-wordmark-plus-symbol',
    logoVariants: {
      light: '/assets/tool-launcher/vendors/bamboohr/bamboohr-logo-full-color.svg',
      dark: '/assets/tool-launcher/vendors/bamboohr/bamboohr-logo-white.svg',
    },
    squareTileTreatment: 'use-wordmark-contained-with-padding',
    fallback: {
      strategy: 'site-wordmark-snapshot',
      fallbackLabel: 'BambooHR',
      fallbackLucideIcon: 'Users',
    },
    notes:
      'Use the full BambooHR mark on flagship cards. If only one branded asset is available, place it on a neutral tile with generous padding rather than inventing a generic HR icon.',
  },
  {
    id: 'hh2',
    name: 'hh2',
    launchUrl: 'https://hedrickbrothers.hh2.com/#login',
    preferredLogoType: 'site-derived-wordmark',
    logoVariants: {
      light: '/assets/tool-launcher/vendors/hh2/hh2-wordmark-light.svg',
      dark: '/assets/tool-launcher/vendors/hh2/hh2-wordmark-dark.svg',
    },
    squareTileTreatment: 'use-wordmark-on-neutral-tile',
    fallback: {
      strategy: 'text-lockup',
      fallbackLabel: 'hh2',
      fallbackLucideIcon: 'Briefcase',
    },
    notes:
      'Prefer a clean hh2 wordmark extracted from official site artwork. Do not substitute a generic construction, payroll, or time icon when the wordmark is available.',
  },
  {
    id: 'sap-concur',
    name: 'SAP Concur',
    launchUrl: 'https://www.concursolutions.com/',
    preferredLogoType: 'official-wordmark',
    logoVariants: {
      light: '/assets/tool-launcher/vendors/sap-concur/sap-concur-wordmark-light.svg',
      dark: '/assets/tool-launcher/vendors/sap-concur/sap-concur-wordmark-dark.svg',
    },
    squareTileTreatment: 'use-wordmark-contained-with-padding',
    fallback: {
      strategy: 'text-lockup',
      fallbackLabel: 'SAP Concur',
      fallbackLucideIcon: 'Receipt',
    },
    notes:
      'Use current SAP Concur branding, not older standalone Concur-only marks. Favor the wordmark over a travel or expense metaphor icon.',
  },
  {
    id: 'employee-navigator',
    name: 'Employee Navigator',
    launchUrl: 'https://employeenavigator.com/',
    preferredLogoType: 'official-wordmark-plus-symbol',
    logoVariants: {
      light: '/assets/tool-launcher/vendors/employee-navigator/employee-navigator-color.svg',
      dark: '/assets/tool-launcher/vendors/employee-navigator/employee-navigator-white.svg',
    },
    squareTileTreatment: 'use-wordmark-contained-with-padding',
    fallback: {
      strategy: 'text-lockup',
      fallbackLabel: 'Employee Navigator',
      fallbackLucideIcon: 'Users',
    },
    notes:
      'Use the official media-kit asset set. This is a strong candidate for both flagship and secondary shelf treatments because official light and dark variants are available.',
  },
  {
    id: 'adp',
    name: 'ADP',
    launchUrl:
      'https://online.adp.com/signin/v1/?APPID=RDBX&productId=80e309c3-70c6-bae1-e053-3505430b5495&returnURL=https://my.adp.com/&callingAppId=RDBX&TARGET=-SM-https://my.adp.com/',
    preferredLogoType: 'official-wordmark',
    logoVariants: {
      light: '/assets/tool-launcher/vendors/adp/adp-wordmark-red.svg',
      dark: '/assets/tool-launcher/vendors/adp/adp-wordmark-white.svg',
    },
    squareTileTreatment: 'use-wordmark-contained-with-padding',
    fallback: {
      strategy: 'text-lockup',
      fallbackLabel: 'ADP',
      fallbackLucideIcon: 'Receipt',
    },
    notes:
      'Keep ADP as a highly recognizable payroll anchor. Use the official wordmark and avoid replacing it with a paystub or calculator icon.',
  },
  {
    id: 'procore',
    name: 'Procore',
    launchUrl: 'https://login.procore.com/',
    preferredLogoType: 'official-wordmark',
    logoVariants: {
      light: '/assets/tool-launcher/vendors/procore/procore-wordmark-orange.svg',
      dark: '/assets/tool-launcher/vendors/procore/procore-wordmark-white.svg',
    },
    squareTileTreatment: 'use-wordmark-contained-with-padding',
    fallback: {
      strategy: 'text-lockup',
      fallbackLabel: 'Procore',
      fallbackLucideIcon: 'Building2',
    },
    notes:
      'Treat Procore as a flagship card. Preserve real brand recognition rather than collapsing it into a generic construction-management symbol.',
  },
  {
    id: 'compass',
    name: 'COMPASS',
    launchUrl: 'https://compass-app.com/',
    preferredLogoType: 'site-derived-wordmark',
    logoVariants: {
      light: '/assets/tool-launcher/vendors/compass/compass-wordmark-light.svg',
      dark: '/assets/tool-launcher/vendors/compass/compass-wordmark-dark.svg',
    },
    squareTileTreatment: 'use-wordmark-on-neutral-tile',
    fallback: {
      strategy: 'text-lockup',
      fallbackLabel: 'COMPASS',
      fallbackLucideIcon: 'Compass',
    },
    notes:
      'If a formal brand kit is unavailable, use a clean site-derived wordmark. Only fall back to a Compass Lucide icon in degraded states, never as the preferred launcher identity.',
  },
  {
    id: 'document-crunch',
    name: 'Document Crunch',
    launchUrl: 'https://app.documentcrunch.com/login/',
    preferredLogoType: 'official-wordmark',
    logoVariants: {
      light: '/assets/tool-launcher/vendors/document-crunch/document-crunch-wordmark-light.svg',
      dark: '/assets/tool-launcher/vendors/document-crunch/document-crunch-wordmark-dark.svg',
    },
    squareTileTreatment: 'use-wordmark-on-neutral-tile',
    fallback: {
      strategy: 'text-lockup',
      fallbackLabel: 'Document Crunch',
      fallbackLucideIcon: 'FileText',
    },
    notes:
      'Favor the full wordmark because it reads clearly and carries the brand well without needing an abstract document icon.',
  },
  {
    id: 'hedricklearn',
    name: 'HedrickLearn',
    launchUrl: 'https://hedricklearn.csod.com/',
    preferredLogoType: 'tenant-wordmark',
    logoVariants: {
      light: '/assets/tool-launcher/vendors/hedricklearn/hedricklearn-tenant-wordmark-light.svg',
      dark: '/assets/tool-launcher/vendors/hedricklearn/hedricklearn-tenant-wordmark-dark.svg',
    },
    squareTileTreatment: 'use-tenant-mark-contained-with-padding',
    fallback: {
      strategy: 'tenant-logo-if-available-else-vendor-wordmark',
      fallbackLabel: 'HedrickLearn',
      fallbackLucideIcon: 'GraduationCap',
    },
    notes:
      'Prefer the tenant-specific HedrickLearn logo if the CSOD tenant exposes one. If not, fall back to approved Cornerstone Learn branding before using a text-only lockup.',
  },
];

export const toolLauncherAssetManifestById = Object.fromEntries(
  toolLauncherAssetManifest.map((item) => [item.id, item]),
) as Record<string, LauncherAssetManifestItem>;
