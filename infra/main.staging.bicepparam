using 'main.bicep'

param environmentName = 'staging'

// Replace with the Object (principal) ID of the staging Function App's system-assigned Managed Identity.
// Find via: az functionapp identity show -g <rg> -n <func-app-name> --query principalId -o tsv
param functionAppPrincipalId = '<staging-function-app-principal-id>'
