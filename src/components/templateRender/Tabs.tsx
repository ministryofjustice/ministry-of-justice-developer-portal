'use client';

import { useState } from 'react';
import './Tabs.scss';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
}

export function Tabs({ tabs, defaultTabId }: TabsProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id || '');

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div className="app-tabs">
      <nav className="app-tabs__nav" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`app-tabs__button ${activeTabId === tab.id ? 'app-tabs__button--active' : ''}`}
            role="tab"
            aria-selected={activeTabId === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTabId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab && (
        <div
          id={`panel-${activeTab.id}`}
          className="app-tabs__panel"
          role="tabpanel"
          aria-labelledby={`tab-${activeTab.id}`}
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}
