import { ReviewStatus } from '../components/templateRender/ReviewBadge';

export function getReviewStatus(lastReviewedOn?: string, reviewIn?: string): ReviewStatus | null {
  if (!lastReviewedOn || !reviewIn) return null;

  const lastReviewed = new Date(lastReviewedOn);
  const months = parseInt(reviewIn, 10) || 6;
  const dueDate = new Date(lastReviewed);
  dueDate.setMonth(dueDate.getMonth() + months);

  const now = new Date();
  const warningDate = new Date(dueDate);
  warningDate.setMonth(warningDate.getMonth() - 1);

  if (now > dueDate) return 'overdue';
  if (now > warningDate) return 'warning';
  return 'ok';
}
