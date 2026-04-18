using './legacy-fallback-hosting.bicep'

param environmentName = 'prod'
param location = 'eastus2'

param functionAppName = 'func-hbintel-legacy-fallback-prod'
param hostStorageAccountName = 'hblegacyfbprod'
param hostingPlanName = 'asp-hbintel-legacy-fallback-prod'
param existingHostingPlanName = ''
param hostingPlanSkuName = 'FC1'
param hostingPlanSkuTier = 'FlexConsumption'
param applicationInsightsName = 'appi-hbintel-legacy-fallback-prod'
param userAssignedIdentityName = 'id-hbintel-legacy-fallback-prod'

// Tenant ID remains environment controlled; no secrets are stored in source control.
param azureTenantId = '0e834bd7-628b-42c8-b9ec-ecebc9719be4'
param sharePointTenantUrl = 'https://hedrickbrotherscom.sharepoint.com'
param hbCentralSiteUrl = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral'

// Optional: set to an existing Key Vault name in the same resource group.
param keyVaultName = ''
