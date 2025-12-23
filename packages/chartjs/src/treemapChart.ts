/**
 * @contribution-margin/chartjs - Treemap Chart Factory
 * Convenience functions for creating CVP treemap charts
 */

import type { Chart, ChartConfiguration, ChartOptions } from 'chart.js';
import type {
  CVPInput,
  CVPInputArray,
  DisplayOptions,
  MetricsConfig,
} from '@contribution-margin/core';

import type { ContributionMarginPluginOptions } from './types';

/**
 * Options for creating a CVP treemap chart
 */
export interface CreateTreemapChartOptions {
  /** CVP input data */
  input: CVPInput | CVPInputArray;
  /** Display options */
  display?: DisplayOptions;
  /** Metrics configuration */
  metrics?: MetricsConfig;
  /** Chart title */
  title?: string;
  /** Chart width */
  width?: number;
  /** Chart height */
  height?: number;
}

/**
 * Create a Chart.js configuration for CVP treemap chart
 */
export function createTreemapChartConfig(options: CreateTreemapChartOptions): ChartConfiguration<'bar'> {
  const { input, display, metrics, title } = options;

  const inputs = Array.isArray(input) ? input : [input];
  const labels = inputs.map(i => i.label ?? '');

  return {
    type: 'bar',
    data: {
      labels,
      datasets: [], // Plugin handles rendering
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: title
          ? {
              display: true,
              text: title,
              font: { size: 16, weight: 'bold' },
              padding: { bottom: 20 },
            }
          : undefined,
        legend: { display: false },
        tooltip: { enabled: false },
        // Treemap plugin options
        // Note: BEP line is disabled by default for Treemap layout
        contributionMarginTreemap: {
          input,
          display: {
            ...display,
            showValues: display?.showValues ?? true,
            showLabels: display?.showLabels ?? true,
            showBEPLine: display?.showBEPLine ?? false, // Treemapでは通常BEPラインは不要
          },
          metrics,
        } as ContributionMarginPluginOptions,
      },
      scales: {
        x: { display: false },
        y: { display: false },
      },
      animation: false,
    } as ChartOptions<'bar'>,
  };
}

/**
 * Create and initialize a CVP treemap chart
 */
export function createTreemapChart(
  canvas: HTMLCanvasElement | string,
  options: CreateTreemapChartOptions,
  ChartJS: typeof Chart
): Chart<'bar'> {
  let canvasElement: HTMLCanvasElement;

  if (typeof canvas === 'string') {
    const element = document.querySelector(canvas);
    if (!(element instanceof HTMLCanvasElement)) {
      throw new Error(`Element "${canvas}" is not a canvas element`);
    }
    canvasElement = element;
  } else {
    canvasElement = canvas;
  }

  const ctx = canvasElement.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D context from canvas');
  }

  if (options.width) canvasElement.width = options.width;
  if (options.height) canvasElement.height = options.height;

  const config = createTreemapChartConfig(options);
  return new ChartJS(ctx, config);
}
