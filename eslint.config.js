// Keeps prototypes on EUI: its components, its theme tokens, no custom styling.
// `npm run check` runs this with --max-warnings=0, so a warning fails the check too.
// Each message says what to use instead, so whoever reads it (person or agent) can fix it.
import tseslint from 'typescript-eslint';
import eui from '@elastic/eslint-plugin-eui';

/** HTML elements that have an EUI component. The key is the element, the value is what to use. */
const ELEMENTS_WITH_EUI_COMPONENTS = {
  button: 'EuiButton, EuiButtonEmpty or EuiButtonIcon',
  a: 'EuiLink (or the href prop of an EUI button)',
  input: 'EuiFieldText, EuiFieldNumber, EuiFieldSearch, EuiCheckbox, EuiRadio or EuiSwitch',
  select: 'EuiSelect, EuiSuperSelect or EuiComboBox',
  textarea: 'EuiTextArea',
  label: 'EuiFormRow (its label prop)',
  table: 'EuiBasicTable, EuiInMemoryTable or EuiTable',
  hr: 'EuiHorizontalRule',
  img: 'EuiImage',
};

/**
 * Elastic's EUI rules about using EUI correctly (theme colors, current icons, component props).
 * Its accessibility rules are left out: these are prototypes, not production code.
 */
const EUI_RULES = Object.fromEntries(
  Object.entries(eui.configs.recommended.rules).filter(
    ([rule]) =>
      ![
        'accessible-interactive-element',
        'badge-accessibility-rules',
        'callout-announce-on-mount',
        'consistent-is-invalid-props',
        'icon-accessibility-rules',
        'no-nested-copy-tooltip',
        'no-nested-interactive-element',
        'no-unnamed-interactive-element',
        'no-unnamed-radio-group',
        'prefer-eui-icon-tip',
        'require-aria-label-for-modals',
        'require-table-caption',
        'sr-output-disabled-tooltip',
        'tooltip-button-icon-wrap',
        'tooltip-focusable-anchor',
        'tooltip-no-interactive-content',
      ].includes(rule.replace('@elastic/eui/', '')),
  ),
);

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { '@elastic/eui': eui },
    rules: {
      ...EUI_RULES,

      'no-restricted-syntax': [
        'error',
        ...Object.entries(ELEMENTS_WITH_EUI_COMPONENTS).map(([element, instead]) => ({
          selector: `JSXOpeningElement[name.name='${element}']`,
          message: `Use ${instead} instead of a plain <${element}>.`,
        })),
        {
          selector: "JSXAttribute[name.name='style']",
          message:
            'No inline styles. Use EUI component props first (like padding, color, size), then EUI layout components (EuiFlexGroup, EuiSpacer, EuiPanel), then the css prop with values from useEuiTheme().',
        },
        {
          selector: "JSXAttribute[name.name='className']",
          message:
            'No custom class names. Style with EUI component props, or the css prop with values from useEuiTheme().',
        },
        {
          selector: 'TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b|rgba?\\(|hsla?\\(/]',
          message: 'No hard-coded colors. Use euiTheme.colors from useEuiTheme(), so light and dark both work.',
        },
        {
          selector: 'Literal[value=/^(#[0-9a-fA-F]{3,8}|rgba?\\(.*|hsla?\\(.*)$/]',
          message: 'No hard-coded colors. Use euiTheme.colors from useEuiTheme(), so light and dark both work.',
        },
        {
          selector: 'TemplateElement[value.raw=/\\d+(\\.\\d+)?(px|rem|em)\\b/]',
          message:
            'No hard-coded sizes. Use euiTheme.size (like euiTheme.size.m) from useEuiTheme(), or an EUI component size prop.',
        },
        {
          selector: 'Literal[value=/^\\d+(\\.\\d+)?(px|rem|em)$/]',
          message:
            'No hard-coded sizes. Use euiTheme.size (like euiTheme.size.m) from useEuiTheme(), or an EUI component size prop.',
        },
        {
          selector: 'TemplateElement[value.raw=/font-(family|size|weight)\\s*:/]',
          message: 'No custom fonts or text sizes. Use EuiText, EuiTitle or EuiTextColor and their size props.',
        },
      ],

      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              // Elastic Charts' own theme stylesheets are the one exception (see src/chartsTheme.ts).
              regex: '^(?!@elastic/charts/).*\\.(css|scss|sass|less)(\\?.*)?$',
              message: 'No stylesheets. Style with EUI component props, or the css prop with values from useEuiTheme().',
            },
            {
              regex:
                '^(@mui/|@chakra-ui/|antd|bootstrap|react-bootstrap|tailwindcss|styled-components|@radix-ui/|@headlessui/|@mantine/|lucide-react|react-icons)',
              message: 'Use EUI (and EuiIcon for icons) instead of another UI library.',
            },
          ],
        },
      ],
    },
  },
);
