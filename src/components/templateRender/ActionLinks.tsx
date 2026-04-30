import { ActionLinksProps } from '@/types/types';
import Link from 'next/link';

export function ActionLinks({ links }: ActionLinksProps) {
  if (links.length === 0) return null;

  return (
    <div className="govuk-button-group">
      {links.map((link, index) => {
        const buttonClass = index === 0 ? 'govuk-button' : 'govuk-button govuk-button--secondary';

        if (link.external) {
          return (
            <a
              key={`${link.label}-${link.href}`}
              href={link.href}
              className={buttonClass}
              rel="noopener noreferrer"
              target="_blank"
            >
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
