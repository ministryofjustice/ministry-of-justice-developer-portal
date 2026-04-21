import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="govuk-breadcrumbs">
      <ol className="govuk-breadcrumbs__list">
        <li className="govuk-breadcrumbs__list-item">
          <Link className="govuk-breadcrumbs__link" href="/">
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="govuk-breadcrumbs__list-item">
            {item.href ? (
              <Link className="govuk-breadcrumbs__link" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
