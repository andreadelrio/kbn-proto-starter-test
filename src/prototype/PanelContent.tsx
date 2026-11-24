import { EuiFormRow, EuiSelect, EuiSpacer, EuiSwitch, EuiTitle } from '@elastic/eui';
import { usePrototypeSettings } from './PrototypeSettings';

/**
 * Your controls in the prototype settings panel. This example drives My page;
 * replace it with your own. Show only what applies to the current page, use an
 * EuiFormRow with display="columnCompressed" per setting (a compressed switch for
 * on/off, a compressed select for choices), and remove a setting once its decision is made.
 */
export const PanelContent = ({ currentPage }: { readonly currentPage: string }) => {
  const { settings, update } = usePrototypeSettings();

  if (currentPage !== 'my-page') return null;

  return (
    <>
      <EuiTitle size="xxs">
        <h3>This page</h3>
      </EuiTitle>
      <EuiSpacer size="s" />
      <EuiFormRow label="Data" display="columnCompressed">
        <EuiSelect
          compressed
          options={[
            { value: 'empty', text: 'Empty' },
            { value: 'withData', text: 'With data' },
          ]}
          value={settings.data}
          onChange={(event) => update({ data: event.target.value as typeof settings.data })}
        />
      </EuiFormRow>
      <EuiFormRow label="Show upgrade banner" display="columnCompressed">
        <EuiSwitch
          compressed
          label="Show upgrade banner"
          showLabel={false}
          checked={settings.showUpgradeBanner}
          onChange={(event) => update({ showUpgradeBanner: event.target.checked })}
        />
      </EuiFormRow>
    </>
  );
};
