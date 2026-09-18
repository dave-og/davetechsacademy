import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "../ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an unhandled exception:", error, errorInfo);

    // If Sentry or telemetry reporting is available, forward error
    if (typeof window !== "undefined" && (window as any).Sentry) {
      try {
        (window as any).Sentry.captureException(error, { extra: errorInfo });
      } catch {
        // Sentry capture fallback
      }
    }
  }

  private handleReload = (): void => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  private handleGoHome = (): void => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="error-boundary section container"
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "var(--sp-12) var(--sp-6)",
          }}
          role="alert"
        >
          <div
            style={{
              maxWidth: "540px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-primary)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--sp-8)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <div
              style={{
                fontSize: "42px",
                marginBottom: "var(--sp-4)",
              }}
            >
              ⚠️
            </div>

            <h1
              style={{
                fontSize: "var(--fs-2xl)",
                fontWeight: "var(--fw-bold)",
                color: "var(--text-primary)",
                marginBottom: "var(--sp-2)",
              }}
            >
              Something Went Wrong
            </h1>

            <p
              style={{
                fontSize: "var(--fs-sm)",
                color: "var(--text-secondary)",
                marginBottom: "var(--sp-6)",
                lineHeight: 1.6,
              }}
            >
              An unexpected application error occurred. Our engineering telemetry has logged this diagnostic event. You can reload the page or return to the homepage.
            </p>

            {this.state.error && (
              <details
                style={{
                  textAlign: "left",
                  marginBottom: "var(--sp-6)",
                  background: "var(--bg-secondary)",
                  padding: "var(--sp-3)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--fs-xs)",
                  color: "var(--text-muted)",
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--gold)" }}>
                  Error Diagnostic Details
                </summary>
                <pre
                  style={{
                    marginTop: "var(--sp-2)",
                    overflowX: "auto",
                    whiteSpace: "pre-wrap",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div
              style={{
                display: "flex",
                gap: "var(--sp-3)",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button variant="primary" size="md" onClick={this.handleReload}>
                🔄 Reload Page
              </Button>
              <Button variant="secondary" size="md" onClick={this.handleGoHome}>
                🏠 Return to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
