import * as React from 'react';
import { ShellFallbackSurface } from './ShellFallbackSurface.js';

interface ZoneErrorBoundaryProps {
  zoneName: string;
  children: React.ReactNode;
}

interface ZoneErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ZoneErrorBoundary extends React.Component<ZoneErrorBoundaryProps, ZoneErrorBoundaryState> {
  constructor(props: ZoneErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ZoneErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error): void {
    console.error(`[hb-homepage] Zone "${this.props.zoneName}" render failed.`, error);
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <ShellFallbackSurface
          zoneName={this.props.zoneName}
          reason="render-failure"
          message="This section is temporarily unavailable."
        />
      );
    }
    return this.props.children;
  }
}
