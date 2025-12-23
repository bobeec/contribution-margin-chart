/**
 * @contribution-margin/chartjs
 * Chart.js plugin for CVP (Cost-Volume-Profit) analysis charts
 *
 * This library implements general CVP analysis (Cost-Volume-Profit Analysis)
 * and is not affiliated with any specific trademarked accounting methodology.
 *
 * @packageDocumentation
 */

// Plugin - Horizontal Stacked Bar (Original)
export { ContributionMarginPlugin, registerContributionMarginPlugin } from './plugin';

// Plugin - Treemap (v0.2.0)
export { ContributionMarginTreemapPlugin, registerTreemapPlugin } from './treemapPlugin';

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
} from '@contribution-margin/core';

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
} from '@contribution-margin/core';

// Re-export treemap types
export type { TreemapBlock, TreemapLayoutOutput } from '@contribution-margin/core';
