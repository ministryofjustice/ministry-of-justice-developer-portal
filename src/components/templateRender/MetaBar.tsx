import { MetaBarProps } from '@/types/types';

export function MetaBar({ items, className = 'app-doc-meta' }: MetaBarProps) {
  const visibleItems = items.filter((item) => item.value !== null && item.value !== undefined && item.value !== false);

  if (visibleItems.length === 0) return null;

  return (
    <div className={className}>
      {visibleItems.map((item) => (
        <span key={item.label}>
          <strong>{item.label}:</strong> {item.value}
        </span>
      ))}
    </div>
  );
}
