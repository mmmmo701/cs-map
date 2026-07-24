import { Component, type ErrorInfo, type ReactNode } from "react";
import styles from "./ErrorBoundary.module.css";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.boundary} role="alert">
          <h2>Something went wrong while rendering the map.</h2>
          <p>Try reloading the page. If the problem persists, the map data may be malformed.</p>
          {import.meta.env.DEV && (
            <pre className={styles.details}>{this.state.error.stack ?? this.state.error.message}</pre>
          )}
          <button type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
