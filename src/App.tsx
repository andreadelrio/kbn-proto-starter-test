import React, { useState } from 'react';
import { EuiProvider } from '@elastic/eui';
import { KibanaChromeLayout } from '@elastic/kbn-proto-ui';
import { useChartsStylesheet } from './chartsTheme';
import { MyPage } from './pages/MyPage';
import { PanelContent } from './prototype/PanelContent';
import {
  PrototypeSettings,
  PrototypeSettingsProvider,
  usePrototypeSettings,
  usePrototypeSettingsLayout,
} from './prototype/PrototypeSettings';

/**
 * Your prototype's pages, keyed by their id in the side navigation. Kibana's
 * own nav items stay visible but only the ids listed here open a page.
 */
const PAGES: Record<string, { readonly title: string; readonly render: () => React.ReactNode }> = {
  'my-page': { title: 'New flow', render: () => <MyPage /> },
};

const FIRST_PAGE = 'my-page';

const Prototype = () => {
  const { colorMode } = usePrototypeSettings();
  useChartsStylesheet(colorMode);
  const [currentPage, setCurrentPage] = useState(FIRST_PAGE);
  const page = PAGES[currentPage];
  // The AI Agent opens in Kibana's sidebar. It's yours to change.
  const [agentOpen, setAgentOpen] = useState(false);
  // The Prototype settings button after the avatar, and room for its panel beside Kibana.
  const prototypeSettingsLayout = usePrototypeSettingsLayout();

  return (
    <EuiProvider
      colorMode={colorMode}
      // Flyouts open inside Kibana's application area, below the header and beside the nav and sidebar.
      componentDefaults={{ EuiFlyout: { container: '#app-main-scroll' } }}
    >
      <KibanaChromeLayout
        solution="observability"
        // Adds this prototype's page to the top of Kibana's Observability menu.
        navItems={(nav) => ({
          ...nav,
          primaryItems: [{ id: 'my-page', label: 'My page', iconType: 'cube', href: '#' }, ...nav.primaryItems],
        })}
        activeNavItem={currentPage}
        onNavigate={(id) => {
          if (PAGES[id]) setCurrentPage(id);
        }}
        breadcrumbs={[{ text: page.title }]}
        appHeader={{ title: page.title }}
        agent={{ open: agentOpen, onOpenChange: setAgentOpen }}
        {...prototypeSettingsLayout}
      >
        {page.render()}
      </KibanaChromeLayout>
      <PrototypeSettings panelContent={<PanelContent currentPage={currentPage} />} />
    </EuiProvider>
  );
};

export const App = () => (
  <PrototypeSettingsProvider>
    <Prototype />
  </PrototypeSettingsProvider>
);
