/**
 * @bobeec/contribution-margin-core - CVP Validator
 * Input validation for CVP analysis
 */

import type {
  CVPInput,
  CVPMinimalInput,
  ValidationResult,
  ValidationError,
  Warning,
  WarningCode,
  WarningSeverity,
} from '../types';
import { VALIDATION_THRESHOLDS } from '../constants';

/**
 * CVP Validator - Validates input data for CVP calculations
 * CVPバリデータ - CVP計算用の入力データを検証
 */
export class CVPValidator {
  /**
   * Validate CVP input data
   * CVP入力データをバリデーション
   *
   * @param input - CVP input data to validate
   * @returns Validation result with errors and warnings
   *
   * @example
   * ```typescript
   * const validator = new CVPValidator();
   * const result = validator.validate({
   *   sales: 10_000_000,
   *   variableCosts: 6_200_000,
   *   fixedCosts: 3_100_000
   * });
   *
   * if (result.isValid) {
   *   // Proceed with calculation
   * } else {
   *   console.error(result.errors);
   * }
   * ```
   */
  validate(input: CVPMinimalInput | CVPInput): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: Warning[] = [];

    // Required field checks
    this.validateRequiredFields(input, errors);

    // If there are fatal errors, return early
    if (errors.length > 0) {
      return {
        isValid: false,
        errors,
        warnings,
      };
    }

    // Type checks
    this.validateTypes(input, errors);

    // If there are type errors, return early
    if (errors.length > 0) {
      return {
        isValid: false,
        errors,
        warnings,
      };
    }

    // Value range checks (generates errors)
    this.validateValueRanges(input, errors);

    // Business rule checks (generates warnings)
    this.validateBusinessRules(input, warnings);

    // Breakdown consistency checks (generates warnings)
    if ('variableCostsBreakdown' in input || 'fixedCostsBreakdown' in input) {
      this.validateBreakdownConsistency(input as CVPInput, warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Quick validation check - returns boolean only
   * 簡易バリデーションチェック - booleanのみ返す
   */
  isValid(input: CVPMinimalInput): boolean {
    return this.validate(input).isValid;
  }

  /**
   * Validate required fields
   */
  private validateRequiredFields(input: CVPMinimalInput, errors: ValidationError[]): void {
    if (input.sales === undefined || input.sales === null) {
      errors.push({
        code: 'MISSING_FIELD',
        message: '売上高（sales）は必須項目です',
        field: 'sales',
      });
    }

    if (input.variableCosts === undefined || input.variableCosts === null) {
      errors.push({
        code: 'MISSING_FIELD',
        message: '変動費（variableCosts）は必須項目です',
        field: 'variableCosts',
      });
    }

    if (input.fixedCosts === undefined || input.fixedCosts === null) {
      errors.push({
        code: 'MISSING_FIELD',
        message: '固定費（fixedCosts）は必須項目です',
        field: 'fixedCosts',
      });
    }
  }

  /**
   * Validate field types
   */
  private validateTypes(input: CVPMinimalInput, errors: ValidationError[]): void {
    if (typeof input.sales !== 'number' || isNaN(input.sales)) {
      errors.push({
        code: 'INVALID_TYPE',
        message: '売上高（sales）は数値である必要があります',
        field: 'sales',
      });
    }

    if (typeof input.variableCosts !== 'number' || isNaN(input.variableCosts)) {
      errors.push({
        code: 'INVALID_TYPE',
        message: '変動費（variableCosts）は数値である必要があります',
        field: 'variableCosts',
      });
    }

    if (typeof input.fixedCosts !== 'number' || isNaN(input.fixedCosts)) {
      errors.push({
        code: 'INVALID_TYPE',
        message: '固定費（fixedCosts）は数値である必要があります',
        field: 'fixedCosts',
      });
    }

    // Check for Infinity
    if (!isFinite(input.sales) || !isFinite(input.variableCosts) || !isFinite(input.fixedCosts)) {
      errors.push({
        code: 'INVALID_VALUE',
        message: '入力値が有効な範囲を超えています（Infinity）',
        field: 'input',
      });
    }
  }

  /**
   * Validate value ranges
   */
  private validateValueRanges(input: CVPMinimalInput, errors: ValidationError[]): void {
    // Sales must be positive for chart rendering
    if (input.sales <= 0) {
      errors.push({
        code: 'ZERO_SALES',
        message: '売上高は正の値である必要があります',
        field: 'sales',
      });
    }

    // Variable costs cannot be negative
    if (input.variableCosts < 0) {
      errors.push({
        code: 'NEGATIVE_VARIABLE_COSTS',
        message: '変動費は負の値にできません',
        field: 'variableCosts',
      });
    }

    // Fixed costs cannot be negative
    if (input.fixedCosts < 0) {
      errors.push({
        code: 'NEGATIVE_FIXED_COSTS',
        message: '固定費は負の値にできません',
        field: 'fixedCosts',
      });
    }

    // Check for values exceeding safe integer
    if (
      input.sales > VALIDATION_THRESHOLDS.MAX_VALUE ||
      input.variableCosts > VALIDATION_THRESHOLDS.MAX_VALUE ||
      input.fixedCosts > VALIDATION_THRESHOLDS.MAX_VALUE
    ) {
      errors.push({
        code: 'VALUE_TOO_LARGE',
        message: '入力値が計算可能な範囲を超えています',
        field: 'input',
      });
    }
  }

  /**
   * Validate business rules and generate warnings
   */
  private validateBusinessRules(input: CVPMinimalInput, warnings: Warning[]): void {
    const contributionMargin = input.sales - input.variableCosts;
    const contributionMarginRatio = input.sales > 0 ? contributionMargin / input.sales : 0;
    const operatingProfit = contributionMargin - input.fixedCosts;

    // Variable costs exceed sales
    if (input.variableCosts >= input.sales) {
      warnings.push(
        this.createWarning(
          'VARIABLE_EXCEEDS_SALES',
          '変動費が売上高以上です。限界利益が0以下になります。',
          'warning',
          'variableCosts',
          '変動費の内訳を確認してください'
        )
      );
    }

    // Zero contribution margin
    if (Math.abs(contributionMargin) < VALIDATION_THRESHOLDS.PRECISION_EPSILON) {
      warnings.push(
        this.createWarning(
          'ZERO_CONTRIBUTION_MARGIN',
          '限界利益がゼロです。損益分岐点を計算できません。',
          'warning',
          'variableCosts',
          '変動費と売上高の関係を確認してください'
        )
      );
    }

    // Negative contribution margin
    if (contributionMargin < -VALIDATION_THRESHOLDS.PRECISION_EPSILON) {
      warnings.push(
        this.createWarning(
          'NEGATIVE_CONTRIBUTION_MARGIN',
          '限界利益が負です。変動費が売上を超過しています。',
          'error',
          'variableCosts',
          '変動費を見直すか、売上単価の引き上げを検討してください'
        )
      );
    }

    // Negative profit (loss)
    if (operatingProfit < 0) {
      warnings.push(
        this.createWarning(
          'NEGATIVE_PROFIT',
          `経営利益が赤字です（損失: ${Math.abs(operatingProfit).toLocaleString()}）`,
          'info',
          'operatingProfit',
          '赤字はグラフ上で別色で表示されます'
        )
      );
    }

    // Large loss (> 50% of sales)
    const lossRatio = Math.abs(operatingProfit) / input.sales;
    if (operatingProfit < 0 && lossRatio > VALIDATION_THRESHOLDS.LARGE_LOSS_THRESHOLD) {
      warnings.push(
        this.createWarning(
          'LARGE_LOSS',
          `大幅な赤字です（売上の${(lossRatio * 100).toFixed(1)}%）`,
          'warning',
          'operatingProfit',
          '固定費の削減または売上拡大を検討してください'
        )
      );
    }

    // Zero fixed costs
    if (input.fixedCosts === 0) {
      warnings.push(
        this.createWarning(
          'ZERO_FIXED_COSTS',
          '固定費がゼロです。損益分岐点は0になります。',
          'info',
          'fixedCosts',
          '固定費が本当にゼロか確認してください'
        )
      );
    }

    // Abnormal variable cost ratio
    if (contributionMarginRatio < -VALIDATION_THRESHOLDS.ABNORMAL_RATIO_THRESHOLD + 1) {
      warnings.push(
        this.createWarning(
          'ABNORMAL_RATIO',
          '変動費率が異常に高い値です',
          'warning',
          'variableCosts',
          '入力データを再確認してください'
        )
      );
    }
  }

  /**
   * Validate breakdown consistency
   */
  private validateBreakdownConsistency(input: CVPInput, warnings: Warning[]): void {
    // Variable costs breakdown check
    if (input.variableCostsBreakdown) {
      const breakdownTotal = Object.values(input.variableCostsBreakdown).reduce<number>(
        (sum, val) => sum + (val ?? 0),
        0
      );

      const diff = Math.abs(breakdownTotal - input.variableCosts);
      if (diff > VALIDATION_THRESHOLDS.PRECISION_EPSILON && diff > input.variableCosts * 0.01) {
        warnings.push(
          this.createWarning(
            'ABNORMAL_RATIO',
            `変動費の内訳合計（${breakdownTotal.toLocaleString()}）が変動費（${input.variableCosts.toLocaleString()}）と一致しません`,
            'warning',
            'variableCostsBreakdown'
          )
        );
      }
    }

    // Fixed costs breakdown check
    if (input.fixedCostsBreakdown) {
      const breakdownTotal = Object.values(input.fixedCostsBreakdown).reduce<number>(
        (sum, val) => sum + (val ?? 0),
        0
      );

      const diff = Math.abs(breakdownTotal - input.fixedCosts);
      if (diff > VALIDATION_THRESHOLDS.PRECISION_EPSILON && diff > input.fixedCosts * 0.01) {
        warnings.push(
          this.createWarning(
            'ABNORMAL_RATIO',
            `固定費の内訳合計（${breakdownTotal.toLocaleString()}）が固定費（${input.fixedCosts.toLocaleString()}）と一致しません`,
            'warning',
            'fixedCostsBreakdown'
          )
        );
      }
    }
  }

  /**
   * Create a warning object
   */
  private createWarning(
    code: WarningCode,
    message: string,
    severity: WarningSeverity,
    affectedField: string,
    suggestedAction?: string
  ): Warning {
    return {
      code,
      message,
      severity,
      affectedField,
      suggestedAction,
    };
  }
}
