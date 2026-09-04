import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
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

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught component error in Dashboard:', error, errorInfo);
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center space-y-4 border border-rose-100 shadow-xl">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {this.props.fallbackTitle || 'Došlo k chybě při načítání části portálu'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-mono bg-rose-50/70 p-3 rounded-xl border border-rose-100 text-left overflow-x-auto max-h-32">
              {this.state.error?.message || 'Neznámá chyba při vykreslování komponenty.'}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="bg-primary hover:bg-primary/95 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Obnovit zobrazení
              </button>
              <button
                onClick={() => window.location.href = window.location.pathname}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Zpět na úvod
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
