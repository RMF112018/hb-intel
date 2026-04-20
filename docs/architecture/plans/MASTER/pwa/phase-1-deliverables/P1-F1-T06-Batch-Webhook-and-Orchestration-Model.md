# P1-F1-T06: Batch, Webhook, and Orchestration Model

## 1. Default Orchestration Rule

Batch-led sync is the default orchestration model for the native integration backbone.

Events and webhooks are assistive accelerators where official source material supports them. They do not replace the need for batch, replay, and operator-driven recovery.

## 2. Governing Flow

The governing orchestration model is:

1. scheduled or operator-triggered batch pull,
2. optional webhook or event signal,
3. acquisition and raw custody,
4. normalization,
5. mapping and reconciliation,
6. publication of read models,
7. replay or retry where failures or corrections require it.

## 3. Connector Eligibility Categories

Every connector family must classify itself into one of these categories:

- **Batch only**
- **Batch plus event/webhook assist**
- **Event contract unresolved from official source set**

## 4. Current Family-Level Classification

Based on the completed audit and supplied official source set:

| Connector group | Current orchestration posture |
|---|---|
| BambooHR | Batch plus event/webhook assist is supportable at capability level from supplied docs |
| Microsoft 365 Graph Content | Batch plus delta/event assist is supportable at capability level from supplied docs |
| Procore | Event/webhook specifics unresolved from supplied source set; batch-led default |
| Sage Intacct | Batch-led default in this umbrella family |
| Unanet CRM | Event contract unresolved from accessible official content |
| Autodesk BuildingConnected / TradeTapp | Event contract unresolved from supplied overview pages |
| Autodesk ACC Core / Advanced Governance | Event contract unresolved from supplied overview/blog pages |
| Oracle Primavera | Batch-led default in this umbrella family |
| Microsoft 365 Graph Work-Orchestration | Exact event/work-orchestration contract unresolved from supplied source set |

## 5. Retry and Replay Posture

Batch-led architecture exists so the platform can:

- recover from missed webhooks,
- backfill new publication logic,
- support replay after mapping or normalization changes,
- avoid making webhook availability the only correctness path.

## 6. Official-Source Discipline

Connector-family files must derive exact contract shapes from official source material. No route, webhook, or event contract may be invented from memory.
