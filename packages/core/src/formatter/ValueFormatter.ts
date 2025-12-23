/**
 * @contribution-margin/core - Value Formatter
 * Number formatting utilities for CVP charts
 */

import type { UnitMode, DisplayOptions } from '../types';
import { UNIT_DIVISORS, UNIT_SUFFIXES, DEFAULT_DISPLAY_OPTIONS } from '../constants';

/**
 * Options for value formatting
 */
export interface FormatOptions {
  /** Unit display mode */
  unitMode?: UnitMode;
  /** Locale for number formatting */
  locale?: string;
  /** Number of decimal places */
  decimalPlaces?: number;
  /** Currency symbol */
  currencySymbol?: string;
  /** Whether to show sign for positive numbers */
  showPositiveSign?: boolean;
  /** Whether to use compact notation */
  compact?: boolean;
}

/**
 * Value Formatter - Format numbers for display in CVP charts
 * 数値フォーマッタ - CVPグラフ表示用に数値をフォーマット
 */
export class ValueFormatter {
  private options: Required<FormatOptions>;

  constructor(options?: FormatOptions) {
    this.options = {
      unitMode: options?.unitMode ?? DEFAULT_DISPLAY_OPTIONS.unitMode,
      locale: options?.locale ?? DEFAULT_DISPLAY_OPTIONS.locale,
      decimalPlaces: options?.decimalPlaces ?? DEFAULT_DISPLAY_OPTIONS.decimalPlaces,
      currencySymbol: options?.currencySymbol ?? DEFAULT_DISPLAY_OPTIONS.currencySymbol,
      showPositiveSign: options?.showPositiveSign ?? false,
      compact: options?.compact ?? false,
    };
  }

  /**
   * Format a monetary value
   * 金額をフォーマット
   *
   * @param value - The numeric value to format
   * @param options - Override formatting options
   * @returns Formatted string
   *
   * @example
   * ```typescript
   * const formatter = new ValueFormatter({ unitMode: 'thousand', locale: 'ja-JP' });
   * formatter.format(10_000_000); // "¥10,000千円"
   * formatter.format(-1_000_000); // "¥-1,000千円"
   * ```
   */
  format(value: number, options?: Partial<FormatOptions>): string {
    const opts = { ...this.options, ...options };
    const isNegative = value < 0;
    const absValue = Math.abs(value);

    // Apply unit divisor
    const divisor = UNIT_DIVISORS[opts.unitMode];
    const scaledValue = absValue / divisor;

    // Get unit suffix
    const localePrefix = opts.locale.startsWith('ja') ? 'ja' : 'en';
    const suffix = UNIT_SUFFIXES[localePrefix][opts.unitMode];

    // Format number with locale
    const formatted = this.formatNumber(scaledValue, opts);

    // Build result
    let result = '';

    // Currency symbol (if provided)
    if (opts.currencySymbol) {
      result += opts.currencySymbol;
    }

    // Sign
    if (isNegative) {
      result += '-';
    } else if (opts.showPositiveSign) {
      result += '+';
    }

    // Number
    result += formatted;

    // Suffix
    if (suffix) {
      result += suffix;
    }

    return result;
  }

  /**
   * Format a percentage value
   * パーセンテージをフォーマット
   *
   * @param ratio - Ratio value (0-1 scale, e.g., 0.38 for 38%)
   * @param decimalPlaces - Number of decimal places (default: 1)
   * @returns Formatted percentage string
   *
   * @example
   * ```typescript
   * const formatter = new ValueFormatter();
   * formatter.formatPercentage(0.38);   // "38.0%"
   * formatter.formatPercentage(0.385, 2); // "38.50%"
   * ```
   */
  formatPercentage(ratio: number | null, decimalPlaces?: number): string {
    if (ratio === null) {
      return '-';
    }

    const places = decimalPlaces ?? 1;
    const percentage = ratio * 100;

    return `${percentage.toFixed(places)}%`;
  }

  /**
   * Format a ratio as a decimal
   * 比率を小数でフォーマット
   *
   * @param ratio - Ratio value
   * @param decimalPlaces - Number of decimal places (default: 2)
   * @returns Formatted decimal string
   */
  formatRatio(ratio: number | null, decimalPlaces?: number): string {
    if (ratio === null) {
      return '-';
    }

    const places = decimalPlaces ?? 2;
    return ratio.toFixed(places);
  }

  /**
   * Format value with automatic unit selection
   * 自動単位選択でフォーマット
   *
   * @param value - The numeric value
   * @returns Formatted string with appropriate unit
   */
  formatAuto(value: number): string {
    const absValue = Math.abs(value);

    let unitMode: UnitMode = 'raw';
    if (absValue >= 1_000_000_000) {
      unitMode = 'billion';
    } else if (absValue >= 1_000_000) {
      unitMode = 'million';
    } else if (absValue >= 1_000) {
      unitMode = 'thousand';
    }

    return this.format(value, { unitMode });
  }

  /**
   * Format a value for tooltip display (more detailed)
   * ツールチップ表示用にフォーマット
   *
   * @param value - The numeric value
   * @param label - Label for the value
   * @returns Formatted tooltip string
   */
  formatTooltip(value: number, label?: string): string {
    const formatted = this.format(value);
    const rawFormatted = this.formatNumber(value, {
      ...this.options,
      decimalPlaces: 0,
    });

    if (label) {
      return `${label}: ${formatted}（${rawFormatted}円）`;
    }
    return `${formatted}（${rawFormatted}円）`;
  }

  /**
   * Format a value for compact display
   * コンパクト表示用にフォーマット
   */
  formatCompact(value: number): string {
    const absValue = Math.abs(value);
    const isNegative = value < 0;
    const sign = isNegative ? '-' : '';

    if (absValue >= 100_000_000) {
      return `${sign}${(absValue / 100_000_000).toFixed(1)}億`;
    }
    if (absValue >= 10_000) {
      return `${sign}${(absValue / 10_000).toFixed(1)}万`;
    }
    return `${sign}${absValue.toLocaleString(this.options.locale)}`;
  }

  /**
   * Format number with locale and decimal places
   */
  private formatNumber(value: number, opts: Required<FormatOptions>): string {
    return new Intl.NumberFormat(opts.locale, {
      minimumFractionDigits: opts.decimalPlaces,
      maximumFractionDigits: opts.decimalPlaces,
    }).format(value);
  }

  /**
   * Update formatter options
   */
  setOptions(options: Partial<FormatOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get current options
   */
  getOptions(): Required<FormatOptions> {
    return { ...this.options };
  }

  // =========================================================================
  // Static utility methods
  // =========================================================================

  /**
   * Create formatter from DisplayOptions
   * DisplayOptionsからフォーマッタを作成
   */
  static fromDisplayOptions(displayOptions: DisplayOptions): ValueFormatter {
    return new ValueFormatter({
      unitMode: displayOptions.unitMode,
      locale: displayOptions.locale,
      decimalPlaces: displayOptions.decimalPlaces,
      currencySymbol: displayOptions.currencySymbol,
    });
  }

  /**
   * Quick format with default options
   * デフォルトオプションで簡易フォーマット
   */
  static quickFormat(value: number, unitMode: UnitMode = 'thousand'): string {
    const formatter = new ValueFormatter({ unitMode });
    return formatter.format(value);
  }

  /**
   * Quick percentage format
   */
  static quickPercentage(ratio: number | null): string {
    const formatter = new ValueFormatter();
    return formatter.formatPercentage(ratio);
  }
}
