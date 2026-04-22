export type StatusTagValue = 'live' | 'beta' | 'alpha' | 'deprecated';

export interface StatusTagProps {
  status: StatusTagValue;
}

const statusConfig: Record<StatusTagValue, { label: string; className: string }> = {
  live: { label: 'Live', className: 'govuk-tag govuk-tag--green' },
  beta: { label: 'Beta', className: 'govuk-tag govuk-tag--blue' },
  alpha: { label: 'Alpha', className: 'govuk-tag govuk-tag--yellow' },
  deprecated: { label: 'Deprecated', className: 'govuk-tag govuk-tag--red' },
};

export function StatusTag({ status }: StatusTagProps) {
  const statusMeta = statusConfig[status];

  return <strong className={statusMeta.className}>{statusMeta.label}</strong>;
}