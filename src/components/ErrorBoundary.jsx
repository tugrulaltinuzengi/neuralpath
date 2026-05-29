import { Component } from "react";

// Catches render/runtime errors anywhere below it and shows a readable panel
// instead of letting the whole renderer blank out to a black screen.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Forwarded to the main process stdout in dev (see electron/main.js).
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center"
          style={{ color: "var(--text-primary)" }}
        >
          <h1 className="font-display text-xl font-bold" style={{ color: "var(--accent-red)" }}>
            Something went wrong
          </h1>
          <p className="max-w-md text-sm" style={{ color: "var(--text-muted)" }}>
            The page hit an unexpected error and stopped rendering. Your progress is saved — you can
            reload and continue.
          </p>
          <pre
            className="max-w-xl overflow-auto rounded-lg border p-3 text-left text-xs"
            style={{ borderColor: "var(--border)", background: "var(--bg-surface)", color: "var(--text-muted)" }}
          >
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <div className="flex gap-2">
            <button
              className="np-btn np-btn-secondary"
              onClick={() => this.setState({ error: null })}
            >
              Try Again
            </button>
            <button className="np-btn np-btn-primary" onClick={() => window.location.reload()}>
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
