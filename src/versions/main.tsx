import React from 'react';
import { createRoot } from 'react-dom/client';
import { EuiProvider } from '@elastic/eui';
import { VersionsPage } from './VersionsPage';

/** The theme last chosen in the prototype (it shares this browser storage), else the system's. */
const colorMode = (() => {
  try {
    const stored = window.localStorage.getItem('prototype.theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage is blocked: use the system theme.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
})();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EuiProvider colorMode={colorMode}>
      <VersionsPage />
    </EuiProvider>
  </React.StrictMode>,
);
