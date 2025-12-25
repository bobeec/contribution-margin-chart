/**
 * @bobeec/contribution-margin-chart - Plugin
 * Chart.js plugin for CVP analysis charts
 */

import type { Chart, Plugin } from 'chart.js';
import {
  CVPCalculator,
  CVPValidator,
  LayoutEngine,
  DEFAULT_DISPLAY_OPTIONS,
  type DisplayOptions,
  type CVPResult,
  type Segment,
  type Annotation,
} from '@bobeec/contribution-margin-core';

import type { ContributionMarginPluginOptions, CVPChartData, CVPChart } from './types';
import { CVPRenderer } from './renderer';

/**
 * Contribution Margin Chart.js Plugin
 *
 * This plugin transforms a standard Chart.js bar chart into a CVP analysis visualization.
 * It automatically calculates metrics, generates segments, and renders annotations.
 *
 * @example
 * ```typescript
 * import { Chart } from 'chart.js';
 * import { ContributionMarginPlugin } from '@bobeec/contribution-margin-chart';
 *
 * Chart.register(ContributionMarginPlugin);
 *
 * const chart = new Chart(ctx, {
 *   type: 'bar',
 *   options: {
 *     plugins: {
 *       contributionMargin: {
 *         input: {
 *           sales: 10_000_000,
 *           variableCosts: 6_200_000,
 *           fixedCosts: 3_100_000
 *         },
 *         display: {
 *           showBEPLine: true,
 *           lossDisplayMode: 'negative-bar'
 *         }
 *       }
 *     }
 *   }
 * });
 * ```
 */
export const ContributionMarginPlugin: Plugin<'bar', ContributionMarginPluginOptions> = {
  id: 'contributionMargin',

  /**
   * Called before chart initialization
   * Process CVP data and prepare for rendering
   */
  beforeInit(chart: CVPChart, _args, options) {
    if (!options?.input) {
      return;
    }

    const cvpData = processCVPData(options);
    if (cvpData) {
      chart.$cvp = cvpData;
    }
  },

  /**
   * Called before datasets are updated
   * Transform CVP segments into Chart.js datasets
   */
  beforeUpdate(chart: CVPChart, _args, options) {
    if (!chart.$cvp && options?.input) {
      const cvpData = processCVPData(options);
      if (cvpData) {
        chart.$cvp = cvpData;
      }
    }

    if (!chart.$cvp) {
      return;
    }

    // Configure chart for horizontal bar display
    chart.options.indexAxis = 'y';
    
    // Get max value from CVP data for proper scale
    const maxValue = chart.$cvp?.results[0]?.input.sales ?? 0;
    const displayOptions = chart.$cvp?.options;
    
    chart.options.scales = {
      x: {
        type: 'linear',
        display: true,
        min: 0,
        max: maxValue > 0 ? maxValue * 1.1 : undefined, // Add 10% padding
        grid: {
          display: true,
          color: '#E5E5E5',
        },
        ticks: {
          stepSize: maxValue > 0 ? calculateStepSize(maxValue) : undefined,
          callback: function(value) {
            // Format axis ticks
            if (typeof value === 'number') {
              return formatAxisValue(value, displayOptions);
            }
            return value;
          },
        },
      },
      y: {
        display: true,
        grid: {
          display: false,
        },
      },
    };

    // Disable default legend (we'll render our own)
    chart.options.plugins = {
      ...chart.options.plugins,
      legend: {
        display: false,
      },
    };
  },

  /**
   * Called after chart is drawn
   * Render CVP-specific elements (segments, annotations, metrics)
   */
  afterDraw(chart: CVPChart, _args, options) {
    const cvpData = chart.$cvp;
    if (!cvpData) {
      return;
    }

    const ctx = chart.ctx;
    const chartArea = chart.chartArea;

    if (!chartArea) {
      return;
    }

    // Create renderer
    const renderer = new CVPRenderer(
      ctx,
      chartArea,
      cvpData.options,
      cvpData.results[0]?.input.sales ?? 0
    );

    // Render segments
    renderer.renderSegments(cvpData.segments);

    // Render annotations
    renderer.renderAnnotations(cvpData.annotations);

    // Render metrics if configured
    if (options?.metrics) {
      const position = options.metrics.position ?? 'top';
      // Filter out 'inline' position since renderer only supports top/bottom/side
      const validPosition = position === 'inline' ? 'top' : position;
      renderer.renderMetrics(cvpData.results, validPosition);
    }
  },

  /**
   * Handle click events on segments
   */
  afterEvent(chart: CVPChart, args, options) {
    if (!chart.$cvp || !options?.events?.onSegmentClick) {
      return;
    }

    const event = args.event;
    if (event.type !== 'click') {
      return;
    }

    const segment = findSegmentAtPosition(
      chart,
      event.x ?? 0,
      event.y ?? 0
    );

    if (segment && event.native) {
      options.events.onSegmentClick(
        segment,
        event.native as MouseEvent,
        chart.$cvp.results[0]
      );
    }
  },

  /**
   * Default options for the plugin
   */
  defaults: {
    display: DEFAULT_DISPLAY_OPTIONS,
  },
};

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Process CVP input data and generate layout
 */
function processCVPData(options: ContributionMarginPluginOptions): CVPChartData | null {
  const { input, display } = options;

  if (!input) {
    return null;
  }

  const calculator = new CVPCalculator();
  const validator = new CVPValidator();
  const layoutEngine = new LayoutEngine(display);

  // Handle single or multiple inputs
  const inputs = Array.isArray(input) ? input : [input];
  const results: CVPResult[] = [];
  const allSegments: Segment[] = [];
  const allAnnotations: Annotation[] = [];

  for (const inputData of inputs) {
    // Validate input
    const validation = validator.validate(inputData);
    if (!validation.isValid) {
      console.error('[ContributionMarginPlugin] Validation failed:', validation.errors);
      continue;
    }

    // Log warnings
    if (validation.warnings.length > 0) {
      console.warn('[ContributionMarginPlugin] Warnings:', validation.warnings);
    }

    // Calculate and generate layout
    const result = calculator.calculateResult(inputData);
    const layout = layoutEngine.generateLayout(inputData, result.calculated, display);

    results.push(result);
    allSegments.push(...layout.segments);
    allAnnotations.push(...layout.annotations);
  }

  if (results.length === 0) {
    return null;
  }

  return {
    segments: allSegments,
    annotations: allAnnotations,
    results,
    options: display ?? DEFAULT_DISPLAY_OPTIONS,
  };
}

/**
 * Calculate appropriate step size for axis ticks
 */
function calculateStepSize(maxValue: number): number {
  // Find a nice round step size that gives roughly 5-10 ticks
  const roughStep = maxValue / 5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;
  
  let niceStep: number;
  if (normalized <= 1) {
    niceStep = magnitude;
  } else if (normalized <= 2) {
    niceStep = 2 * magnitude;
  } else if (normalized <= 5) {
    niceStep = 5 * magnitude;
  } else {
    niceStep = 10 * magnitude;
  }
  
  return niceStep;
}

/**
 * Format value for axis display
 */
function formatAxisValue(value: number, options?: DisplayOptions): string {
  const unitMode = options?.unitMode ?? 'thousand';
  const locale = options?.locale ?? 'ja-JP';
  const currencySymbol = options?.currencySymbol ?? '¥';

  // Handle zero
  if (value === 0) {
    return '0';
  }

  switch (unitMode) {
    case 'thousand': {
      const thousands = value / 1000;
      // Format as integer if it's a whole number
      const formatted = Number.isInteger(thousands) 
        ? thousands.toLocaleString(locale)
        : thousands.toLocaleString(locale, { maximumFractionDigits: 1 });
      return `${currencySymbol}${formatted}千円`;
    }
    case 'million': {
      const millions = value / 1_000_000;
      const formatted = Number.isInteger(millions)
        ? millions.toLocaleString(locale)
        : millions.toLocaleString(locale, { maximumFractionDigits: 1 });
      return `${currencySymbol}${formatted}百万円`;
    }
    case 'billion': {
      const billions = value / 1_000_000_000;
      const formatted = Number.isInteger(billions)
        ? billions.toLocaleString(locale)
        : billions.toLocaleString(locale, { maximumFractionDigits: 1 });
      return `${currencySymbol}${formatted}億円`;
    }
    default:
      return `${currencySymbol}${value.toLocaleString(locale)}`;
  }
}

/**
 * Find segment at given canvas position
 */
function findSegmentAtPosition(
  chart: CVPChart,
  x: number,
  y: number
): Segment | null {
  const cvpData = chart.$cvp;
  if (!cvpData || !chart.chartArea) {
    return null;
  }

  const { left, right, top, bottom } = chart.chartArea;
  const chartWidth = right - left;
  const chartHeight = bottom - top;
  const maxValue = cvpData.results[0]?.input.sales ?? 0;

  if (maxValue === 0) {
    return null;
  }

  // Calculate row height
  const rowHeight = chartHeight / 2;

  // Check which row the click is in
  const rowIndex = Math.floor((y - top) / rowHeight);

  // Filter segments by row
  const segmentsInRow = cvpData.segments.filter(s => {
    if (rowIndex === 0) return s.type === 'sales';
    return s.type !== 'sales';
  });

  // Check if click is within any segment
  for (const segment of segmentsInRow) {
    const segmentLeft = left + (segment.start / maxValue) * chartWidth;
    const segmentRight = segmentLeft + (segment.width / maxValue) * chartWidth;

    if (x >= segmentLeft && x <= segmentRight) {
      return segment;
    }
  }

  return null;
}

/**
 * Register the plugin with Chart.js
 */
export function registerContributionMarginPlugin(ChartJS: typeof Chart): void {
  ChartJS.register(ContributionMarginPlugin);
}
