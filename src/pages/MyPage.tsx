import { useState } from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
  useEuiTheme,
} from '@elastic/eui';
import { Axis, BarSeries, Chart, DARK_THEME, LIGHT_THEME, Settings, ScaleType } from '@elastic/charts';
import { css } from '@emotion/react';
import { usePrototypeSettings } from '../prototype/PrototypeSettings';

/** Example page. Replace it with your own; the settings it reads live in prototype/settings.ts. */

const LOGS_PER_HOUR = [12, 18, 9, 27, 31, 22, 16, 25, 38, 29, 21, 14].map((count, hour) => ({
  hour: `${String(hour * 2).padStart(2, '0')}:00`,
  count,
}));

export const MyPage = () => {
  const { euiTheme } = useEuiTheme();
  const { settings, colorMode } = usePrototypeSettings();
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div
      css={css`
        padding: ${euiTheme.size.l};
        overflow: auto;
        min-height: 0;
      `}
    >
      {settings.showUpgradeBanner ? (
        <>
          <EuiCallOut
            title="Upgrade to unlock longer retention"
            iconType="sparkles"
            color="primary"
            size="s"
            actionProps={{ primary: { children: 'See plans' } }}
          />
          <EuiSpacer />
        </>
      ) : null}

      {settings.data === 'empty' ? (
        <EuiEmptyPrompt
          iconType="logsApp"
          title={<h2>No logs yet</h2>}
          body={<p>Add data to see your log volume here.</p>}
          actions={<EuiButton fill>Add data</EuiButton>}
        />
      ) : (
        <EuiPanel hasBorder style={{ background: "#ff0000" }}>
          <EuiFlexGroup alignItems="center" responsive={false}>
            <EuiFlexItem>
              <EuiTitle size="xs">
                <h2>Log volume, last 24 hours</h2>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty size="s" iconType="inspect" onClick={() => setDetailsOpen(true)}>
                View details
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="m" />
          {/* A chart's height goes in its size prop. */}
          <Chart size={{ height: 240 }}>
            <Settings baseTheme={colorMode === 'dark' ? DARK_THEME : LIGHT_THEME} />
            <Axis id="hour" position="bottom" />
            <Axis id="count" position="left" />
            <BarSeries
              id="logs"
              name="Logs"
              data={LOGS_PER_HOUR}
              xScaleType={ScaleType.Ordinal}
              yScaleType={ScaleType.Linear}
              xAccessor="hour"
              yAccessors={['count']}
            />
          </Chart>
        </EuiPanel>
      )}

      {detailsOpen ? (
        <EuiFlyout onClose={() => setDetailsOpen(false)} size="s" aria-labelledby="logDetailsTitle">
          <EuiFlyoutHeader hasBorder>
            <EuiTitle size="s">
              <h2 id="logDetailsTitle">Log volume details</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <EuiText size="s">
              <p>An example of a flyout your page opens. 268 logs in the last 24 hours, peaking at 38 around 16:00.</p>
            </EuiText>
          </EuiFlyoutBody>
        </EuiFlyout>
      ) : null}
    </div>
  );
};
