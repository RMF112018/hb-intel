# Evidence Registry EV-37 through EV-106 and EV-125 through EV-134

| EV ID  | Evidence Item                                       | Category                  |
| ------ | --------------------------------------------------- | ------------------------- |
| EV-37  | Full-page screenshot evidence for every PCC surface | Visual surface evidence   |
| EV-38  | Above-the-fold screenshot evidence                  | Visual surface evidence   |
| EV-39  | Full-scroll screenshot evidence                     | Visual surface evidence   |
| EV-40  | Project Home screenshot evidence                    | Surface evidence          |
| EV-41  | Project Readiness screenshot evidence               | Surface evidence          |
| EV-42  | Documents screenshot evidence                       | Surface evidence          |
| EV-43  | External Platforms screenshot evidence              | Surface evidence          |
| EV-44  | Approvals screenshot evidence                       | Surface evidence          |
| EV-45  | Team & Access screenshot evidence                   | Surface evidence          |
| EV-46  | Site Health screenshot evidence                     | Surface evidence          |
| EV-47  | Settings screenshot evidence                        | Surface evidence          |
| EV-48  | Cross-surface visual consistency evidence           | Visual consistency        |
| EV-49  | Card hierarchy screenshot evidence                  | Layout/card hierarchy     |
| EV-50  | Status/severity screenshot evidence                 | Visual semantics          |
| EV-51  | Empty/error/degraded visual evidence                | State model               |
| EV-52  | SharePoint-hosted runtime screenshot evidence       | Host runtime              |
| EV-53  | SharePoint chrome boundary evidence                 | Host runtime              |
| EV-54  | Tenant-hosted console evidence                      | Runtime quality           |
| EV-55  | Tenant-hosted navigation evidence                   | Navigation                |
| EV-56  | Tenant-hosted state rendering evidence              | State model               |
| EV-57  | SharePoint edit-mode evidence                       | Host authoring            |
| EV-58  | Package/version evidence                            | Build/version proof       |
| EV-59  | Desktop breakpoint evidence                         | Responsive                |
| EV-60  | Large laptop breakpoint evidence                    | Responsive                |
| EV-61  | Standard laptop breakpoint evidence                 | Responsive                |
| EV-62  | Small laptop breakpoint evidence                    | Responsive                |
| EV-63  | Tablet landscape evidence                           | Responsive/touch          |
| EV-64  | Tablet portrait evidence                            | Responsive/touch          |
| EV-65  | Phone-width evidence                                | Responsive/mobile posture |
| EV-66  | Short-height viewport evidence                      | Responsive/height         |
| EV-67  | High-zoom evidence                                  | Accessibility/responsive  |
| EV-68  | Constrained SharePoint canvas evidence              | Host fit                  |
| EV-69  | Overflow / clipping evidence                        | Host fit                  |
| EV-70  | Bento direct-child / row-span visual evidence       | Layout stability          |
| EV-71  | Touch-density evidence                              | Touch/field               |
| EV-72  | Keyboard navigation evidence                        | Accessibility             |
| EV-73  | Focus order evidence                                | Accessibility             |
| EV-74  | Focus-visible evidence                              | Accessibility             |
| EV-75  | ARIA / semantic relationship evidence               | Accessibility             |
| EV-76  | Screen-reader label evidence                        | Accessibility             |
| EV-77  | Contrast evidence                                   | Accessibility             |
| EV-78  | Color-independent status evidence                   | Accessibility             |
| EV-79  | Reduced-motion evidence                             | Accessibility             |
| EV-80  | Hover-only behavior evidence                        | Accessibility             |
| EV-81  | Touch target evidence                               | Accessibility/touch       |
| EV-82  | Drawer / modal focus management evidence            | Accessibility/interaction |
| EV-83  | Primary-action clarity evidence                     | Workflow                  |
| EV-84  | Priority-action evidence                            | Workflow                  |
| EV-85  | Disabled-control evidence                           | Workflow/state            |
| EV-86  | Read-only workflow evidence                         | Workflow/state            |
| EV-87  | Preview/deferred workflow evidence                  | Workflow/state            |
| EV-88  | Launch/action behavior evidence                     | Workflow                  |
| EV-89  | Queue/workflow behavior evidence                    | Workflow                  |
| EV-90  | Command/search/HBI behavior evidence                | Command intelligence      |
| EV-91  | Navigation path evidence                            | Workflow/navigation       |
| EV-92  | Cross-module relationship evidence                  | Lifecycle continuity      |
| EV-93  | Responsibility / owner evidence                     | Construction operations   |
| EV-94  | Loading state evidence                              | State model               |
| EV-95  | Empty state evidence                                | State model               |
| EV-96  | Error state evidence                                | State model               |
| EV-97  | Blocked state evidence                              | State model               |
| EV-98  | Degraded state evidence                             | State model               |
| EV-99  | Preview state evidence                              | State model               |
| EV-100 | Read-only state evidence                            | State model               |
| EV-101 | Deferred state evidence                             | State model               |
| EV-102 | Unauthorized / no-access state evidence             | State model               |
| EV-103 | Missing-configuration state evidence                | State model               |
| EV-104 | Stale-data / freshness evidence                     | State model               |
| EV-105 | Source-of-record evidence                           | Source confidence         |
| EV-106 | Mock / fixture / demo-data evidence                 | Source confidence         |
| EV-125 | Project Home evidence block                         | Surface evidence block    |
| EV-126 | Project Readiness evidence block                    | Surface evidence block    |
| EV-127 | Documents evidence block                            | Surface evidence block    |
| EV-128 | External Platforms evidence block                   | Surface evidence block    |
| EV-129 | Approvals evidence block                            | Surface evidence block    |
| EV-130 | Team & Access evidence block                        | Surface evidence block    |
| EV-131 | Site Health evidence block                          | Surface evidence block    |
| EV-132 | Settings evidence block                             | Surface evidence block    |
| EV-133 | Shell / navigation evidence block                   | System evidence block     |
| EV-134 | Shared primitive evidence block                     | System evidence block     |

## Required Fields Per Evidence Record

```ts
type PccEvidenceRecord = {
  evidenceId: string;
  title: string;
  status:
    | 'captured'
    | 'asserted'
    | 'partially-captured'
    | 'operator-pending'
    | 'expert-review-required'
    | 'not-automatable-current-host'
    | 'blocked'
    | 'failed';
  pillarRefs: string[];
  hardStopRefs: string[];
  surface?: string;
  viewport?: string;
  artifactPaths: string[];
  assertions: string[];
  reviewerNotes: string[];
  timestamp: string;
};
```

## Coverage Rule

Every EV ID must appear in the final manifest. Missing IDs are a test failure.
