targetScope = 'resourceGroup'

@description('Deployment environment name. Staging is the default rollout for Prompt 03.')
@allowed([
  'staging'
  'prod'
])
param environmentName string

@description('Azure region for resources.')
param location string = resourceGroup().location

@description('Function App name for legacy fallback services.')
param functionAppName string

@description('Storage account for Function host/runtime state.')
@minLength(3)
@maxLength(24)
param hostStorageAccountName string

@description('App Service plan name for Function App hosting.')
param hostingPlanName string

@description('Optional existing App Service plan name to reuse. When set, no plan is created.')
param existingHostingPlanName string = ''

@description('App Service plan SKU name for dedicated hosting.')
param hostingPlanSkuName string = 'B1'

@description('App Service plan SKU tier for dedicated hosting.')
param hostingPlanSkuTier string = 'Basic'

@description('Application Insights component name.')
param applicationInsightsName string

@description('User-assigned managed identity name.')
param userAssignedIdentityName string

@description('Tenant ID used by app-only auth.')
param azureTenantId string

@description('Runtime major version for the Function worker.')
param functionRuntimeVersion string = '22'

@description('Canonical SharePoint tenant URL.')
param sharePointTenantUrl string = 'https://hedrickbrotherscom.sharepoint.com'

@description('Canonical HBCentral site URL.')
param hbCentralSiteUrl string = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral'

@description('Pilot app registration app ID used in this phase.')
param pilotManagedAppClientId string = '08c399eb-a394-4087-b859-659d493f8dc7'

@description('Timer schedule for legacy fallback discovery (six-field cron, UTC).')
param legacyFallbackDiscoveryTimerSchedule string = '0 0 2 * * *'

@description('Minimum cooldown (minutes) between manual reruns.')
param legacyFallbackRerunMinIntervalMinutes int = 30

@description('Anomaly threshold for unmatched + review-required results.')
param legacyFallbackMatchAnomalyThreshold int = 25

@description('Optional Key Vault name (same resource group) for secret access role assignment.')
param keyVaultName string = ''

@description('Blob container name used by Flex deployment storage.')
param deploymentPackageContainerName string = 'legacy-fallback-package'

var storageBlobDataContributor = 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
var storageQueueDataContributor = '974c5e8b-45b9-4653-ba55-5f855dd0fb88'
var storageTableDataContributor = '0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3'
var keyVaultSecretsUser = '4633458b-17de-408a-b874-0445c86b69e6'

resource hostStorage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: hostStorageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: applicationInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    IngestionMode: 'ApplicationInsights'
  }
}

resource hostingPlan 'Microsoft.Web/serverfarms@2022-09-01' = if (empty(existingHostingPlanName)) {
  name: hostingPlanName
  location: location
  sku: {
    name: hostingPlanSkuName
    tier: hostingPlanSkuTier
  }
  kind: 'functionapp'
  properties: {
    reserved: false
  }
}

var serverFarmId = empty(existingHostingPlanName)
  ? hostingPlan.id
  : resourceId('Microsoft.Web/serverfarms', existingHostingPlanName)

resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: userAssignedIdentityName
  location: location
}

resource hostBlobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  name: '${hostStorage.name}/default'
}

resource deploymentPackageContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  name: '${hostStorage.name}/default/${deploymentPackageContainerName}'
  properties: {
    publicAccess: 'None'
  }
}

var deploymentPackageContainerUrl = 'https://${hostStorage.name}.blob.${environment().suffixes.storage}/${deploymentPackageContainerName}'

resource functionApp 'Microsoft.Web/sites@2023-12-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned, UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentity.id}': {}
    }
  }
  properties: {
    serverFarmId: serverFarmId
    httpsOnly: true
    functionAppConfig: {
      deployment: {
        storage: {
          type: 'blobcontainer'
          value: deploymentPackageContainerUrl
          authentication: {
            type: 'userassignedidentity'
            userAssignedIdentityResourceId: userAssignedIdentity.id
            storageAccountConnectionStringName: null
          }
        }
      }
      runtime: {
        name: 'node'
        version: functionRuntimeVersion
      }
      scaleAndConcurrency: {
        maximumInstanceCount: 100
        instanceMemoryMB: 2048
      }
    }
    siteConfig: {
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      linuxFxVersion: ''
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${hostStorage.name};AccountKey=${listKeys(hostStorage.id, hostStorage.apiVersion).keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: appInsights.properties.InstrumentationKey
        }
        {
          name: 'HBC_LEGACY_FALLBACK_ENABLED'
          value: 'true'
        }
        {
          name: 'HBC_LEGACY_FALLBACK_DISCOVERY_ENABLED'
          value: 'true'
        }
        {
          name: 'HBC_LEGACY_FALLBACK_HOSTING_ENV'
          value: environmentName
        }
        {
          name: 'HBC_LEGACY_FALLBACK_FUNCTION_APP_NAME'
          value: functionAppName
        }
        {
          name: 'HBC_LEGACY_FALLBACK_FUNCTION_HOST_URL'
          value: 'https://${functionAppName}.azurewebsites.net'
        }
        {
          name: 'HBC_LEGACY_FALLBACK_HBCENTRAL_SITE_URL'
          value: hbCentralSiteUrl
        }
        {
          name: 'HBC_LEGACY_FALLBACK_AUTH_POSTURE'
          value: 'pilot-interim'
        }
        {
          name: 'HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID'
          value: pilotManagedAppClientId
        }
        {
          name: 'HBC_LEGACY_FALLBACK_GRAPH_SCOPE'
          value: 'https://graph.microsoft.com/.default'
        }
        {
          name: 'HBC_LEGACY_FALLBACK_TARGET_AUTH_MODEL'
          value: 'least-privilege-sites-selected'
        }
        {
          name: 'HBC_LEGACY_FALLBACK_TARGET_AUTH_MODEL_NOTES'
          value: 'Target production posture: Sites.Selected least privilege for source and HBCentral hosts.'
        }
        {
          name: 'HBC_LEGACY_FALLBACK_DISCOVERY_TIMER_ENABLED'
          value: 'false'
        }
        {
          name: 'HBC_LEGACY_FALLBACK_DISCOVERY_TIMER_SCHEDULE'
          value: legacyFallbackDiscoveryTimerSchedule
        }
        {
          name: 'HBC_LEGACY_FALLBACK_MANUAL_RERUN_ENABLED'
          value: 'true'
        }
        {
          name: 'HBC_LEGACY_FALLBACK_RERUN_MIN_INTERVAL_MINUTES'
          value: string(legacyFallbackRerunMinIntervalMinutes)
        }
        {
          name: 'HBC_LEGACY_FALLBACK_MATCH_ANOMALY_THRESHOLD'
          value: string(legacyFallbackMatchAnomalyThreshold)
        }
        {
          name: 'AZURE_TENANT_ID'
          value: azureTenantId
        }
        {
          name: 'AZURE_CLIENT_ID'
          value: userAssignedIdentity.properties.clientId
        }
        {
          name: 'SHAREPOINT_TENANT_URL'
          value: sharePointTenantUrl
        }
      ]
    }
  }
}

resource hostBlobRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(hostStorage.id, userAssignedIdentity.id, storageBlobDataContributor)
  scope: hostStorage
  properties: {
    principalId: userAssignedIdentity.properties.principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageBlobDataContributor)
    principalType: 'ServicePrincipal'
  }
}

resource hostQueueRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(hostStorage.id, userAssignedIdentity.id, storageQueueDataContributor)
  scope: hostStorage
  properties: {
    principalId: userAssignedIdentity.properties.principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageQueueDataContributor)
    principalType: 'ServicePrincipal'
  }
}

resource hostTableRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(hostStorage.id, userAssignedIdentity.id, storageTableDataContributor)
  scope: hostStorage
  properties: {
    principalId: userAssignedIdentity.properties.principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageTableDataContributor)
    principalType: 'ServicePrincipal'
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = if (!empty(keyVaultName)) {
  name: keyVaultName
}

resource keyVaultRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(keyVaultName)) {
  name: guid(keyVault.id, userAssignedIdentity.id, keyVaultSecretsUser)
  scope: keyVault
  properties: {
    principalId: userAssignedIdentity.properties.principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', keyVaultSecretsUser)
    principalType: 'ServicePrincipal'
  }
}

output legacyFallbackFunctionAppName string = functionApp.name
output legacyFallbackFunctionAppHostUrl string = 'https://${functionApp.name}.azurewebsites.net'
output legacyFallbackUserAssignedIdentityClientId string = userAssignedIdentity.properties.clientId
output legacyFallbackUserAssignedIdentityPrincipalId string = userAssignedIdentity.properties.principalId
output legacyFallbackStorageAccountName string = hostStorage.name
output legacyFallbackDeploymentPackageContainer string = deploymentPackageContainer.name
output legacyFallbackApplicationInsightsName string = appInsights.name
