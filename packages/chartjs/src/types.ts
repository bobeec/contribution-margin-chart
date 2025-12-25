/**
 * @bobeec/contribution-margin-chart - Type Definitions
 * Chart.js specific types for CVP analysis charts
 */

import type {
  CVPInput,
  CVPInputArray,
  DisplayOptions,
  MetricsConfig,
  Segment,
  Annotation,
  CVPResult,
} from '@bobeec/contribution-margin-core';
import type { Chart, Plugin } from 'chart.js';

/**
 * Plugin options for the Contribution Margin Chart.js plugin
 */
export interface ContributionMarginPluginOptions {
  /** Single or multiple CVP input data */
  input: CVPInput | CVPInputArray;
  /** Display options */
  display?: DisplayOptions;
  /** Metrics display configuration */
  metrics?: MetricsConfig;
  /** Event handlers */
  events?: {
    /** Segment click handler */
    onSegmentClick?: (segment: Segment, event: MouseEvent, cvpResult: CVPResult) => void;
    /** Segment hover handler */
    onSegmentHover?: (segment: Segment | null, event: MouseEvent) => void;
  };
}

/**
 * Internal CVP data stored on chart instance
 */
export interface CVPChartData {
  segments: Segment[];
  annotations: Annotation[];
  results: CVPResult[];
  options: DisplayOptions;
}

/**
 * Extended Chart type with CVP data
 */
export interface CVPChart extends Chart<'bar'> {
  $cvp?: CVPChartData;
}

/**
 * Plugin type alias
 */
export type ContributionMarginPlugin = Plugin<'bar', ContributionMarginPluginOptions>;

/**
 * Bar segment for rendering
 */
export interface BarSegment {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
  value: number;
  percentage?: number;
}

/**
 * Annotation position calculation result
 */
export interface AnnotationPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

/**
 * Tooltip context for custom tooltip
 */
export interface CVPTooltipContext {
  segment: Segment;
  cvpResult: CVPResult;
  formatted: {
    value: string;
    percentage: string;
  };
}
