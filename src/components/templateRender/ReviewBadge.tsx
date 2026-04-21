export type ReviewStatus = 'ok' | 'warning' | 'overdue';

export interface ReviewBadgeProps {
  status: ReviewStatus;
}

const labels: Record<ReviewStatus, string> = {
  ok: '✓ Up to date',
  warning: '⚠ Review soon',
  overdue: '✗ Review overdue',
};

export function ReviewBadge({ status }: ReviewBadgeProps) {
  return <span className={`app-review-badge app-review-badge--${status}`}>{labels[status]}</span>;
}