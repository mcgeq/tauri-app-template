import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error ?? new Error('Unknown error'),
          () => this.setState({ hasError: false, error: null }),
        );
      }

      return (
        <div className="flex h-[100vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-destructive text-lg font-medium">Something went wrong</p>
          <p className="text-muted-foreground max-w-md text-sm">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
