# PH7-BW-1 — SPFx Entry Points: BaseClientSideWebPart.ts for All 11 Apps

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md §1 (apps structure), §2a (SPFx 1.18+)
**Date:** 2026-03-07
**Priority:** HIGH — Entry gate for all feature work; no webpart can load in SharePoint without this
**Depends on:** Nothing (first BW task)
**Blocks:** BW-2, BW-3, BW-4, BW-6, BW-7

---

## Summary

Every SPFx webpart requires a class that extends `BaseClientSideWebPart<T>` as its SharePoint entry point. SharePoint calls `onInit()` and then `render()` on this class — it is the bridge between the SharePoint page context and the React application.

Currently, all 11 apps have `main.tsx` (a direct `ReactDOM.createRoot()` entry point used in Vite dev mode) but **no `BaseClientSideWebPart.ts` class**. Without this file, the app can only run as a standalone Vite dev server — it cannot be loaded as an SPFx webpart in SharePoint at all.

This task creates the webpart entry point for all 11 domains. Each entry point is nearly identical in structure; domain-specific differences are limited to the class name, manifest ID reference, and workspace key.

---

## Why It Matters

- SharePoint identifies, loads, and mounts webparts exclusively through the `BaseClientSideWebPart` lifecycle
- `this.context` (the `WebPartContext`) is **only available inside this class** — it provides the SP page context, current user UPN, site URL, access token callbacks, and tenant configuration that `bootstrapSpfxAuth()` needs
- The webpart manifest JSON must match this class — wrong class name = SharePoint refuses to load
- `onInit()` is the correct hook for async bootstrapping (auth, data) before React renders
- `render()` mounts the React root into `this.domElement` — equivalent to `main.tsx` but under SharePoint control

---

## Files to Create Per Domain

Pattern: `apps/[domain]/src/webparts/[domain]/[PascalCase]WebPart.ts`

### Full list:

| Domain | File Path | Class Name |
|---|---|---|
| accounting | `apps/accounting/src/webparts/accounting/AccountingWebPart.ts` | `AccountingWebPart` |
| estimating | `apps/estimating/src/webparts/estimating/EstimatingWebPart.ts` | `EstimatingWebPart` |
| project-hub | `apps/project-hub/src/webparts/projectHub/ProjectHubWebPart.ts` | `ProjectHubWebPart` |
| leadership | `apps/leadership/src/webparts/leadership/LeadershipWebPart.ts` | `LeadershipWebPart` |
| business-development | `apps/business-development/src/webparts/businessDevelopment/BusinessDevelopmentWebPart.ts` | `BusinessDevelopmentWebPart` |
| admin | `apps/admin/src/webparts/admin/AdminWebPart.ts` | `AdminWebPart` |
| safety | `apps/safety/src/webparts/safety/SafetyWebPart.ts` | `SafetyWebPart` |
| quality-control-warranty | `apps/quality-control-warranty/src/webparts/qualityControlWarranty/QualityControlWarrantyWebPart.ts` | `QualityControlWarrantyWebPart` |
| risk-management | `apps/risk-management/src/webparts/riskManagement/RiskManagementWebPart.ts` | `RiskManagementWebPart` |
| operational-excellence | `apps/operational-excellence/src/webparts/operationalExcellence/OperationalExcellenceWebPart.ts` | `OperationalExcellenceWebPart` |
| human-resources | `apps/human-resources/src/webparts/humanResources/HumanResourcesWebPart.ts` | `HumanResourcesWebPart` |

---

## Reference Implementation (Accounting — implement first)

```typescript
// apps/accounting/src/webparts/accounting/AccountingWebPart.ts

import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { createRoot, type Root } from 'react-dom/client';
import { App } from '../../App.js';
import { bootstrapSpfxAuth } from '@hbc/auth/spfx';

export interface IAccountingWebPartProps {
  description: string;
}

export default class AccountingWebPart extends BaseClientSideWebPart<IAccountingWebPartProps> {
  private _root: Root | undefined;

  public async onInit(): Promise<void> {
    await super.onInit();
    // Pass SharePoint page context to the auth package — this is the ONLY place
    // where `this.context` is available; it must be captured here before React renders.
    await bootstrapSpfxAuth(this.context);
  }

  public render(): void {
    if (!this._root) {
      this._root = createRoot(this.domElement);
    }
    this._root.render(<App />);
  }

  protected onDispose(): void {
    this._root?.unmount();
    this._root = undefined;
    super.onDispose();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Accounting Webpart Settings' },
          groups: [
            {
              groupFields: [
                PropertyPaneTextField('description', {
                  label: 'Description',
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

---

## Template for Remaining 10 Domains

The following template applies to every other domain with three substitutions:
- `[Domain]` → PascalCase class name (e.g., `EstimatingWebPart`)
- `[domain]` → kebab-case manifest title (e.g., `'Estimating Webpart Settings'`)
- All other code is identical

```typescript
// apps/[domain]/src/webparts/[domain]/[Domain]WebPart.ts

import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { createRoot, type Root } from 'react-dom/client';
import { App } from '../../App.js';
import { bootstrapSpfxAuth } from '@hbc/auth/spfx';

export interface I[Domain]WebPartProps {
  description: string;
}

export default class [Domain]WebPart extends BaseClientSideWebPart<I[Domain]WebPartProps> {
  private _root: Root | undefined;

  public async onInit(): Promise<void> {
    await super.onInit();
    await bootstrapSpfxAuth(this.context);
  }

  public render(): void {
    if (!this._root) {
      this._root = createRoot(this.domElement);
    }
    this._root.render(<App />);
  }

  protected onDispose(): void {
    this._root?.unmount();
    this._root = undefined;
    super.onDispose();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [{
        header: { description: '[Domain] Webpart Settings' },
        groups: [{ groupFields: [PropertyPaneTextField('description', { label: 'Description' })] }],
      }],
    };
  }
}
```

---

## Main.tsx Update Required

Each `apps/[domain]/src/main.tsx` currently has a comment: `// spfx mode: bootstrapSpfxAuth() called by SPFx wrapper (future phase)`. This must be updated to clarify the entry point relationship:

```typescript
// apps/[domain]/src/main.tsx

// DEV MODE ONLY: This entry point is used by Vite dev server.
// In SharePoint (production), the SPFx entry point is:
//   src/webparts/[domain]/[Domain]WebPart.ts
// That file calls bootstrapSpfxAuth() from this.context in onInit().

function start(): void {
  const authMode: AuthMode = resolveAuthMode();
  if (authMode === 'mock') {
    bootstrapMockEnvironment();
  }
  // Note: 'spfx' mode is not reachable from main.tsx — only from WebPart.ts onInit()
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');
  createRoot(root).render(<StrictMode><App /></StrictMode>);
}
```

---

## Package.json Dependencies

Each webpart app's `package.json` must include the SPFx peer dependencies. Add to each `apps/[domain]/package.json`:

```json
{
  "dependencies": {
    "@microsoft/sp-core-library": "^1.18.0",
    "@microsoft/sp-webpart-base": "^1.18.0",
    "@microsoft/sp-property-pane": "^1.18.0"
  }
}
```

---

## Implementation Order

Execute in MVP priority order:

1. `apps/accounting/src/webparts/accounting/AccountingWebPart.ts`
2. `apps/estimating/src/webparts/estimating/EstimatingWebPart.ts`
3. `apps/project-hub/src/webparts/projectHub/ProjectHubWebPart.ts`
4. `apps/leadership/src/webparts/leadership/LeadershipWebPart.ts`
5. `apps/business-development/src/webparts/businessDevelopment/BusinessDevelopmentWebPart.ts`
6. `apps/admin/src/webparts/admin/AdminWebPart.ts`
7. `apps/safety/src/webparts/safety/SafetyWebPart.ts`
8. `apps/quality-control-warranty/src/webparts/qualityControlWarranty/QualityControlWarrantyWebPart.ts`
9. `apps/risk-management/src/webparts/riskManagement/RiskManagementWebPart.ts`
10. `apps/operational-excellence/src/webparts/operationalExcellence/OperationalExcellenceWebPart.ts`
11. `apps/human-resources/src/webparts/humanResources/HumanResourcesWebPart.ts`

Also update all 11 `apps/[domain]/src/main.tsx` files with the clarifying comment.

---

## Verification

```bash
# TypeScript compile check for all webpart entry points
pnpm turbo run typecheck --filter="./apps/accounting"
pnpm turbo run typecheck --filter="./apps/estimating"

# Confirm file existence
ls apps/accounting/src/webparts/accounting/AccountingWebPart.ts
ls apps/estimating/src/webparts/estimating/EstimatingWebPart.ts

# Confirm no BaseClientSideWebPart import errors
pnpm tsc --noEmit -p apps/accounting/tsconfig.json
```

**Expected outcome:** All 11 webpart class files compile without TypeScript errors. The `bootstrapSpfxAuth(this.context)` call will be an unresolved import until BW-2 is complete — leave as a stub import if needed and complete the wiring in BW-2.

---

## Definition of Done

- [ ] 11 `[Domain]WebPart.ts` files created in correct `src/webparts/[domain]/` subdirectories
- [ ] All extend `BaseClientSideWebPart` with correct generics
- [ ] `onInit()` calls `await bootstrapSpfxAuth(this.context)` (stub import acceptable until BW-2)
- [ ] `render()` mounts `<App />` using `createRoot(this.domElement)`
- [ ] `onDispose()` calls `this._root?.unmount()`
- [ ] All 11 `main.tsx` files updated with clarifying comment
- [ ] SPFx peer dependencies added to all 11 `package.json` files
- [ ] TypeScript compiles without errors
