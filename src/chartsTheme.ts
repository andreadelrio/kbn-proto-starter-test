import { useEffect } from 'react';
import lightCss from '@elastic/charts/dist/theme_light.css?inline';
import darkCss from '@elastic/charts/dist/theme_dark.css?inline';

/** Loads Elastic Charts' stylesheet for the current theme (tooltips, legends, sizing). */
export const useChartsStylesheet = (colorMode: 'light' | 'dark'): void => {
  useEffect(() => {
    const style = document.createElement('style');
    style.dataset.elasticCharts = colorMode;
    style.textContent = colorMode === 'dark' ? darkCss : lightCss;
    document.head.appendChild(style);
    return () => style.remove();
  }, [colorMode]);
};
