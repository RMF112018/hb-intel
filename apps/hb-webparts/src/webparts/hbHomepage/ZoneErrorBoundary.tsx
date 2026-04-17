import * as React from 'react';

interface ZoneErrorBoundaryProps {
  zoneName: string;
  children: React.ReactNode;
}

interface ZoneErrorBoundaryState {
  hasError: boolean;
}

export class ZoneErrorBoundary extends React.Component<ZoneErrorBoundaryProps, ZoneErrorBoundaryState> {
  constructor(props: ZoneErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ZoneErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error): void {
    console.error(`[hb-homepage] Zone "${this.props.zoneName}" render failed.`, error);
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}
