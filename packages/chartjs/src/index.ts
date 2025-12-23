/**
 * @contribution-margin/chartjs
 * Chart.js plugin for CVP (Cost-Volume-Profit) analysis charts
 *
 * ⚠️ Trademark Notice:
 * This library implements general CVP analysis (Cost-Volume-Profit Analysis)
 * and is not affiliated with any specific trademarked accounting methodology.
 * STRAC® is a registered trademark of Management College Co., Ltd.
 *
 * @packageDocumentation
 */

// Plugin
export { ContributionMarginPlugin, registerContributionMarginPlugin } from './plugin';

// Chart factory functions
export { createCVPChart, createCVPChartConfig, updateCVPChart } from './chart';
export type { CreateCVPChartOptions } from './chart';

// Renderer (for advanced usage)
export { CVPRenderer } from './renderer';

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
  ValueFormatter,
  DEFAULT_COLORS,
  SAMPLE_DATA,
  calculateCVP,
  validateCVP,
  formatValue,
} from '@contribution-margin/core';
