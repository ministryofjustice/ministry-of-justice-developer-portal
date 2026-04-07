import type { ReactNode } from 'react';

export interface MetaItem {
  label: string;
  value: ReactNode;
}

export interface MetaBarProps {
  items: MetaItem[];
}

export function MetaBar({ items }: MetaBarProps) {
  if (items.length === 0) return null;

  return (
    <div className="app-doc-meta">
      {items.map((item) => (
        <span key={item.label}>
          <strong>{item.label}:</strong> {item.value}
        </span>
      ))}
    </div>
  );
}
