/**
 * @contribution-margin/chartjs - Chart Factory
 * Convenience functions for creating CVP charts
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
 * Options for creating a CVP chart
 */
export interface CreateCVPChartOptions {
  /** CVP input data (single or multiple periods) */
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
  /** Event handlers */
  events?: ContributionMarginPluginOptions['events'];
}

/**
 * Create a Chart.js configuration for CVP chart
 *
 * @param options - CVP chart options
 * @returns Chart.js configuration object
 *
 * @example
 * ```typescript
 * import { Chart } from 'chart.js';
 * import { createCVPChartConfig, ContributionMarginPlugin } from '@contribution-margin/chartjs';
 *
 * Chart.register(ContributionMarginPlugin);
 *
 * const config = createCVPChartConfig({
 *   input: {
 *     sales: 10_000_000,
 *     variableCosts: 6_200_000,
 *     fixedCosts: 3_100_000
 *   }
 * });
 *
 * const chart = new Chart(ctx, config);
 * ```
 */
export function createCVPChartConfig(options: CreateCVPChartOptions): ChartConfiguration<'bar'> {
  const { input, display, metrics, title, events } = options;

  // Get labels from input
  const inputs = Array.isArray(input) ? input : [input];
  const labels = inputs.map(i => i.label ?? '');

  return {
    type: 'bar',
    data: {
      labels,
      datasets: [], // Plugin will handle rendering
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: 'y',
      plugins: {
        title: title
          ? {
              display: true,
              text: title,
              font: {
                size: 16,
                weight: 'bold',
              },
            }
          : undefined,
        legend: {
          display: false,
        },
        tooltip: {
          enabled: display?.enableTooltip ?? true,
        },
        contributionMargin: {
          input,
          display,
          metrics,
          events,
        } as ContributionMarginPluginOptions,
      },
      scales: {
        x: {
          display: true,
          beginAtZero: true,
          grid: {
            display: true,
          },
        },
        y: {
          display: true,
          grid: {
            display: false,
          },
        },
      },
      animation: display?.enableAnimation
        ? {
            duration: display.animationDuration ?? 300,
          }
        : false,
    } as ChartOptions<'bar'>,
  };
}

/**
 * Create and initialize a CVP chart on a canvas element
 *
 * @param canvas - Canvas element or selector
 * @param options - CVP chart options
 * @param ChartJS - Chart.js constructor
 * @returns Chart instance
 *
 * @example
 * ```typescript
 * import { Chart } from 'chart.js';
 * import { createCVPChart, ContributionMarginPlugin } from '@contribution-margin/chartjs';
 *
 * Chart.register(ContributionMarginPlugin);
 *
 * const chart = createCVPChart('#myChart', {
 *   input: {
 *     sales: 10_000_000,
 *     variableCosts: 6_200_000,
 *     fixedCosts: 3_100_000
 *   }
 * }, Chart);
 * ```
 */
export function createCVPChart(
  canvas: HTMLCanvasElement | string,
  options: CreateCVPChartOptions,
  ChartJS: typeof Chart
): Chart<'bar'> {
  // Get canvas element
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

  // Get context
  const ctx = canvasElement.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D context from canvas');
  }

  // Set canvas size if specified
  if (options.width) {
    canvasElement.width = options.width;
  }
  if (options.height) {
    canvasElement.height = options.height;
  }

  // Create chart
  const config = createCVPChartConfig(options);
  return new ChartJS(ctx, config);
}

/**
 * Update an existing CVP chart with new data
 *
 * @param chart - Existing Chart instance
 * @param input - New CVP input data
 * @param display - Optional display options
 */
export function updateCVPChart(
  chart: Chart<'bar'>,
  input: CVPInput | CVPInputArray,
  display?: DisplayOptions
): void {
  // Access plugin options with type assertion
  const pluginsOptions = chart.options.plugins as Record<string, unknown> | undefined;
  const pluginOptions = pluginsOptions?.contributionMargin as
    | ContributionMarginPluginOptions
    | undefined;

  if (pluginOptions) {
    pluginOptions.input = input;
    if (display) {
      pluginOptions.display = display;
    }
  }

  // Clear cached CVP data
  (chart as unknown as { $cvp: unknown }).$cvp = undefined;

  // Update chart
  chart.update();
}
