import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Open Print Studio — Robust Offline Error Boundary with Crash Recovery
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error locally in browser console (never sent over network)
    console.error("[Open Print Studio] Unhandled application error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearAndReset = () => {
    try {
      sessionStorage.clear();
    } catch {
      // Ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "#0B0F17",
            color: "#F8FAFC",
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: "520px",
              backgroundColor: "#161E2E",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "32px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#EF444420",
                color: "#EF4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              !
            </div>

            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
              Application Encountered an Error / त्रुटि हुई
            </h2>

            <p style={{ fontSize: "14px", color: "#94A3B8", marginBottom: "20px", lineHeight: "1.5" }}>
              Open Print Studio caught an unexpected error. Your saved printer profiles and offline calibration remain safe.
              <br />
              (सॉफ़्टवेयर में अनपेक्षित त्रुटि हुई है। आपकी सुरक्षित सेटिंग्स सुरक्षित हैं।)
            </p>

            {this.state.error && (
              <div
                style={{
                  backgroundColor: "#0B0F17",
                  border: "1px solid #1E293B",
                  borderRadius: "6px",
                  padding: "12px",
                  fontSize: "12px",
                  color: "#F87171",
                  fontFamily: "monospace",
                  textAlign: "left",
                  maxHeight: "120px",
                  overflowY: "auto",
                  marginBottom: "24px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#3B82F6",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Reload App / पुनः लोड करें
              </button>

              <button
                type="button"
                onClick={this.handleClearAndReset}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#1E293B",
                  color: "#CBD5E1",
                  border: "1px solid #475569",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Reset Session / सत्र रीसेट करें
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
