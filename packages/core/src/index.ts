/**
 * @contribution-margin/core
 * Core calculation and layout engine for CVP (Cost-Volume-Profit) analysis charts
 *
 * ⚠️ Trademark Notice:
 * This library implements general CVP analysis (Cost-Volume-Profit Analysis)
 * and is not affiliated with any specific trademarked accounting methodology.
 * STRAC® is a registered trademark of Management College Co., Ltd.
 *
 * @packageDocumentation
 */

// Types - Export all type definitions
export * from './types';

// Calculator - CVP calculation engine
export { CVPCalculator } from './calculator';

// Validator - Input validation
export { CVPValidator } from './validator';

// Layout - Segment and annotation generation
export { LayoutEngine, TreemapLayoutEngine } from './layout';
export type { TreemapBlock, TreemapLayoutOutput } from './layout';

// Formatter - Value formatting utilities
export { ValueFormatter, type FormatOptions } from './formatter';

// Constants - Default values and presets
export {
  // Color palettes
  DEFAULT_COLORS,
  PASTEL_COLORS,
  VIVID_COLORS,
  MONOCHROME_COLORS,
  COLORBLIND_COLORS,
  COLOR_SCHEMES,
  // Display options
  DEFAULT_DISPLAY_OPTIONS,
  DEFAULT_METRICS_CONFIG,
  // Labels
  LABELS_JA,
  LABELS_EN,
  getLabels,
  // Unit handling
  UNIT_SUFFIXES,
  UNIT_DIVISORS,
  // Validation
  VALIDATION_THRESHOLDS,
  // Sample data
  SAMPLE_DATA,
  EDGE_CASE_DATA,
} from './constants';

// ============================================================================
// Convenience factory functions
// ============================================================================

import type { CVPInput, CVPResult, DisplayOptions, LayoutOutput, ValidationResult } from './types';
import { CVPCalculator } from './calculator';
import { CVPValidator } from './validator';
import { LayoutEngine } from './layout';
import { ValueFormatter } from './formatter';

/**
 * Convenience function to calculate CVP metrics
 * CVP指標を計算する便利関数
 *
 * @example
 * ```typescript
 * import { calculateCVP } from '@contribution-margin/core';
 *
 * const result = calculateCVP({
 *   sales: 10_000_000,
 *   variableCosts: 6_200_000,
 *   fixedCosts: 3_100_000
 * });
 *
 * console.log(result.contributionMargin); // 3,800,000
 * console.log(result.breakEvenPoint);     // 8,157,894.74
 * ```
 */
export function calculateCVP(input: CVPInput): CVPResult {
  const calculator = new CVPCalculator();
  return calculator.calculateResult(input);
}

/**
 * Convenience function to validate CVP input
 * CVP入力を検証する便利関数
 *
 * @example
 * ```typescript
 * import { validateCVP } from '@contribution-margin/core';
 *
 * const result = validateCVP({
 *   sales: 10_000_000,
 *   variableCosts: 12_000_000, // Warning: exceeds sales
 *   fixedCosts: 3_100_000
 * });
 *
 * if (result.warnings.length > 0) {
 *   console.warn(result.warnings);
 * }
 * ```
 */
export function validateCVP(input: CVPInput): ValidationResult {
  const validator = new CVPValidator();
  return validator.validate(input);
}

/**
 * Convenience function to generate chart layout
 * グラフレイアウトを生成する便利関数
 *
 * @example
 * ```typescript
 * import { generateLayout } from '@contribution-margin/core';
 *
 * const layout = generateLayout({
 *   sales: 10_000_000,
 *   variableCosts: 6_200_000,
 *   fixedCosts: 3_100_000
 * }, {
 *   showBEPLine: true,
 *   lossDisplayMode: 'negative-bar'
 * });
 *
 * console.log(layout.segments); // Chart segments
 * console.log(layout.annotations); // Chart annotations
 * ```
 */
export function generateLayout(input: CVPInput, options?: DisplayOptions): LayoutOutput {
  const calculator = new CVPCalculator();
  const calculated = calculator.calculate(input);

  const layoutEngine = new LayoutEngine(options);
  return layoutEngine.generateLayout(input, calculated, options);
}

/**
 * Convenience function to format a monetary value
 * 金額をフォーマットする便利関数
 *
 * @example
 * ```typescript
 * import { formatValue } from '@contribution-margin/core';
 *
 * console.log(formatValue(10_000_000)); // "¥10,000千円"
 * console.log(formatValue(10_000_000, { unitMode: 'million' })); // "¥10百万円"
 * ```
 */
export function formatValue(
  value: number,
  options?: {
    unitMode?: 'raw' | 'thousand' | 'million' | 'billion';
    locale?: string;
    currencySymbol?: string;
  }
): string {
  const formatter = new ValueFormatter(options);
  return formatter.format(value);
}

/**
 * Main CVP class that combines all functionality
 * すべての機能を組み合わせたメインCVPクラス
 *
 * @example
 * ```typescript
 * import { CVP } from '@contribution-margin/core';
 *
 * const cvp = new CVP({
 *   sales: 10_000_000,
 *   variableCosts: 6_200_000,
 *   fixedCosts: 3_100_000
 * });
 *
 * // Get validation result
 * const validation = cvp.validate();
 *
 * // Get calculated metrics
 * const result = cvp.calculate();
 *
 * // Get chart layout
 * const layout = cvp.generateLayout();
 * ```
 */
export class CVP {
  private input: CVPInput;
  private calculator: CVPCalculator;
  private validator: CVPValidator;
  private layoutEngine: LayoutEngine;

  constructor(input: CVPInput, options?: DisplayOptions) {
    this.input = input;
    this.calculator = new CVPCalculator();
    this.validator = new CVPValidator();
    this.layoutEngine = new LayoutEngine(options);
  }

  /**
   * Validate the input data
   */
  validate(): ValidationResult {
    return this.validator.validate(this.input);
  }

  /**
   * Check if input is valid
   */
  isValid(): boolean {
    return this.validator.isValid(this.input);
  }

  /**
   * Calculate CVP metrics
   */
  calculate(): CVPResult {
    return this.calculator.calculateResult(this.input);
  }

  /**
   * Generate chart layout
   */
  generateLayout(options?: DisplayOptions): LayoutOutput {
    const calculated = this.calculator.calculate(this.input);
    return this.layoutEngine.generateLayout(this.input, calculated, options);
  }

  /**
   * Update input data
   */
  setInput(input: CVPInput): void {
    this.input = input;
  }

  /**
   * Get current input data
   */
  getInput(): CVPInput {
    return { ...this.input };
  }
}
