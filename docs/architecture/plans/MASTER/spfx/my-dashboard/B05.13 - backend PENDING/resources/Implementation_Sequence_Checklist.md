# Implementation Sequence Checklist

## Stage 0 — Scope lock
- [ ] Execute Prompt 00
- [ ] Confirm repo truth matches package assumptions
- [ ] Record any drift blockers

## Stage 1 — Code scaffolding and list contract
- [ ] Execute Prompt 01
- [ ] Execute Prompt 02
- [ ] Projection config/types added
- [ ] Helper-list descriptor/provisioning scripts added
- [ ] Schema verification tests passing

## Stage 2 — State store and queue ingress
- [ ] Execute Prompt 03
- [ ] Execute Prompt 04
- [ ] Azure Table repositories implemented
- [ ] Webhook route implemented
- [ ] Service Bus sender implemented
- [ ] Service Bus dependency added

## Stage 3 — Graph change tracking
- [ ] Execute Prompt 05
- [ ] Execute Prompt 06
- [ ] Subscription manager implemented
- [ ] Renewal timer implemented
- [ ] Delta client implemented
- [ ] Queue worker implemented
- [ ] 410 resync handling implemented

## Stage 4 — Projection engine and controls
- [ ] Execute Prompt 07
- [ ] Execute Prompt 08
- [ ] Shared domain extraction completed
- [ ] Slice recompute engine implemented
- [ ] Seed/rebuild/admin endpoints implemented
- [ ] CLI/operator scripts implemented

## Stage 5 — Projection read provider and telemetry
- [ ] Execute Prompt 09
- [ ] Execute Prompt 10
- [ ] Projection read provider implemented
- [ ] Read-mode flag implemented
- [ ] Parity harness implemented
- [ ] Telemetry and docs implemented

## Stage 6 — Azure/SharePoint operator provisioning
- [ ] Execute Prompt 11
- [ ] Provision Service Bus Standard namespace
- [ ] Provision queue
- [ ] Provision operational storage account
- [ ] Create state tables
- [ ] Assign UAMI Service Bus sender/receiver roles
- [ ] Assign UAMI Storage Table Data Contributor
- [ ] Add Function App app settings
- [ ] Provision My Projects Registry list
- [ ] Break list inheritance and apply permissions

## Stage 7 — Permission grant and live validation
- [ ] Confirm `Sites.Read.All` Application grant
- [ ] Execute Prompt 12
- [ ] Live subscription create succeeds
- [ ] Webhook validation-token handshake succeeds
- [ ] Delta `token=latest` checkpoint succeeds
- [ ] Controlled source-list edit propagates to helper rows

## Stage 8 — Cutover
- [ ] Execute Prompt 13
- [ ] Seed helper list
- [ ] Selected-user parity clean
- [ ] Switch read mode to `projection`
- [ ] Monitor App Insights + Service Bus
- [ ] Verify rollback readiness

## Stage 9 — Staged admin UI
- [ ] Execute Prompt 14 after backend stability
- [ ] UI admin control surface implemented or planned closeout recorded
