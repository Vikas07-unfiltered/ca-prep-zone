
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

interface VoiceErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class VoiceErrorBoundary extends React.Component<VoiceErrorBoundaryProps, VoiceErrorBoundaryState> {
  constructor(props: VoiceErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): VoiceErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Voice chat error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-muted-foreground border-t">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
          <p className="mb-2">Voice chat encountered an error</p>
          <p className="text-sm text-muted-foreground mb-3">
            {this.state.error?.message || 'Something went wrong with the voice chat component'}
          </p>
          <Button variant="outline" onClick={this.handleRetry}>
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
