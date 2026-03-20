using 'main.bicep'

param environmentName = 'prod'

// Replace with the Object (principal) ID of the production Function App's system-assigned Managed Identity.
// Find via: az functionapp identity show -g <rg> -n <func-app-name> --query principalId -o tsv
param functionAppPrincipalId = '<prod-function-app-principal-id>'
