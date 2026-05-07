# Scorecard-to-Evidence Traceability

## Pillar Mapping

| Pillar | Name                                                             | Weight | Primary EV IDs                                                                                                                      |
| ------ | ---------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| P1     | PCC Product Strategy and Command-Center Clarity                  | 15     | EV-37, EV-38, EV-40, EV-48, EV-83, EV-84, EV-90, EV-92, EV-93, EV-125, EV-133                                                       |
| P2     | Construction-Tech Mold Breaker Differentiation                   | 20     | EV-48, EV-50, EV-83, EV-84, EV-87, EV-90, EV-91, EV-92, EV-99, EV-106, EV-125, EV-126, EV-134                                       |
| P3     | Shell, Navigation, and Project Context                           | 12     | EV-52, EV-53, EV-55, EV-72, EV-73, EV-74, EV-75, EV-83, EV-90, EV-91, EV-133                                                        |
| P4     | Layout, Bento, Card Hierarchy, and Density                       | 12     | EV-37, EV-38, EV-39, EV-48, EV-49, EV-59, EV-60, EV-61, EV-62, EV-63, EV-64, EV-65, EV-66, EV-69, EV-70, EV-134                     |
| P5     | Workflow, Interaction, and Next-Action Clarity                   | 12     | EV-83, EV-84, EV-85, EV-86, EV-88, EV-89, EV-90, EV-91, EV-92, EV-93                                                                |
| P6     | State Model, Read-Only, Preview, Degraded, and Source Confidence | 10     | EV-51, EV-56, EV-85, EV-86, EV-87, EV-94, EV-95, EV-96, EV-97, EV-98, EV-99, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106 |
| P7     | Responsive, Field, Touch, and Host-Fit Behavior                  | 8      | EV-52, EV-57, EV-59, EV-60, EV-61, EV-62, EV-63, EV-64, EV-65, EV-66, EV-67, EV-68, EV-69, EV-70, EV-71                             |
| P8     | Accessibility, Visual Semantics, and Inclusive Use               | 6      | EV-72, EV-73, EV-74, EV-75, EV-76, EV-77, EV-78, EV-79, EV-80, EV-81, EV-82                                                         |
| P9     | Evidence, Validation, and Phase 4 Readiness                      | 5      | EV-37, EV-52, EV-54, EV-58, EV-75, EV-77, EV-125, EV-126, EV-127, EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134            |

## Hard-Stop Mapping

| Hard Stop | Failure                         | Evidence / Pillar Refs                                                                               |
| --------- | ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| HS-01     | Incumbent mimicry failure       | P2, EV-48, EV-83, EV-84, EV-90, EV-125, EV-134                                                       |
| HS-02     | Command-center failure          | P1, EV-38, EV-40, EV-83, EV-84, EV-125                                                               |
| HS-03     | Cognitive-overload failure      | P2, P4, EV-37, EV-39, EV-48, EV-49, EV-70                                                            |
| HS-04     | False-affordance failure        | P5, P6, EV-85, EV-86, EV-87, EV-88, EV-89, EV-100, EV-101                                            |
| HS-05     | Field-office divergence failure | P7, EV-59, EV-60, EV-61, EV-62, EV-63, EV-64, EV-65, EV-66, EV-67, EV-68, EV-71                      |
| HS-06     | State-model failure             | P6, EV-94, EV-95, EV-96, EV-97, EV-98, EV-99, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106 |
| HS-07     | Accessibility failure           | P8, EV-72, EV-73, EV-74, EV-75, EV-76, EV-77, EV-78, EV-79, EV-80, EV-81, EV-82                      |
| HS-08     | SharePoint host-fit failure     | P3, P7, EV-52, EV-53, EV-54, EV-57, EV-58, EV-69                                                     |
| HS-09     | Evidence failure                | P9, EV-37, EV-52, EV-54, EV-58, EV-125, EV-134                                                       |
| HS-10     | HBI authority failure           | P2, P6, EV-90, EV-99, EV-100, EV-105, EV-106                                                         |

## Implementation Requirement

The code agent must implement a scorecard map module:

```ts
export const PCC_SCORECARD_PILLARS = [...]
export const PCC_HARD_STOPS = [...]
export const PCC_EV_TO_PILLAR_MAP = [...]
```

The final report must show whether evidence exists for every pillar and hard stop.
