import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-sm">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-extrabold text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              An unexpected error occurred while rendering this page. You can reload the application to restore your session.
            </p>

            {this.state.error && (
              <div className="text-left bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs text-rose-300 font-mono mb-6 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-sky-500/20 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload App
              </button>
              <button
                onClick={() => {
                  window.location.hash = '#/';
                  window.location.reload();
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
