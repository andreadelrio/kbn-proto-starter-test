/**
 * Your prototype's settings and their defaults. Add one line per setting, then
 * give it a control in PanelContent.tsx and read it in your page with
 * usePrototypeSettings(). See AGENTS.md for the guidelines.
 */
export const defaultSettings = {
  data: 'withData' as 'empty' | 'withData',
  showUpgradeBanner: false,
};

export type Settings = typeof defaultSettings;
