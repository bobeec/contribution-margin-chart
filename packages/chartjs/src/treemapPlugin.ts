/**
 * @contribution-margin/chartjs - Treemap Plugin
 * Chart.js plugin for CVP treemap charts
 * 
 * 赤字（損失）の場合：
 * - negative-bar モード: 右側のコストが売上を超えた分、下にはみ出る
 * - separate モード: 損失を別ブロックとして表示
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
  type TreemapLayoutOutput,
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
    /** Layout metadata including loss extension info */
    layoutMeta: TreemapLayoutOutput['meta'];
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
   * 
   * 赤字の場合、heightExtension > 1.0 となり、全体をスケーリングして描画
   * これにより損失部分が「下にはみ出る」ように見える
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

    // Render treemap blocks with layout metadata
    // layoutMeta.heightExtension を使って、損失部分も含めてスケーリング描画
    renderer.renderBlocks(cvpData.blocks, cvpData.layoutMeta);

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
  let layoutMeta: TreemapLayoutOutput['meta'] = {
    hasLoss: false,
    hasBEP: false,
    salesValue: 0,
    heightExtension: 1,
  };

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
    layoutMeta = layout.meta;
  }

  if (results.length === 0) return null;

  return {
    blocks: allBlocks,
    annotations: allAnnotations,
    results,
    options: display ?? DEFAULT_DISPLAY_OPTIONS,
    salesValue,
    layoutMeta,
  };
}

/**
 * Register the treemap plugin with Chart.js
 */
export function registerTreemapPlugin(ChartJS: typeof Chart): void {
  ChartJS.register(ContributionMarginTreemapPlugin);
}
