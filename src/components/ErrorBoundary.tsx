import { Component, ErrorInfo, ReactNode } from "react";

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
        <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
              Portfolio unavailable
            </p>
            <h1 className="mt-4 text-3xl font-semibold">Something failed while loading.</h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
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
