/**
 * @contribution-margin/chartjs - Treemap Plugin
 * Chart.js plugin for CVP treemap charts
 */

import type { Chart, Plugin } from 'chart.js';
import {
  CVPCalculator,
  CVPValidator,
  TreemapLayoutEngine,
  DEFAULT_DISPLAY_OPTIONS,
  type DisplayOptions,
  type CVPResult,
  type TreemapBlock,
  type Annotation,
} from '@contribution-margin/core';

import type { ContributionMarginPluginOptions } from './types';
import { TreemapRenderer } from './TreemapRenderer';

/**
 * Extended chart type with CVP treemap data
 */
interface CVPTreemapChart extends Chart<'bar'> {
  $cvpTreemap?: {
    blocks: TreemapBlock[];
    annotations: Annotation[];
    results: CVPResult[];
    options: DisplayOptions;
    salesValue: number;
  };
}

/**
 * Contribution Margin Treemap Plugin
 */
export const ContributionMarginTreemapPlugin: Plugin<'bar', ContributionMarginPluginOptions> = {
  id: 'contributionMarginTreemap',

  /**
   * Called before chart initialization
   */
  beforeInit(chart: CVPTreemapChart, _args, options) {
    if (!options?.input) return;

    const cvpData = processTreemapData(options);
    if (cvpData) {
      chart.$cvpTreemap = cvpData;
    }
  },

  /**
   * Called before datasets update
   */
  beforeUpdate(chart: CVPTreemapChart, _args, options) {
    if (!chart.$cvpTreemap && options?.input) {
      const cvpData = processTreemapData(options);
      if (cvpData) {
        chart.$cvpTreemap = cvpData;
      }
    }

    // Configure chart for treemap display
    if (chart.$cvpTreemap) {
      // Hide default axes and grid
      chart.options.scales = {
        x: { display: false },
        y: { display: false },
      };

      // Disable default legend
      chart.options.plugins = {
        ...chart.options.plugins,
        legend: { display: false },
      };
    }
  },

  /**
   * Called after chart is drawn - render treemap
   */
  afterDraw(chart: CVPTreemapChart, _args, options) {
    const cvpData = chart.$cvpTreemap;
    if (!cvpData) return;

    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    if (!chartArea) return;

    // Create treemap renderer
    const renderer = new TreemapRenderer(ctx, chartArea, cvpData.options);

    // Clear chart area (render on top of default Chart.js rendering)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(
      chartArea.left,
      chartArea.top,
      chartArea.right - chartArea.left,
      chartArea.bottom - chartArea.top
    );

    // Render treemap blocks
    renderer.renderBlocks(cvpData.blocks);

    // Render annotations
    renderer.renderAnnotations(cvpData.annotations, cvpData.salesValue);

    // Render metrics if configured
    if (options?.metrics) {
      const position = options.metrics.position === 'top' ? 'top' : 'bottom';
      renderer.renderMetrics(cvpData.results, position);
    }
  },

  /**
   * Default options
   */
  defaults: {
    display: DEFAULT_DISPLAY_OPTIONS,
  },
};

/**
 * Process CVP data for treemap layout
 */
function processTreemapData(options: ContributionMarginPluginOptions) {
  const { input, display } = options;
  if (!input) return null;

  const calculator = new CVPCalculator();
  const validator = new CVPValidator();
  const layoutEngine = new TreemapLayoutEngine(display);

  const inputs = Array.isArray(input) ? input : [input];
  const results: CVPResult[] = [];
  let allBlocks: TreemapBlock[] = [];
  let allAnnotations: Annotation[] = [];
  let salesValue = 0;

  for (const inputData of inputs) {
    const validation = validator.validate(inputData);
    if (!validation.isValid) {
      console.error('[ContributionMarginTreemapPlugin] Validation failed:', validation.errors);
      continue;
    }

    if (validation.warnings.length > 0) {
      console.warn('[ContributionMarginTreemapPlugin] Warnings:', validation.warnings);
    }

    const result = calculator.calculateResult(inputData);
    const layout = layoutEngine.generateLayout(inputData, result.calculated, display);

    results.push(result);
    allBlocks = [...allBlocks, ...layout.blocks];
    allAnnotations = [...allAnnotations, ...layout.annotations];
    salesValue = inputData.sales;
  }

  if (results.length === 0) return null;

  return {
    blocks: allBlocks,
    annotations: allAnnotations,
    results,
    options: display ?? DEFAULT_DISPLAY_OPTIONS,
    salesValue,
  };
}

/**
 * Register the treemap plugin with Chart.js
 */
export function registerTreemapPlugin(ChartJS: typeof Chart): void {
  ChartJS.register(ContributionMarginTreemapPlugin);
}
