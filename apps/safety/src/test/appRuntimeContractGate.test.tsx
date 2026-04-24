import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { configureSafetyListGuids, resetSafetyListGuidOverlay } from '@hbc/features-safety';
import { App } from '../App.js';
import { resolveSafetyRuntimeContract } from '../runtime/safetyRuntimeContract.js';

describe('App runtime contract gate', () => {
  afterEach(() => {
    resetSafetyListGuidOverlay();
  });

  it('renders a blocked configuration state in sharepoint mode without backend binding', () => {
    const runtimeContract = resolveSafetyRuntimeContract({
      hasSpfxContext: true,
      config: {},
    });

    render(<App spfxContext={{}} runtimeContract={runtimeContract} />);

    expect(screen.getByText('Safety configuration is incomplete.')).toBeInTheDocument();
    expect(
      screen.getByText('SharePoint host mode is active, but required backend binding is missing or invalid.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Backend base URL is missing.')).toBeInTheDocument();
    expect(screen.getByText('API audience is missing.')).toBeInTheDocument();
  });

  it('renders blocked state when sharepoint client is unavailable even with valid runtime config', () => {
    configureSafetyListGuids({
      SafetyReportingPeriods: 'c30e6f0f-44be-49bd-ad14-46701f96cedb',
      SafetyProjectWeekRecords: '404546f4-c827-4d87-816b-fa526c15852b',
      SafetyInspectionEvents: 'dca4537f-7f3a-4159-b48f-f06f2944dc59',
      SafetyFindings: '8140e59a-0fed-4681-8e8d-8360c93d2d08',
      SafetyIngestionRuns: '965d5b6a-6bec-425a-b19c-6fb56c717c30',
      SafetyChecklistUploads: 'ad498f9c-d0dd-4dd5-ba85-fe36d585adc6',
      Projects: '1ac57cbb-9f0a-457f-9c97-081a29f45b12',
      LegacyProjectFallbackRegistry: '2c24aa84-38f4-4793-9576-2ee23bedd74a',
    });

    const runtimeContract = resolveSafetyRuntimeContract({
      hasSpfxContext: true,
      hostSource: 'safety-webpart',
      config: {
        functionAppUrl: 'https://functions.example.com',
        apiAudience: 'api://safety-functions',
      },
    });

    render(<App spfxContext={{}} runtimeContract={runtimeContract} />);

    expect(screen.getByText('Safety configuration is incomplete.')).toBeInTheDocument();
    expect(screen.getByText('SPFx HTTP client is unavailable in this host context.')).toBeInTheDocument();
  });
});
