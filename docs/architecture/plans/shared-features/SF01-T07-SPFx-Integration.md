# SF01-T07: SPFx Integration

**Package:** `@hbc/sharepoint-docs`
**Wave:** 3 — UI & Integration
**Estimated effort:** 0.5 sprint-weeks
**Prerequisite tasks:** SF01-T01 through SF01-T06
**Unlocks:** SF01-T09 (E2E tests run against the SPFx surface)
**Governed by:** CLAUDE.md v1.2 §3, §6.1 (UI Kit dual entry-point), §SPFx Constraints; Interview decision D-09

---

## 1. Objective

Wire `@hbc/sharepoint-docs` components into two SPFx surfaces per D-09:

1. **Inline integration** — the document panel appears as a collapsible section inside the BD Scorecard and Estimating Pursuit webparts, lazy-loaded on first interaction
2. **Standalone `HBCDocumentManagerWebpart`** — a separate, independently deployable SPFx webpart for page editors who need layout flexibility

Both surfaces use `@hbc/ui-kit/app-shell` (not `@hbc/ui-kit`) per CLAUDE.md §6.1.

---

## 2. SPFx Bundle Strategy

### Lazy Loading

The full document package must not load on page load — it is lazy-loaded the first time the user opens the "Documents" panel in a record webpart. This keeps the host webpart's initial bundle under the SPFx recommended 1 MB budget.

```typescript
// Inside BDScorecardWebpart or EstimatingPursuitWebpart
const { HbcDocumentAttachment, HbcDocumentList } = await import(
  /* webpackChunkName: "hbc-sharepoint-docs" */
  '@hbc/sharepoint-docs'
);
```

React's `Suspense` wraps the lazy import, showing a lightweight skeleton until the chunk loads.

### Import Path Rules (CLAUDE.md §6.1)

| Context | Import path | Reason |
|---|---|---|
| SPFx webpart (all) | `@hbc/ui-kit/app-shell` | Bundle budget — app-shell is tree-shaken |
| SPFx webpart shell-only | `@hbc/ui-kit/app-shell` | Per CLAUDE.md §6.1 |
| PWA / dev-harness | `@hbc/ui-kit` | Full library available; no budget constraint |
| Icon-only imports in SPFx | `@hbc/ui-kit/icons` | Narrowest path per CLAUDE.md §6.1 |

`@hbc/sharepoint-docs` itself uses `@hbc/ui-kit/app-shell` internally for all SPFx-facing component renders. The full `@hbc/ui-kit` is only imported in the dev-harness and PWA builds.

---

## 3. Inline Integration Pattern

This section shows how a consuming SPFx webpart (e.g., `apps/spfx/src/webparts/bdScorecard/`) integrates the document panel. The pattern is identical for all consuming webparts.

### `DocumentsPanelSection.tsx` (create in consuming webpart)

```typescript
import React, { lazy, Suspense, useState } from 'react';
import type { IDocumentContextConfig } from '@hbc/sharepoint-docs';
// NOTE: import from app-shell in SPFx — not from @hbc/ui-kit
import { HbcCollapsibleSection, HbcSkeleton } from '@hbc/ui-kit/app-shell';

const HbcDocumentAttachment = lazy(() =>
  import(/* webpackChunkName: "hbc-sharepoint-docs" */ '@hbc/sharepoint-docs').then(m => ({
    default: m.HbcDocumentAttachment,
  }))
);

const HbcDocumentList = lazy(() =>
  import(/* webpackChunkName: "hbc-sharepoint-docs" */ '@hbc/sharepoint-docs').then(m => ({
    default: m.HbcDocumentList,
  }))
);

interface DocumentsPanelSectionProps {
  contextConfig: IDocumentContextConfig;
  /** Whether the record's workflow step allows document attachment. */
  canAttach: boolean;
  /** Complexity mode from @hbc/complexity context. */
  complexityMode?: 'essential' | 'standard' | 'expert';
}

/**
 * Collapsible "Documents" section for embedding inside any record webpart.
 * Lazy-loads @hbc/sharepoint-docs on first panel open.
 * Conforms to D-09 (inline default with lazy loading).
 */
export const DocumentsPanelSection: React.FC<DocumentsPanelSectionProps> = ({
  contextConfig,
  canAttach,
  complexityMode = 'standard',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HbcCollapsibleSection
      title="Documents"
      isOpen={isOpen}
      onToggle={() => setIsOpen(prev => !prev)}
      badge={undefined}  // document count badge added in a future iteration
    >
      {isOpen && (
        <Suspense fallback={<HbcSkeleton lines={3} />}>
          <HbcDocumentAttachment
            contextConfig={contextConfig}
            disabled={!canAttach}
            complexityMode={complexityMode}
          />
        </Suspense>
      )}
    </HbcCollapsibleSection>
  );
};
```

### Integration in BD Scorecard Webpart

In the BD Scorecard webpart's main render:

```typescript
// apps/spfx/src/webparts/bdScorecard/components/BDScorecardForm.tsx
import { DocumentsPanelSection } from './DocumentsPanelSection.js';
import { useAuth } from '@hbc/auth';

// Inside the form component:
const { currentUser } = useAuth();

const docContextConfig: IDocumentContextConfig = {
  contextId: scorecard.id,
  contextType: 'bd-lead',
  contextLabel: scorecard.projectName,
  siteUrl: null,   // pre-provisioning — no project site yet
  ownerUpn: currentUser.upn,
  ownerLastName: currentUser.lastName,
  // Permissions auto-applied by PermissionManager using default 3-tier model (D-04)
};

// In JSX:
<DocumentsPanelSection
  contextConfig={docContextConfig}
  canAttach={scorecard.stage !== 'closed'}
  complexityMode={complexityMode}  // from @hbc/complexity context
/>
```

### Integration in Estimating Pursuit Webpart

```typescript
const docContextConfig: IDocumentContextConfig = {
  contextId: pursuit.id,
  contextType: 'estimating-pursuit',
  contextLabel: pursuit.projectName,
  siteUrl: null,   // pre-provisioning
  ownerUpn: currentUser.upn,
  ownerLastName: currentUser.lastName,
};

<DocumentsPanelSection
  contextConfig={docContextConfig}
  canAttach={pursuit.stage !== 'awarded' && pursuit.stage !== 'lost'}
  complexityMode={complexityMode}
/>
```

---

## 4. Standalone `HBCDocumentManagerWebpart`

A separate SPFx webpart that page editors can place independently on any SharePoint page.

### Webpart Location

```
apps/spfx/src/webparts/hbcDocumentManager/
├── HbcDocumentManagerWebPart.ts         # Webpart class
├── components/
│   └── HbcDocumentManagerRoot.tsx       # Root component
└── loc/
    └── en-us.js                          # Localization strings
```

### `HbcDocumentManagerWebPart.ts`

```typescript
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { HbcDocumentManagerRoot } from './components/HbcDocumentManagerRoot.js';

export interface IHbcDocumentManagerWebPartProps {
  /** The record ID whose documents this webpart displays. */
  contextId: string;
  /** The context type for this webpart instance. */
  contextType: 'bd-lead' | 'estimating-pursuit' | 'project';
  /** Display label for the context. */
  contextLabel: string;
  /** Whether users can upload documents from this webpart. */
  allowUpload: boolean;
}

export default class HbcDocumentManagerWebPart
  extends BaseClientSideWebPart<IHbcDocumentManagerWebPartProps> {

  public render(): void {
    const element = React.createElement(HbcDocumentManagerRoot, {
      contextId: this.properties.contextId,
      contextType: this.properties.contextType,
      contextLabel: this.properties.contextLabel,
      allowUpload: this.properties.allowUpload,
      // Pass SPFx context for @hbc/auth adapter selection
      spfxContext: this.context,
    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Document Manager Settings' },
          groups: [
            {
              groupName: 'Context',
              groupFields: [
                PropertyPaneTextField('contextId', {
                  label: 'Record ID',
                  description: 'The ID of the BD lead, pursuit, or project whose documents to show.',
                }),
                PropertyPaneDropdown('contextType', {
                  label: 'Context Type',
                  options: [
                    { key: 'bd-lead', text: 'BD Lead' },
                    { key: 'estimating-pursuit', text: 'Estimating Pursuit' },
                    { key: 'project', text: 'Project' },
                  ],
                }),
                PropertyPaneTextField('contextLabel', {
                  label: 'Display Label',
                  description: 'Human-readable name for this context (e.g., "Riverside Medical Center")',
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
```

### `HbcDocumentManagerRoot.tsx`

```typescript
import React, { lazy, Suspense } from 'react';
import type { IDocumentContextConfig } from '@hbc/sharepoint-docs';
import { HbcSkeleton } from '@hbc/ui-kit/app-shell';
import { useAuth } from '@hbc/auth';

const HbcDocumentAttachment = lazy(() =>
  import('@hbc/sharepoint-docs').then(m => ({ default: m.HbcDocumentAttachment }))
);
const HbcDocumentList = lazy(() =>
  import('@hbc/sharepoint-docs').then(m => ({ default: m.HbcDocumentList }))
);

interface HbcDocumentManagerRootProps {
  contextId: string;
  contextType: 'bd-lead' | 'estimating-pursuit' | 'project';
  contextLabel: string;
  allowUpload: boolean;
  spfxContext: unknown;
}

export const HbcDocumentManagerRoot: React.FC<HbcDocumentManagerRootProps> = ({
  contextId, contextType, contextLabel, allowUpload,
}) => {
  const { currentUser } = useAuth();

  const contextConfig: IDocumentContextConfig = {
    contextId,
    contextType,
    contextLabel,
    siteUrl: contextType === 'project' ? null : null,  // project siteUrl resolved from provisioning data
    ownerUpn: currentUser?.upn ?? '',
    ownerLastName: currentUser?.lastName ?? '',
  };

  return (
    <div className="hbc-document-manager-webpart">
      <Suspense fallback={<HbcSkeleton lines={4} />}>
        {allowUpload ? (
          <HbcDocumentAttachment contextConfig={contextConfig} />
        ) : (
          <HbcDocumentList contextId={contextId} contextType={contextType} />
        )}
      </Suspense>
    </div>
  );
};
```

---

## 5. SPFx Manifest Registration

Add to the SPFX package solution (`config/package-solution.json`):

```json
{
  "solution": {
    "webparts": [
      {
        "componentType": "WebPart",
        "id": "a3c7b2d1-4e5f-6789-abcd-ef0123456789",
        "alias": "HbcDocumentManagerWebPart",
        "componentName": "HBC Document Manager",
        "description": "Attach and manage SharePoint documents for BD leads, Estimating pursuits, and projects.",
        "officeFabricIconFontName": "Documentation",
        "properties": {
          "contextId": "",
          "contextType": "bd-lead",
          "contextLabel": "",
          "allowUpload": true
        }
      }
    ]
  }
}
```

---

## 6. Bundle Size Analysis

Run after building the SPFx package to confirm the document chunk stays within budget:

```bash
# Build SPFx package with bundle analysis
cd apps/spfx
npm run bundle --stats

# Expected results:
#   Main webpart bundle (BD Scorecard): < 1 MB
#   hbc-sharepoint-docs lazy chunk: < 400 KB gzipped
#   Total page weight on first load (before Documents panel opens): unaffected
#   Total page weight after Documents panel opens: + ~400 KB (one-time load)

# If the lazy chunk exceeds 400 KB gzipped:
#   - Audit imports inside @hbc/sharepoint-docs for unintended full @hbc/ui-kit imports
#   - Verify all SPFx paths use @hbc/ui-kit/app-shell
#   - Check for unintended large dependencies (e.g., moment.js, lodash full)
```

---

## 7. Verification Commands

```bash
# Build the full SPFx package
cd apps/spfx && npm run build

# Serve locally against a dev SharePoint tenant
npm run serve

# Confirm:
# 1. BD Scorecard webpart renders without the document panel chunk loaded
# 2. Clicking "Documents" panel opens it and loads the chunk (check Network tab)
# 3. HBCDocumentManagerWebpart can be added to a SharePoint page via the webpart picker
# 4. Property pane fields (contextId, contextType, contextLabel) work correctly
# 5. No direct @hbc/ui-kit imports appear in SPFx bundle analysis (only app-shell)
```
