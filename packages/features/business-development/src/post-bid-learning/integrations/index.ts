import {
  projectAutopsyToCanvasTasks,
  projectAutopsyToHealthIndicatorTelemetry,
  projectAutopsyToNotificationPayloads,
  projectAutopsyToRelatedItems,
  type IAutopsyRecordSnapshot,
} from '@hbc/post-bid-autopsy';

export interface IBusinessDevelopmentAutopsyIntegrationContext {
  readonly pursuitRouteBase?: string;
}

export const projectBusinessDevelopmentAutopsyRoutes = (
  record: IAutopsyRecordSnapshot,
  context: IBusinessDevelopmentAutopsyIntegrationContext = {}
) => {
  const base = context.pursuitRouteBase ?? '/business-development/post-bid-learning';

  return {
    detailRoute: `${base}/${record.autopsy.pursuitId}`,
    reviewRoute: `${base}/${record.autopsy.pursuitId}/review`,
    queueRoute: `${base}/${record.autopsy.pursuitId}/queue`,
  } as const;
};

export const createBusinessDevelopmentPostBidLearningReferenceIntegrations = () => ({
  projectRoutes: projectBusinessDevelopmentAutopsyRoutes,
  projectCanvasTasks: projectAutopsyToCanvasTasks,
  projectRelatedItems: projectAutopsyToRelatedItems,
  resolveNotifications: projectAutopsyToNotificationPayloads,
  projectHealthTelemetry: projectAutopsyToHealthIndicatorTelemetry,
});

export type BusinessDevelopmentPostBidLearningReferenceIntegrations =
  ReturnType<typeof createBusinessDevelopmentPostBidLearningReferenceIntegrations>;
