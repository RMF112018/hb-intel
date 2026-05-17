import type { MyProjectLinkItem } from '@hbc/models/myWork';

export type LaunchOptionKey = 'sharepoint' | 'procore' | 'building-connected' | 'document-crunch';

export interface LaunchOptionView {
  readonly key: LaunchOptionKey;
  readonly label: string;
  readonly href: string;
  readonly ariaLabel: string;
}

export interface MyProjectLaunchPresentation {
  readonly allAvailableOptions: readonly LaunchOptionView[];
  readonly primaryVisibleOptions: readonly LaunchOptionView[];
  readonly overflowOptions: readonly LaunchOptionView[];
  readonly hasAvailableLaunchActions: boolean;
}

function sharePointLabel(kind: MyProjectLinkItem['sharePointAction']['kind']): string {
  return kind === 'legacy-folder' ? 'SharePoint Folder' : 'SharePoint Site';
}

export function buildMyProjectLaunchPresentation(
  row: MyProjectLinkItem,
): MyProjectLaunchPresentation {
  const allAvailableOptions: LaunchOptionView[] = [];
  const projectName = row.projectName;

  const sharePoint = row.sharePointAction;
  if (sharePoint.state === 'available' && sharePoint.href) {
    const label = sharePointLabel(sharePoint.kind);
    allAvailableOptions.push({
      key: 'sharepoint',
      label,
      href: sharePoint.href,
      ariaLabel: `Open ${label} for ${projectName}`,
    });
  }

  const procore = row.procoreAction;
  if (procore.state === 'available' && procore.href) {
    allAvailableOptions.push({
      key: 'procore',
      label: 'Procore',
      href: procore.href,
      ariaLabel: `Open Procore for ${projectName}`,
    });
  }

  const buildingConnected = row.buildingConnectedAction;
  if (buildingConnected.state === 'available' && buildingConnected.href) {
    allAvailableOptions.push({
      key: 'building-connected',
      label: 'BuildingConnected',
      href: buildingConnected.href,
      ariaLabel: `Open BuildingConnected for ${projectName}`,
    });
  }

  const documentCrunch = row.documentCrunchAction;
  if (documentCrunch.state === 'available' && documentCrunch.href) {
    allAvailableOptions.push({
      key: 'document-crunch',
      label: 'Document Crunch',
      href: documentCrunch.href,
      ariaLabel: `Open Document Crunch for ${projectName}`,
    });
  }

  return {
    allAvailableOptions,
    primaryVisibleOptions: allAvailableOptions.slice(0, 2),
    overflowOptions: allAvailableOptions.slice(2),
    hasAvailableLaunchActions: allAvailableOptions.length > 0,
  };
}

