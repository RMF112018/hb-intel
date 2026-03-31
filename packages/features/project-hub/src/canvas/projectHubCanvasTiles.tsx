import React from 'react';
import type { ICanvasTileDefinition, ICanvasTileProps } from '@hbc/project-canvas';

const workQueueEssential = React.lazy(() => import('./ProjectWorkQueueTile.js').then((m) => ({ default: m.ProjectWorkQueueTileEssential as unknown as React.ComponentType<ICanvasTileProps> })));
const workQueueStandard = React.lazy(() => import('./ProjectWorkQueueTile.js').then((m) => ({ default: m.ProjectWorkQueueTileStandard as unknown as React.ComponentType<ICanvasTileProps> })));
const workQueueExpert = React.lazy(() => import('./ProjectWorkQueueTile.js').then((m) => ({ default: m.ProjectWorkQueueTileExpert as unknown as React.ComponentType<ICanvasTileProps> })));
const activityEssential = React.lazy(() => import('./ProjectActivityTile.js').then((m) => ({ default: m.ProjectActivityTileEssential as unknown as React.ComponentType<ICanvasTileProps> })));
const activityStandard = React.lazy(() => import('./ProjectActivityTile.js').then((m) => ({ default: m.ProjectActivityTileStandard as unknown as React.ComponentType<ICanvasTileProps> })));
const activityExpert = React.lazy(() => import('./ProjectActivityTile.js').then((m) => ({ default: m.ProjectActivityTileExpert as unknown as React.ComponentType<ICanvasTileProps> })));

export const projectWorkQueueCanvasTileDef: ICanvasTileDefinition = {
  tileKey: 'project-work-queue',
  title: 'Project Work Queue',
  description: 'Actionable work items for this project filtered from the unified work feed.',
  defaultForRoles: ['project-administrator', 'project-manager', 'superintendent', 'project-team-member'],
  mandatory: true,
  component: { essential: workQueueEssential, standard: workQueueStandard, expert: workQueueExpert },
  defaultColSpan: 4,
  defaultRowSpan: 2,
  lockable: true,
};

export const projectActivityCanvasTileDef: ICanvasTileDefinition = {
  tileKey: 'project-activity',
  title: 'Project Activity',
  description: 'Recent project activity timeline from all module sources.',
  defaultForRoles: ['project-administrator', 'project-executive', 'project-manager', 'superintendent', 'project-team-member', 'project-viewer'],
  mandatory: true,
  component: { essential: activityEssential, standard: activityStandard, expert: activityExpert },
  defaultColSpan: 4,
  defaultRowSpan: 2,
  lockable: false,
};

export const projectHubCanvasTiles: ICanvasTileDefinition[] = [
  projectWorkQueueCanvasTileDef,
  projectActivityCanvasTileDef,
];
