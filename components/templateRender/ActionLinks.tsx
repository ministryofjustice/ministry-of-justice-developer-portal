import Link from 'next/link';

export interface ActionLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface ActionLinksProps {
  links: ActionLink[];
}

export function ActionLinks({ links }: ActionLinksProps) {
  if (links.length === 0) return null;

  return (
    <div className="govuk-button-group">
      {links.map((link, index) => {
        const buttonClass = index === 0 ? 'govuk-button' : 'govuk-button govuk-button--secondary';

        if (link.external) {
          return (
            <a key={`${link.label}-${link.href}`} href={link.href} className={buttonClass} rel="noopener noreferrer">
              {link.label}
            </a>
          );
        }

        return (
          <Link key={`${link.label}-${link.href}`} href={link.href} className={buttonClass}>
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
