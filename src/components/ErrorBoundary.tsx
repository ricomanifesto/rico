import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Portfolio render failed", { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary-shell">
          <div className="error-boundary-content">
            <p className="error-boundary-eyebrow">
              Portfolio unavailable
            </p>
            <h1 className="error-boundary-heading">Something failed while loading.</h1>
            <p className="error-boundary-copy">
              Refresh the page. If the issue continues, the project links and contact paths remain
              available from the public repositories.
            </p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
