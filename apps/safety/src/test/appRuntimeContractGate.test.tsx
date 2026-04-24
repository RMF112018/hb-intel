import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App.js';
import { resolveSafetyRuntimeContract } from '../runtime/safetyRuntimeContract.js';

describe('App runtime contract gate', () => {
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
});
