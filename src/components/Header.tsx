'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/products', label: 'Products' },
  { href: '/guidelines', label: 'Guidelines' },
  { href: '/docs', label: 'Documentation' },
  { href: '/community', label: 'Community' },
  { href: '/contact-us', label: 'Contact us'}
];

export function Header() {
  const pathname = usePathname();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <>
      <header className="moj-header" role="banner">
        <div className="moj-header__container">
          <div className="moj-header__logo">
            <img 
              src={`${basePath}/assets/images/govuk-crest.svg`}
              alt=""
              className="moj-header__logotype-crest"
              width="40"
              height="40"
            />
            <Link href="/" className="moj-header__link moj-header__link--organisation-name">
              Ministry of Justice
            </Link>

            <Link href="/" className="moj-header__link moj-header__link--service-name">
              Developer portal
            </Link>
          </div>
        </div>
      </header>

      <section className="govuk-service-navigation" aria-label="Service information" data-module="govuk-service-navigation">
        <div className="govuk-width-container">
          <div className="govuk-service-navigation__container">
            <nav aria-label="Menu" className="govuk-service-navigation__wrapper">
              <ul className="govuk-service-navigation__list" id="service-navigation">
                {navItems.map((item) => (
                  <li
                    key={item.href}
                    className={`govuk-service-navigation__item${pathname?.startsWith(item.href) ? ' govuk-service-navigation__item--active' : ''}`}
                  >
                    <Link href={item.href} className="govuk-service-navigation__link" aria-current={pathname?.startsWith(item.href) ? 'page' : undefined} onClick={(e) => (e.target as HTMLElement).blur()}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>
    </>
  );
}
