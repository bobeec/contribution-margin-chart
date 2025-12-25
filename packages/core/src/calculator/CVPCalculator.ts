/**
 * @bobeec/contribution-margin-core - CVP Calculator
 * Core calculation engine for CVP (Cost-Volume-Profit) analysis
 */

import type { CVPInput, CVPCalculatedValues, CVPResult } from '../types';
import { VALIDATION_THRESHOLDS } from '../constants';

/**
 * CVP Calculator - Calculates all CVP metrics from input data
 * CVP計算エンジン - 入力データからすべてのCVP指標を計算
 */
export class CVPCalculator {
  /**
   * Calculate all CVP metrics from input
   * 入力からすべてのCVP指標を計算
   *
   * @param input - CVP input data
   * @returns Calculated CVP values
   *
   * @example
   * ```typescript
   * const calculator = new CVPCalculator();
   * const result = calculator.calculate({
   *   sales: 10_000_000,
   *   variableCosts: 6_200_000,
   *   fixedCosts: 3_100_000
   * });
   * console.log(result.contributionMargin); // 3,800,000
   * console.log(result.breakEvenPoint);     // 8,157,894.74
   * ```
   */
  calculate(input: CVPInput): CVPCalculatedValues {
    const { sales, variableCosts, fixedCosts } = input;

    // Basic calculations
    const contributionMargin = this.calculateContributionMargin(sales, variableCosts);
    const contributionMarginRatio = this.safeRatio(contributionMargin, sales);

    const operatingProfit = this.calculateOperatingProfit(contributionMargin, fixedCosts);
    const operatingProfitRatio = this.safeRatio(operatingProfit, sales);

    // BEP calculations
    const breakEvenPoint = this.calculateBreakEvenPoint(fixedCosts, contributionMarginRatio);
    const breakEvenRatio = breakEvenPoint !== null ? this.calculateRatio(breakEvenPoint, sales) : null;

    // Safety margin calculations
    const safetyMargin = this.calculateSafetyMargin(sales, breakEvenPoint);
    const safetyMarginRatio = safetyMargin !== null ? this.calculateRatio(safetyMargin, sales) : null;

    // Cost ratios
    const variableCostRatio = this.safeRatio(variableCosts, sales);
    const fixedCostRatio = this.safeRatio(fixedCosts, sales);

    // Labor metrics (if breakdown provided)
    const laborDistributionRatio = this.calculateLaborDistributionRatio(input, contributionMargin);

    return {
      contributionMargin,
      contributionMarginRatio,
      operatingProfit,
      operatingProfitRatio,
      breakEvenPoint,
      breakEvenRatio,
      safetyMargin,
      safetyMarginRatio,
      variableCostRatio,
      fixedCostRatio,
      laborDistributionRatio,
    };
  }

  /**
   * Calculate CVP result including input and calculated values
   * 入力値と計算結果を含む完全なCVP結果を計算
   *
   * @param input - CVP input data
   * @returns Complete CVP result
   */
  calculateResult(input: CVPInput): CVPResult {
    const calculated = this.calculate(input);

    return {
      input,
      calculated,
      isProfit: calculated.operatingProfit >= 0,
      isProfitable: calculated.operatingProfit > 0,
    };
  }

  /**
   * Calculate results for multiple periods
   * 複数期間の結果を計算
   *
   * @param inputs - Array of CVP inputs
   * @returns Array of CVP results
   */
  calculateMultiple(inputs: CVPInput[]): CVPResult[] {
    return inputs.map(input => this.calculateResult(input));
  }

  /**
   * Calculate contribution margin
   * 限界利益を計算
   */
  private calculateContributionMargin(sales: number, variableCosts: number): number {
    return sales - variableCosts;
  }

  /**
   * Calculate operating profit
   * 営業利益を計算
   */
  private calculateOperatingProfit(contributionMargin: number, fixedCosts: number): number {
    return contributionMargin - fixedCosts;
  }

  /**
   * Calculate break-even point
   * 損益分岐点を計算
   *
   * BEP = Fixed Costs / Contribution Margin Ratio
   * Returns null if CM ratio <= 0 (BEP cannot be calculated)
   */
  private calculateBreakEvenPoint(
    fixedCosts: number,
    contributionMarginRatio: number
  ): number | null {
    // BEP can only be calculated if CM ratio is positive
    if (contributionMarginRatio <= VALIDATION_THRESHOLDS.PRECISION_EPSILON) {
      return null;
    }

    // If fixed costs are 0 or negative, BEP is 0 (already profitable at any sales)
    if (fixedCosts <= 0) {
      return 0;
    }

    return fixedCosts / contributionMarginRatio;
  }

  /**
   * Calculate safety margin
   * 安全余裕額を計算
   */
  private calculateSafetyMargin(sales: number, breakEvenPoint: number | null): number | null {
    if (breakEvenPoint === null) {
      return null;
    }
    return sales - breakEvenPoint;
  }

  /**
   * Calculate ratio (handles division by zero) - returns number
   * 比率を計算（ゼロ除算対応）- number を返す
   */
  private safeRatio(numerator: number, denominator: number): number {
    if (Math.abs(denominator) < VALIDATION_THRESHOLDS.PRECISION_EPSILON) {
      return 0;
    }
    return numerator / denominator;
  }

  /**
   * Calculate ratio (handles division by zero) - returns number | null
   * 比率を計算（ゼロ除算対応）- number | null を返す
   */
  private calculateRatio(numerator: number | null, denominator: number): number | null {
    if (numerator === null) {
      return null;
    }

    if (Math.abs(denominator) < VALIDATION_THRESHOLDS.PRECISION_EPSILON) {
      return 0;
    }

    return numerator / denominator;
  }

  /**
   * Calculate labor distribution ratio if breakdown is provided
   * 内訳が提供されている場合、労働分配率を計算
   */
  private calculateLaborDistributionRatio(
    input: CVPInput,
    contributionMargin: number
  ): number | null {
    const laborCost = input.fixedCostsBreakdown?.labor;

    if (laborCost === undefined || laborCost === null) {
      return null;
    }

    if (contributionMargin <= VALIDATION_THRESHOLDS.PRECISION_EPSILON) {
      return null;
    }

    return laborCost / contributionMargin;
  }

  // =========================================================================
  // Static utility methods
  // =========================================================================

  /**
   * Calculate required sales to achieve target profit
   * 目標利益達成に必要な売上高を計算
   *
   * @param targetProfit - Target operating profit
   * @param fixedCosts - Fixed costs
   * @param contributionMarginRatio - Contribution margin ratio
   * @returns Required sales amount
   */
  static calculateRequiredSales(
    targetProfit: number,
    fixedCosts: number,
    contributionMarginRatio: number
  ): number | null {
    if (contributionMarginRatio <= VALIDATION_THRESHOLDS.PRECISION_EPSILON) {
      return null;
    }

    return (fixedCosts + targetProfit) / contributionMarginRatio;
  }

  /**
   * Calculate profit at given sales level
   * 指定売上高での利益を計算
   *
   * @param sales - Sales amount
   * @param variableCostRatio - Variable cost ratio
   * @param fixedCosts - Fixed costs
   * @returns Expected profit
   */
  static calculateProfitAtSales(
    sales: number,
    variableCostRatio: number,
    fixedCosts: number
  ): number {
    const contributionMarginRatio = 1 - variableCostRatio;
    const contributionMargin = sales * contributionMarginRatio;
    return contributionMargin - fixedCosts;
  }

  /**
   * Format number with specified precision to avoid floating point issues
   * 浮動小数点問題を避けるため、指定精度で数値をフォーマット
   */
  static round(value: number, decimalPlaces: number = 2): number {
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(value * multiplier) / multiplier;
  }
}
