// R8: Alert rules and action group for HB Intel operational monitoring.
//
// Defines 4 alert rules scoped to implemented telemetry events (P1-C3 §2.3):
//   1. Auth failure burst (Sev 1) — auth.bearer.error > 3 in 1 min
//   2. Handler error rate (Sev 2) — handler.error > 10 in 5 min
//   3. Provisioning saga failure (Sev 2) — ProvisioningSagaFailed > 0 in 1 min
//   4. Timer function failure (Sev 2) — timer error events > 0 in 5 min
//
// Not included (blocked/unimplemented): proxy.request.error, circuit.state.change, auth.obo.error
//
// Deploy alongside main.bicep:
//   az deployment group create -g <rg> -f infra/monitoring.bicep -p environmentName=prod appInsightsResourceId=<resource-id> actionGroupEmail=<email>

@description('Environment suffix for resource naming')
param environmentName string

@description('Full resource ID of the Application Insights instance')
param appInsightsResourceId string

@description('Email address for alert notifications')
param actionGroupEmail string

@description('Azure region; defaults to the resource group location')
param location string = resourceGroup().location

// ---------------------------------------------------------------------------
// Action Group
// ---------------------------------------------------------------------------

resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'ag-hbintel-${environmentName}'
  location: 'global'
  properties: {
    groupShortName: 'HBIntel'
    enabled: true
    emailReceivers: [
      {
        name: 'PlatformOps'
        emailAddress: actionGroupEmail
        useCommonAlertSchema: true
      }
    ]
    // Teams Workflow (Power Automate) integration: add a webhookReceivers entry
    // once the Teams Workflow URL is provisioned. See operational-runbook.md §Escalation.
  }
}

// ---------------------------------------------------------------------------
// Alert 1: Auth failure burst (Sev 1, P1-C3 §2.3.2 rule 3)
// ---------------------------------------------------------------------------

resource authFailureAlert 'Microsoft.Insights/scheduledQueryRules@2023-03-15-preview' = {
  name: 'alert-auth-failure-burst-${environmentName}'
  location: location
  properties: {
    displayName: 'Auth Failure Burst'
    description: 'More than 3 auth.bearer.error events in 1 minute — possible auth misconfiguration or attack.'
    severity: 1
    enabled: true
    evaluationFrequency: 'PT1M'
    windowSize: 'PT1M'
    scopes: [appInsightsResourceId]
    criteria: {
      allOf: [
        {
          query: 'traces | where message has "auth.bearer.error" or customDimensions._telemetryType == "customEvent" and name == "auth.bearer.error" | summarize count() by bin(timestamp, 1m)'
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 3
          failingPeriods: {
            numberOfEvaluationPeriods: 1
            minFailingPeriodsToAlert: 1
          }
        }
      ]
    }
    actions: {
      actionGroups: [actionGroup.id]
    }
  }
}

// ---------------------------------------------------------------------------
// Alert 2: Handler error rate (Sev 2, P1-C3 §2.3.2 rule 1 adapted)
// ---------------------------------------------------------------------------

resource handlerErrorAlert 'Microsoft.Insights/scheduledQueryRules@2023-03-15-preview' = {
  name: 'alert-handler-error-rate-${environmentName}'
  location: location
  properties: {
    displayName: 'Handler Error Rate Elevated'
    description: 'More than 10 handler.error events in 5 minutes — elevated backend failure rate.'
    severity: 2
    enabled: true
    evaluationFrequency: 'PT5M'
    windowSize: 'PT5M'
    scopes: [appInsightsResourceId]
    criteria: {
      allOf: [
        {
          query: 'traces | where customDimensions._telemetryType == "customEvent" and name == "handler.error" | summarize count() by bin(timestamp, 5m)'
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 10
          failingPeriods: {
            numberOfEvaluationPeriods: 1
            minFailingPeriodsToAlert: 1
          }
        }
      ]
    }
    actions: {
      actionGroups: [actionGroup.id]
    }
  }
}

// ---------------------------------------------------------------------------
// Alert 3: Provisioning saga failure (Sev 2, P1-C3 §2.3.2 rule 4)
// ---------------------------------------------------------------------------

resource sagaFailureAlert 'Microsoft.Insights/scheduledQueryRules@2023-03-15-preview' = {
  name: 'alert-provisioning-saga-failure-${environmentName}'
  location: location
  properties: {
    displayName: 'Provisioning Saga Failure'
    description: 'A provisioning saga entered the failure/compensation path — project site setup did not complete.'
    severity: 2
    enabled: true
    evaluationFrequency: 'PT1M'
    windowSize: 'PT1M'
    scopes: [appInsightsResourceId]
    criteria: {
      allOf: [
        {
          query: 'traces | where customDimensions._telemetryType == "customEvent" and name == "ProvisioningSagaFailed" | summarize count() by bin(timestamp, 1m)'
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 0
          failingPeriods: {
            numberOfEvaluationPeriods: 1
            minFailingPeriodsToAlert: 1
          }
        }
      ]
    }
    actions: {
      actionGroups: [actionGroup.id]
    }
  }
}

// ---------------------------------------------------------------------------
// Alert 4: Timer function failure (Sev 2)
// ---------------------------------------------------------------------------

resource timerFailureAlert 'Microsoft.Insights/scheduledQueryRules@2023-03-15-preview' = {
  name: 'alert-timer-function-failure-${environmentName}'
  location: location
  properties: {
    displayName: 'Timer Function Failure'
    description: 'Nightly Step 5 provisioning timer or idempotency cleanup encountered an error.'
    severity: 2
    enabled: true
    evaluationFrequency: 'PT5M'
    windowSize: 'PT5M'
    scopes: [appInsightsResourceId]
    criteria: {
      allOf: [
        {
          query: 'traces | where customDimensions._telemetryType == "customEvent" and (name == "ProvisioningTimerJobFailed" or name == "idempotency.cleanup.error") | summarize count() by bin(timestamp, 5m)'
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 0
          failingPeriods: {
            numberOfEvaluationPeriods: 1
            minFailingPeriodsToAlert: 1
          }
        }
      ]
    }
    actions: {
      actionGroups: [actionGroup.id]
    }
  }
}
