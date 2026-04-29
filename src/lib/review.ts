import type { ReviewStatus } from '@/components/templateRender/ReviewBadge';
import { parseDate } from './date';

export function getReviewStatus(
  lastReviewedOn?: string,
  reviewIn?: string,
  now: Date = new Date(),
): ReviewStatus | null {
  if (!lastReviewedOn || !reviewIn) return null;

  const lastReviewed = parseDate(lastReviewedOn);

  if (!lastReviewed) return null;

  const months = parseInt(reviewIn, 10) || 6;

  const dueDate = new Date(lastReviewed);
  dueDate.setMonth(dueDate.getMonth() + months);

  const warningDate = new Date(dueDate);
  warningDate.setMonth(warningDate.getMonth() - 1);

  if (now > dueDate) return 'overdue';
  if (now > warningDate) return 'warning';

  return 'ok';
}
