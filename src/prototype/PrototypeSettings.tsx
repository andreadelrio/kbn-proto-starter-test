import { createContext, useContext, useState, type ReactNode, type SVGProps } from 'react';
import {
  EuiButtonIcon,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiTitle,
  EuiToolTip,
  EuiWrappingPopover,
} from '@elastic/eui';
import type { KibanaChromeLayoutProps } from '@elastic/kbn-proto-ui';
import { defaultSettings, type Settings } from './settings';

/**
 * The prototype settings panel: its state, its header button and its frame.
 * You don't need to edit this file. Add settings in settings.ts and controls in PanelContent.tsx.
 *
 * - The panel never uses Kibana's sidebar, so your own sidebar (like the AI Agent) stays free.
 *   It's always outside Kibana, full height at the window's right edge: over the page, it sits
 *   on top of Kibana; beside the page, the whole Kibana frame makes room for it.
 * - The panel's menu bar holds the theme button, the More menu (where the panel opens) and Close.
 * - Whether it's open, where it opens and the theme are remembered in this browser.
 * - `?prototype=off` in the URL hides the button and panel, for screenshots and recordings.
 */

export type ColorMode = 'light' | 'dark';
export type PanelMode = 'overlay' | 'push';

const PANEL_WIDTH = 400;

/** `?prototype=off` hides every prototype tool for this page load. */
const toolsHidden = new URLSearchParams(window.location.search).get('prototype') === 'off';

const STORAGE_PREFIX = 'prototype.';

const readStored = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
  try {
    const value = window.localStorage.getItem(STORAGE_PREFIX + key);
    return allowed.includes(value as T) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
};

const store = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, value);
  } catch {
    // Storage is blocked: the choice lasts until the page reloads.
  }
};

/** useState that is saved in this browser. */
const useStoredState = <T extends string>(key: string, allowed: readonly T[], fallback: T) => {
  const [value, setValue] = useState<T>(() => readStored(key, allowed, fallback));
  const set = (next: T) => {
    setValue(next);
    store(key, next);
  };
  return [value, set] as const;
};

interface PrototypeSettingsValue {
  readonly settings: Settings;
  readonly update: (changes: Partial<Settings>) => void;
  readonly colorMode: ColorMode;
  readonly setColorMode: (mode: ColorMode) => void;
  readonly panelMode: PanelMode;
  readonly setPanelMode: (mode: PanelMode) => void;
  readonly isPanelOpen: boolean;
  readonly setPanelOpen: (open: boolean) => void;
}

const PrototypeSettingsContext = createContext<PrototypeSettingsValue | null>(null);

export const PrototypeSettingsProvider = ({ children }: { readonly children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [colorMode, setColorMode] = useStoredState<ColorMode>('theme', ['light', 'dark'], 'light');
  const [panelMode, setPanelMode] = useStoredState<PanelMode>('panelMode', ['overlay', 'push'], 'overlay');
  const [panelOpen, setPanelOpenStored] = useStoredState<'open' | 'closed'>('panel', ['open', 'closed'], 'closed');
  const update = (changes: Partial<Settings>) => setSettings((current) => ({ ...current, ...changes }));

  return (
    <PrototypeSettingsContext.Provider
      value={{
        settings,
        update,
        colorMode,
        setColorMode,
        panelMode,
        setPanelMode,
        isPanelOpen: !toolsHidden && panelOpen === 'open',
        setPanelOpen: (open) => setPanelOpenStored(open ? 'open' : 'closed'),
      }}
    >
      {children}
    </PrototypeSettingsContext.Provider>
  );
};

export const usePrototypeSettings = (): PrototypeSettingsValue => {
  const value = useContext(PrototypeSettingsContext);
  if (!value) throw new Error('usePrototypeSettings needs PrototypeSettingsProvider around the app.');
  return value;
};

/**
 * Props for KibanaChromeLayout: the header button and, while the panel is beside the page,
 * the room Kibana leaves for it at the window's right edge.
 */
export const usePrototypeSettingsLayout = () => {
  const { panelMode, isPanelOpen, setPanelOpen } = usePrototypeSettings();
  return {
    header: {
      afterUserMenu: toolsHidden ? null : (
        <PrototypeSettingsButton isOpen={isPanelOpen} onClick={() => setPanelOpen(!isPanelOpen)} />
      ),
    },
    reservedInlineEnd: isPanelOpen && panelMode === 'push' ? PANEL_WIDTH : 0,
  } satisfies Partial<KibanaChromeLayoutProps>;
};

/**
 * The prototype settings panel: an EUI flyout, always outside Kibana, full height at the
 * window's right edge. Over the page, it covers Kibana. Beside the page, KibanaChromeLayout
 * leaves room for it (reservedInlineEnd in usePrototypeSettingsLayout), so it covers nothing.
 * It stays an overlay flyout in both: a push flyout would also pad the page body, and Kibana
 * would make room twice.
 * The panel never uses Kibana's sidebar, so your own sidebar (like the AI Agent) stays free.
 */
export const PrototypeSettings = ({ panelContent }: { readonly panelContent: ReactNode }) => {
  const { isPanelOpen, setPanelOpen, colorMode, setColorMode } = usePrototypeSettings();
  const [moreAnchor, setMoreAnchor] = useState<HTMLElement | null>(null);
  if (!isPanelOpen) return null;
  const themeLabel = colorMode === 'light' ? 'Switch to dark theme' : 'Switch to light theme';

  return (
    <>
      <EuiFlyout
        type="overlay"
        side="right"
        size={PANEL_WIDTH}
        paddingSize="l"
        ownFocus={false}
        onClose={() => setPanelOpen(false)}
        aria-labelledby={TITLE_ID}
        // Outside Kibana: against the window, not the app's flyout container (see App.tsx).
        container={null}
        flyoutMenuProps={{
          trailingActions: [
            {
              iconType: colorMode === 'light' ? 'moon' : 'sun',
              'aria-label': themeLabel,
              toolTipContent: themeLabel,
              onClick: () => setColorMode(colorMode === 'light' ? 'dark' : 'light'),
              'data-test-subj': 'prototypeSettingsThemeButton',
            },
            {
              iconType: 'ellipsis',
              'aria-label': 'More prototype settings',
              onClick: (event) => setMoreAnchor(moreAnchor ? null : event.currentTarget),
              'data-test-subj': 'prototypeSettingsMoreButton',
            },
          ],
        }}
        data-test-subj="prototypeSettingsPanel"
      >
        <EuiFlyoutHeader>
          <EuiTitle size="s">
            <h2 id={TITLE_ID}>Prototype settings</h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>{panelContent}</EuiFlyoutBody>
      </EuiFlyout>
      {moreAnchor ? <PanelMoreMenu anchor={moreAnchor} onClose={() => setMoreAnchor(null)} /> : null}
    </>
  );
};

const TITLE_ID = 'prototypeSettingsTitle';

/** The header button, placed after the avatar in the slot kbn-proto-ui keeps for prototype tools. */
const PrototypeSettingsButton = ({ isOpen, onClick }: { readonly isOpen: boolean; readonly onClick: () => void }) => (
  <EuiToolTip content="Prototype settings" disableScreenReaderOutput>
    <EuiButtonIcon
      iconType="controls"
      display={isOpen ? 'fill' : 'base'}
      color="text"
      size="s"
      aria-label="Prototype settings"
      aria-expanded={isOpen}
      onClick={onClick}
      data-test-subj="prototypeSettingsButton"
    />
  </EuiToolTip>
);

/** The More menu: where the panel opens. */
const PLACEMENT_LABEL_ID = 'prototypeSettingsPlacementLabel';

const PanelMoreMenu = ({ anchor, onClose }: { readonly anchor: HTMLElement; readonly onClose: () => void }) => {
  const { panelMode, setPanelMode } = usePrototypeSettings();

  return (
    <EuiWrappingPopover
      button={anchor}
      aria-label="More prototype settings"
      isOpen
      closePopover={onClose}
      anchorPosition="downRight"
      panelPaddingSize="m"
      // The width is on the popover itself, so EUI places it at its full width and it never runs off the window.
      panelStyle={{ inlineSize: 320 }}
    >
      <EuiFlexGroup
        role="group"
        aria-labelledby={PLACEMENT_LABEL_ID}
        alignItems="center"
        justifyContent="spaceBetween"
        gutterSize="l"
        responsive={false}
        data-test-subj="prototypeSettingsPlacement"
      >
        <EuiFlexItem grow={false}>
          <EuiText size="s" id={PLACEMENT_LABEL_ID}>
            <span>Placement</span>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          {/* One icon button per placement, like a browser inspector's dock-side buttons. */}
          <EuiFlexGroup gutterSize="s" responsive={false}>
            {PLACEMENTS.map(({ mode, label, icon }) => (
              <EuiFlexItem key={mode} grow={false}>
                <EuiToolTip content={label} disableScreenReaderOutput>
                  <EuiButtonIcon
                    iconType={icon}
                    iconSize="l"
                    color={panelMode === mode ? 'primary' : 'text'}
                    aria-label={label}
                    aria-pressed={panelMode === mode}
                    onClick={() => {
                      setPanelMode(mode);
                      onClose();
                    }}
                    data-test-subj={`prototypeSettingsPlacement-${mode}`}
                  />
                </EuiToolTip>
              </EuiFlexItem>
            ))}
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiWrappingPopover>
  );
};

/**
 * A window with a panel on top of its right side. EUI has no icon for it.
 * 1px lines like EUI icons; the viewBox leaves a margin so the corners aren't clipped.
 */
const OverThePageIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="-1 -1 24 18" aria-hidden {...props}>
    <g fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="0.5" y="0.5" width="21" height="15" rx="2.5" />
      <path d="M3.5 4.5h8M3.5 7.5h8" />
      <rect x="14.5" y="2.5" width="5" height="11" rx="1" fill="currentColor" fillOpacity="0.25" />
    </g>
  </svg>
);

/** A window split into the page and a panel beside it. EUI has no icon for it. */
const BesideThePageIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="-1 -1 24 18" aria-hidden {...props}>
    <g fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M15.5 0.5h3.5a2.5 2.5 0 0 1 2.5 2.5v10a2.5 2.5 0 0 1-2.5 2.5h-3.5z" fill="currentColor" fillOpacity="0.25" stroke="none" />
      <rect x="0.5" y="0.5" width="21" height="15" rx="2.5" />
      <path d="M3.5 4.5h8M3.5 7.5h8M15.5 0.5v15" />
    </g>
  </svg>
);

const PLACEMENTS: ReadonlyArray<{
  readonly mode: PanelMode;
  readonly label: string;
  readonly icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
}> = [
  { mode: 'push', label: 'Beside the page', icon: BesideThePageIcon },
  { mode: 'overlay', label: 'Over the page', icon: OverThePageIcon },
];
