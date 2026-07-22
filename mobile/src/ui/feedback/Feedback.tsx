import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';

export type FeedbackProps = {
  type: 'loading' | 'error';
  message?: string;
  onRetry?: () => void;
};

export function Feedback({ type, message, onRetry }: FeedbackProps) {
  return type === 'loading' ? (
    <LoadingState />
  ) : (
    <ErrorState message={message} onRetry={onRetry} />
  );
}
