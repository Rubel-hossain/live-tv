"use client";

import { Component, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("Error boundary caught an error", error, {
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <main className="error-state">
          <div className="error-icon">
            <AlertCircle size={48} aria-hidden="true" />
          </div>
          <h1>Something went wrong</h1>
          <p>We encountered an unexpected error. Please try refreshing the page.</p>
          {this.state.error && (
            <details className="error-details">
              <summary>Error details</summary>
              <pre>{this.state.error.message}</pre>
            </details>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
