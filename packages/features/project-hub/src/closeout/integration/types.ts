/**
 * P3-E10-T10 Lane Ownership and Shared Package Reuse TypeScript contracts.
 */

import type { CloseoutLaneCapability, CloseoutPackageLayer, CloseoutSharedPackage, CloseoutSpineContract, CloseoutSurfaceTarget } from './enums.js';

export interface ICloseoutPackageIdentity {
  readonly path: string;
  readonly name: string;
  readonly layer: CloseoutPackageLayer;
}

export interface ICloseoutPackageContent {
  readonly item: string;
  readonly contents: string;
}

export interface ICloseoutExternalOwnership {
  readonly content: string;
  readonly correctOwner: string;
}

export interface ISurfaceClassification {
  readonly subSurface: string;
  readonly pwaTarget: string;
  readonly spfxTarget: string;
  readonly notes: string;
}

export interface ISPFxConstraint {
  readonly constraint: string;
  readonly rule: string;
}

export interface IPWAFeature {
  readonly feature: string;
  readonly rule: string;
}

export interface IRelatedItemsPair {
  readonly relationship: string;
  readonly source: string;
  readonly target: string;
  readonly items: string;
  readonly behavior: string;
}

export interface IVersionedRecordContract {
  readonly record: string;
  readonly versionedFields: string;
}

export interface IAnnotationAttachmentPoint {
  readonly entityType: string;
  readonly description: string;
}

export interface IWorkflowHandoffTrigger {
  readonly trigger: string;
  readonly from: string;
  readonly to: string;
  readonly recordAdvanced: string;
}

export interface IAcknowledgmentUseCase {
  readonly useCase: string;
  readonly parties: string;
  readonly trigger: string;
}

export interface IBICPrompt {
  readonly prompt: string;
  readonly trigger: string;
  readonly targetUser: string;
}

export interface INotificationContract {
  readonly notification: string;
  readonly trigger: string;
  readonly channel: string;
}

export interface ISpinePublicationContract {
  readonly spine: CloseoutSpineContract;
  readonly packageName: string;
  readonly eventsEmitted: string;
  readonly frequency: string;
}

export interface IProhibitedDependency {
  readonly importPackage: string;
  readonly reason: string;
}

export interface ILaneCapabilityEntry {
  readonly lane: CloseoutLaneCapability;
  readonly capability: string;
  readonly notes: string;
}
