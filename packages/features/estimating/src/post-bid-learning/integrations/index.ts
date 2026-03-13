import {
  projectAutopsyToCanvasTasks,
  projectAutopsyToNotificationPayloads,
  projectAutopsyToRelatedItems,
  type IAutopsyRecordSnapshot,
} from '@hbc/post-bid-autopsy';

export interface IEstimatingAutopsyIntegrationContext {
  readonly pursuitRouteBase?: string;
}

export const projectEstimatingAutopsyRoutes = (
  record: IAutopsyRecordSnapshot,
  context: IEstimatingAutopsyIntegrationContext = {}
) => {
  const base = context.pursuitRouteBase ?? '/estimating/post-bid-learning';

  return {
    detailRoute: `${base}/${record.autopsy.pursuitId}`,
    reviewRoute: `${base}/${record.autopsy.pursuitId}/review`,
    sectionsRoute: `${base}/${record.autopsy.pursuitId}/sections`,
  } as const;
};

export const createEstimatingPostBidLearningReferenceIntegrations = () => ({
  projectRoutes: projectEstimatingAutopsyRoutes,
  projectCanvasTasks: projectAutopsyToCanvasTasks,
  projectRelatedItems: projectAutopsyToRelatedItems,
  resolveNotifications: projectAutopsyToNotificationPayloads,
});

export type EstimatingPostBidLearningReferenceIntegrations =
  ReturnType<typeof createEstimatingPostBidLearningReferenceIntegrations>;
