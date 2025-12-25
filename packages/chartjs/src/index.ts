/**
 * @bobeec/contribution-margin-chart
 * Chart.js plugin for CVP (Cost-Volume-Profit) analysis charts
 *
 * This library implements general CVP analysis (Cost-Volume-Profit Analysis)
 * and is not affiliated with any specific trademarked accounting methodology.
 *
 * @packageDocumentation
 */

// Plugin - Horizontal Stacked Bar (Original)
// Plugin - Horizontal Stacked Bar (Original)
import { ContributionMarginPlugin, registerContributionMarginPlugin } from './plugin';
export { ContributionMarginPlugin, registerContributionMarginPlugin };

// Plugin - Treemap (v0.2.0)
// Plugin - Treemap (v0.2.0)
import { ContributionMarginTreemapPlugin, registerTreemapPlugin } from './treemapPlugin';
export { ContributionMarginTreemapPlugin, registerTreemapPlugin };

// Chart factory functions
export { createCVPChart, createCVPChartConfig, updateCVPChart } from './chart';
export { createTreemapChart, createTreemapChartConfig } from './treemapChart';
export type { CreateCVPChartOptions } from './chart';

// Renderer (for advanced usage)
export { CVPRenderer } from './renderer';
export { TreemapRenderer } from './TreemapRenderer';

// Types
export type {
  ContributionMarginPluginOptions,
  CVPChartData,
  CVPChart,
  BarSegment,
  AnnotationPosition,
  CVPTooltipContext,
} from './types';

// Re-export commonly used types from core
export type {
  CVPInput,
  CVPInputArray,
  CVPCalculatedValues,
  CVPResult,
  DisplayOptions,
  MetricsConfig,
  Segment,
  Annotation,
  ColorPalette,
  ValidationResult,
  Warning,
} from '@bobeec/contribution-margin-core';

// Re-export core utilities for convenience
export {
  CVPCalculator,
  CVPValidator,
  LayoutEngine,
  TreemapLayoutEngine,
  ValueFormatter,
  DEFAULT_COLORS,
  SAMPLE_DATA,
  calculateCVP,
  validateCVP,
  formatValue,
} from '@bobeec/contribution-margin-core';

// Re-export treemap types
// @ts-ignore
export type { TreemapBlock, TreemapLayoutOutput } from '@bobeec/contribution-margin-core';

// Auto-register plugin in browser environments if Chart.js is present
if (typeof window !== 'undefined' && (window as any).Chart) {
  (window as any).Chart.register(ContributionMarginPlugin);
  (window as any).Chart.register(ContributionMarginTreemapPlugin);
}
