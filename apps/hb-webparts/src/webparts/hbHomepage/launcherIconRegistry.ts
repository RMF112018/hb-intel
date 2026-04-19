import { Building2, type LucideIcon } from '@hbc/ui-kit/homepage';
import adpLogo from '../../../../hb-homepage/assets/icons/adp_logo.svg';
import compassLogo from '../../../../hb-homepage/assets/icons/compass_icon.svg';
import documentCrunchLogo from '../../../../hb-homepage/assets/icons/document-crunch-logo.svg';
import hh2Logo from '../../../../hb-homepage/assets/icons/hh2.svg';
import procoreLogo from '../../../../hb-homepage/assets/icons/Primary_Procore_LogoMark_2Col-Black_RGB.svg';
import type { PriorityActionsItemNormalized } from '../../homepage/data/priorityActionsContracts.js';

export interface HomepageLauncherGovernedIcon {
  icon?: LucideIcon;
  iconAssetSrc?: string;
  iconKey: string;
  iconPresentation: 'compliant';
}

const GOVERNED_ICON_BY_ACTION_KEY: Readonly<Record<string, HomepageLauncherGovernedIcon>> = Object.freeze({
  'hb-projects': {
    icon: Building2,
    iconKey: 'hb-projects-building2',
    iconPresentation: 'compliant',
  },
  'my-adp': {
    iconAssetSrc: adpLogo,
    iconKey: 'my-adp',
    iconPresentation: 'compliant',
  },
  compass: {
    iconAssetSrc: compassLogo,
    iconKey: 'compass',
    iconPresentation: 'compliant',
  },
  'document-crunch': {
    iconAssetSrc: documentCrunchLogo,
    iconKey: 'document-crunch',
    iconPresentation: 'compliant',
  },
  hh2: {
    iconAssetSrc: hh2Logo,
    iconKey: 'hh2',
    iconPresentation: 'compliant',
  },
  procore: {
    iconAssetSrc: procoreLogo,
    iconKey: 'procore',
    iconPresentation: 'compliant',
  },
});

const ALIASES: Readonly<Record<string, string>> = Object.freeze({
  'hb projects': 'hb-projects',
  adp: 'my-adp',
  'my adp': 'my-adp',
  documentcrunch: 'document-crunch',
  'document crunch': 'document-crunch',
});

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

export function resolveHomepageLauncherGovernedIcon(
  item: Pick<PriorityActionsItemNormalized, 'actionKey' | 'title'>,
): HomepageLauncherGovernedIcon | undefined {
  const byActionKey = normalize(item.actionKey);
  if (byActionKey && GOVERNED_ICON_BY_ACTION_KEY[byActionKey]) {
    return GOVERNED_ICON_BY_ACTION_KEY[byActionKey];
  }
  const aliasActionKey = ALIASES[byActionKey];
  if (aliasActionKey && GOVERNED_ICON_BY_ACTION_KEY[aliasActionKey]) {
    return GOVERNED_ICON_BY_ACTION_KEY[aliasActionKey];
  }
  const byTitle = normalize(item.title);
  const aliasTitle = ALIASES[byTitle];
  if (aliasTitle && GOVERNED_ICON_BY_ACTION_KEY[aliasTitle]) {
    return GOVERNED_ICON_BY_ACTION_KEY[aliasTitle];
  }
  return undefined;
}
