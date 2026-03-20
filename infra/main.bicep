// R1+R2+R4: HB Intel Storage and Cosmos DB Topology
//
// Defines the production infrastructure:
//   hbintelhost{env}        — Azure Storage for Functions host runtime (AzureWebJobsStorage)
//   hbintel-table-{env}     — Cosmos DB (Table API, serverless) for app data (AZURE_TABLE_ENDPOINT)
//
// Deploy (staging): az deployment group create -g <rg> -f infra/main.bicep -p infra/main.staging.bicepparam
// Deploy (prod):    az deployment group create -g <rg> -f infra/main.bicep -p infra/main.prod.bicepparam

@description('Environment suffix for resource naming (dev, staging, prod)')
param environmentName string

@description('Azure region; defaults to the resource group location')
param location string = resourceGroup().location

@description('Object (principal) ID of the Function App Managed Identity for RBAC assignments')
param functionAppPrincipalId string

// ---------------------------------------------------------------------------
// Built-in RBAC role definition IDs
// ---------------------------------------------------------------------------

var storageBlobDataContributor = 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
var storageQueueDataContributor = '974c5e8b-45b9-4653-ba55-5f855dd0fb88'
var storageTableDataContributor = '0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3'

// ---------------------------------------------------------------------------
// Host storage account — Functions runtime only
// ---------------------------------------------------------------------------

resource hostStorage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: 'hbintelhost${environmentName}'
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

// Host RBAC: Blob + Queue + Table Data Contributor (all three required by Functions host)

resource hostBlobRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(hostStorage.id, functionAppPrincipalId, storageBlobDataContributor)
  scope: hostStorage
  properties: {
    principalId: functionAppPrincipalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageBlobDataContributor)
    principalType: 'ServicePrincipal'
  }
}

resource hostQueueRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(hostStorage.id, functionAppPrincipalId, storageQueueDataContributor)
  scope: hostStorage
  properties: {
    principalId: functionAppPrincipalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageQueueDataContributor)
    principalType: 'ServicePrincipal'
  }
}

resource hostTableRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(hostStorage.id, functionAppPrincipalId, storageTableDataContributor)
  scope: hostStorage
  properties: {
    principalId: functionAppPrincipalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageTableDataContributor)
    principalType: 'ServicePrincipal'
  }
}

// ---------------------------------------------------------------------------
// Cosmos DB account — App data via Table API (R3: serverless, single-region)
// ---------------------------------------------------------------------------

// Cosmos DB Built-in Data Contributor role (read/write data plane access)
var cosmosDbBuiltInDataContributor = '00000000-0000-0000-0000-000000000002'

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: 'hbintel-table-${environmentName}'
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    capabilities: [
      { name: 'EnableTable' }
      { name: 'EnableServerless' }
    ]
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
  }
}

// Cosmos DB RBAC: Built-in Data Contributor for Managed Identity

resource cosmosDbDataRole 'Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2023-04-15' = {
  name: guid(cosmosDbAccount.id, functionAppPrincipalId, cosmosDbBuiltInDataContributor)
  parent: cosmosDbAccount
  properties: {
    principalId: functionAppPrincipalId
    roleDefinitionId: '${cosmosDbAccount.id}/sqlRoleDefinitions/${cosmosDbBuiltInDataContributor}'
    scope: cosmosDbAccount.id
  }
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

@description('Host storage account name — set as app setting AzureWebJobsStorage__accountName')
output hostStorageAccountName string = hostStorage.name

@description('Host storage blob endpoint — set as app setting AzureWebJobsStorage__serviceUri')
output hostStorageBlobEndpoint string = hostStorage.properties.primaryEndpoints.blob

@description('Cosmos DB Table API endpoint URL for AZURE_TABLE_ENDPOINT')
output dataTableEndpoint string = 'https://${cosmosDbAccount.name}.table.cosmos.azure.com'
