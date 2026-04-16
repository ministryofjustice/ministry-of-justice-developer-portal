'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ChatBot } from '@/components/ChatBot';
import products from '@/content/products/products.json';

const categories = [
  { key: 'all', label: 'All' },
  { key: 'platforms', label: 'Platforms' },
  { key: 'apis', label: 'APIs' },
  { key: 'tools', label: 'Tools' },
  { key: 'security', label: 'Security' },
];

const excludedProductSlugs = new Set([
  'service-auth',
]);

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const visibleProducts = products.filter((product) => !excludedProductSlugs.has(product.slug));

  const availableTags = Array.from(
    new Set(visibleProducts.flatMap((product) => product.tags || []))
  ).sort((a, b) => a.localeCompare(b));

  const filtered = visibleProducts.filter((product) => {
    const categoryMatch = activeCategory === 'all' || product.category === activeCategory;
    const tagsMatch =
      selectedTags.length === 0 || selectedTags.some((tag) => (product.tags || []).includes(tag));

    return categoryMatch && tagsMatch;
  });

  const categoryCounts = visibleProducts.reduce<Record<string, number>>((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  const tagCounts = visibleProducts.reduce<Record<string, number>>((acc, product) => {
    (product.tags || []).forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  };

  const clearFilters = () => {
    setActiveCategory('all');
    setSelectedTags([]);
  };

  const formatTagLabel = (tag: string) =>
    tag
      .split(/[-_\s]+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  return (
    <div className="govuk-width-container">
      <Breadcrumbs items={[{ label: 'Products' }]} />

      <h1 className="govuk-heading-xl">Products &amp; Services</h1>
      <p className="govuk-body-l">
        Browse the catalogue of platforms, tools, APIs, and services available to
        developers across government.
      </p>

      <div className="govuk-grid-row app-products-layout">
        <aside className="govuk-grid-column-one-quarter">
          <div className="app-products-filter-panel">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Filters</h2>

            <div className="govuk-form-group govuk-!-margin-bottom-0">
              <fieldset className="govuk-fieldset" aria-describedby="products-filter-hint">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Category</legend>
                <div id="products-filter-hint" className="govuk-hint">
                  Use this to narrow the product list.
                </div>
                <div className="govuk-radios govuk-radios--small">
                  {categories.map((cat) => {
                    const categoryCount = cat.key === 'all' ? visibleProducts.length : (categoryCounts[cat.key] || 0);
                    const inputId = `products-filter-${cat.key}`;

                    return (
                      <div key={cat.key} className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id={inputId}
                          name="products-category"
                          type="radio"
                          value={cat.key}
                          checked={activeCategory === cat.key}
                          onChange={() => setActiveCategory(cat.key)}
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor={inputId}>
                          {cat.label}
                          <span className="app-products-filter-count">({categoryCount})</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <div className="govuk-form-group govuk-!-margin-top-5 govuk-!-margin-bottom-0">
              <fieldset className="govuk-fieldset" aria-describedby="products-tag-filter-hint">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Tags</legend>
                <div id="products-tag-filter-hint" className="govuk-hint">
                  Select one or more tags.
                </div>

                <div className="govuk-checkboxes govuk-checkboxes--small">
                  {availableTags.map((tag) => {
                    const inputId = `products-tag-${tag.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

                    return (
                      <div key={tag} className="govuk-checkboxes__item">
                        <input
                          className="govuk-checkboxes__input"
                          id={inputId}
                          name="products-tags"
                          type="checkbox"
                          value={tag}
                          checked={selectedTags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                        />
                        <label className="govuk-label govuk-checkboxes__label" htmlFor={inputId}>
                          {formatTagLabel(tag)}
                          <span className="app-products-filter-count">({tagCounts[tag] || 0})</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            {(activeCategory !== 'all' || selectedTags.length > 0) && (
              <button type="button" className="app-products-clear-filters govuk-link" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        </aside>

        <section className="govuk-grid-column-three-quarters">
          <p className="govuk-body-s app-products-results-count" aria-live="polite">
            Showing {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          </p>

          {filtered.length > 0 ? (
            <div className="app-cards">
              {filtered.map((product) => (
                <ProductCard key={product.slug} {...product} />
              ))}
            </div>
          ) : (
            <p className="govuk-body">No products found in this category.</p>
          )}
        </section>
      </div>

      <ChatBot />
    </div>
  );
}
