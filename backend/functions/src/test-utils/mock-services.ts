import { vi, type Mock } from 'vitest';
import type {
  IProjectSetupRequest,
  IProvisioningProgressEvent,
  IProvisioningStatus,
} from '@hbc/models';
import type { IServiceContainer } from '../services/service-factory.js';

/**
 * D-PH6-15 centralized mock factory for provisioning tests.
 * Every external side effect in IServiceContainer is vi.fn-wrapped for deterministic assertions.
 */
export interface IMockServices extends IServiceContainer {
  sharePoint: {
    createSite: Mock;
    siteExists: Mock;
    deleteSite: Mock;
    createDocumentLibrary: Mock;
    documentLibraryExists: Mock;
    uploadTemplateFiles: Mock;
    createDataLists: Mock;
    listExists: Mock;
    installWebParts: Mock;
    setGroupPermissions: Mock;
    associateHubSite: Mock;
    isHubAssociated: Mock;
    disassociateHubSite: Mock;
    writeAuditRecord: Mock;
    applyWebParts: Mock;
    setPermissions: Mock;
    associateHub: Mock;
    removeHubAssociation: Mock;
    assignGroupToPermissionLevel: Mock;
    uploadTemplateFile: Mock;
    createFolderIfNotExists: Mock;
    fileExists: Mock;
  };
  tableStorage: {
    upsertProvisioningStatus: Mock;
    getProvisioningStatus: Mock;
    getLatestRun: Mock;
    listFailedRuns: Mock;
    listPendingStep5Jobs: Mock;
    getAllPendingFullSpec: Mock;
    escalateProvisioning: Mock;
    listAllRuns: Mock;
  };
  redisCache: {
    get: Mock;
    set: Mock;
    delete: Mock;
    has: Mock;
  };
  signalR: {
    pushProvisioningProgress: Mock;
    addConnectionToGroup: Mock;
    closeGroup: Mock;
  };
  msalObo: {
    getSharePointToken: Mock;
    acquireTokenOnBehalfOf: Mock;
  };
  projectRequests: {
    upsertRequest: Mock;
    getRequest: Mock;
    listRequests: Mock;
  };
  graph: {
    createSecurityGroup: Mock;
    addGroupMembers: Mock;
    getGroupByDisplayName: Mock;
    grantSiteAccess: Mock;
  };
  notifications: {
    send: Mock;
  };
}

/**
 * D-PH6-15 test utility entrypoint.
 * Defaults are no-op success responses to keep tests focused on per-scenario behavior.
 */
export function createMockServices(): IMockServices {
  const services: IMockServices = {
    sharePoint: {
      createSite: vi.fn(async (_projectId: string, projectNumber: string, _projectName: string) =>
        `https://hbconstruction.sharepoint.com/sites/${projectNumber.toLowerCase()}`
      ),
      siteExists: vi.fn(async (_projectId: string) => null),
      deleteSite: vi.fn(async (_siteUrl: string) => {}),
      createDocumentLibrary: vi.fn(async (_siteUrl: string, _libraryName: string) => {}),
      documentLibraryExists: vi.fn(async (_siteUrl: string, _libraryName: string) => false),
      uploadTemplateFiles: vi.fn(async (_siteUrl: string, _libraryName: string) => {}),
      createDataLists: vi.fn(async (_siteUrl: string, _listDefinitions: unknown[]) => {}),
      listExists: vi.fn(async (_siteUrl: string, _listTitle: string) => false),
      installWebParts: vi.fn(async (_siteUrl: string) => {}),
      setGroupPermissions: vi.fn(async (_siteUrl: string, _memberUpns: string[], _opexUpn: string) => {}),
      associateHubSite: vi.fn(async (_siteUrl: string, _hubSiteId: string) => {}),
      isHubAssociated: vi.fn(async (_siteUrl: string) => false),
      disassociateHubSite: vi.fn(async (_siteUrl: string) => {}),
      writeAuditRecord: vi.fn(async (_record: unknown) => {}),
      applyWebParts: vi.fn(async (_siteUrl: string) => {}),
      setPermissions: vi.fn(async (_siteUrl: string, _projectId: string) => {}),
      associateHub: vi.fn(async (_siteUrl: string, _hubSiteUrl: string) => {}),
      removeHubAssociation: vi.fn(async (_siteUrl: string) => {}),
      assignGroupToPermissionLevel: vi.fn(async (_siteUrl: string, _groupId: string, _level: string) => {}),
      uploadTemplateFile: vi.fn(async () => true),
      createFolderIfNotExists: vi.fn(async () => {}),
      fileExists: vi.fn(async () => false),
    },
    graph: {
      createSecurityGroup: vi.fn(async (_displayName: string, _description: string) => 'mock-group-id'),
      addGroupMembers: vi.fn(async (_groupId: string, _memberUpns: string[]) => {}),
      getGroupByDisplayName: vi.fn(async (_displayName: string) => null),
      grantSiteAccess: vi.fn(async () => {}),
    },
    notifications: {
      send: vi.fn(async () => {}),
    },
    tableStorage: {
      upsertProvisioningStatus: vi.fn(async (_status: IProvisioningStatus) => {}),
      getProvisioningStatus: vi.fn(async (_projectId: string) => null),
      getLatestRun: vi.fn(async (_projectId: string) => null),
      listFailedRuns: vi.fn(async () => []),
      listPendingStep5Jobs: vi.fn(async () => []),
      getAllPendingFullSpec: vi.fn(async () => []),
      escalateProvisioning: vi.fn(async (_projectId: string, _escalatedBy: string) => {}),
      listAllRuns: vi.fn(async (_status?: string) => []),
    },
    redisCache: {
      get: vi.fn(async (_key: string) => null),
      set: vi.fn(async (_key: string, _value: unknown, _ttlSeconds?: number) => {}),
      delete: vi.fn(async (_key: string) => {}),
      has: vi.fn(async (_key: string) => false),
    },
    signalR: {
      pushProvisioningProgress: vi.fn(async (_event: IProvisioningProgressEvent) => {}),
      addConnectionToGroup: vi.fn(async (_connectionId: string, _projectId: string, _isAdmin: boolean) => {}),
      closeGroup: vi.fn(async (_projectId: string) => {}),
    },
    msalObo: {
      getSharePointToken: vi.fn(async (_siteUrl: string) => 'mock-sp-token'),
      acquireTokenOnBehalfOf: vi.fn(async (_userToken: string, _scopes: string[]) => 'mock-obo-token'),
    },
    projectRequests: {
      upsertRequest: vi.fn(async (_request: IProjectSetupRequest) => {}),
      getRequest: vi.fn(async (_requestId: string) => null),
      listRequests: vi.fn(async (_state?: string) => []),
    },
  };

  return services;
}
