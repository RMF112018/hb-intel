// R1+R2: HB Intel Storage Account Topology
//
// Defines two storage accounts per the approved production topology:
//   hbintelhost{env} — Functions host runtime (AzureWebJobsStorage)
//   hbinteldata{env} — App data tables today, Cosmos DB endpoint tomorrow
//
// Deploy: az deployment group create -g <rg> -f infra/main.bicep -p environmentName=dev functionAppPrincipalId=<principal-id>

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
// Data storage account — App data tables (Cosmos DB migration target)
// ---------------------------------------------------------------------------

resource dataStorage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: 'hbinteldata${environmentName}'
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

// Data RBAC: Table Data Contributor only (app data is tables-only today)

resource dataTableRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(dataStorage.id, functionAppPrincipalId, storageTableDataContributor)
  scope: dataStorage
  properties: {
    principalId: functionAppPrincipalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageTableDataContributor)
    principalType: 'ServicePrincipal'
  }
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

@description('Connection string for AzureWebJobsStorage (host account)')
output hostStorageConnectionString string = 'DefaultEndpointsProtocol=https;AccountName=${hostStorage.name};AccountKey=${hostStorage.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'

@description('Table endpoint URL for AZURE_TABLE_ENDPOINT (data account)')
output dataTableEndpoint string = hostStorage.properties.primaryEndpoints.table == '' ? 'https://${dataStorage.name}.table.${environment().suffixes.storage}' : dataStorage.properties.primaryEndpoints.table
