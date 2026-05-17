export {
  classifyNotificationSource,
  groupNotificationsBySourceKind,
  type IClassificationOutcome,
  type IGroupedNotifications,
  type IParsedNotification,
} from './projection-webhook-classifier.js';

export {
  createProjectionSyncMessageSender,
  type IProjectionSyncMessageSender,
  type IProjectionSyncMessageSenderOptions,
  type IProjectionSyncMessageSendOutcome,
  type IServiceBusClientLike,
  type IServiceBusSenderLike,
  type ProjectionSyncMessageSendFailureCode,
} from './projection-sync-message-sender.js';

export {
  handleProjectionGraphWebhook,
  type IProjectionSubscriptionStateLister,
  type IProjectionWebhookHandlerDeps,
} from './projection-webhook-handler.js';
