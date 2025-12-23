/**
 * CVPCalculator Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CVPCalculator } from '../src/calculator/CVPCalculator';
import { SAMPLE_DATA, EDGE_CASE_DATA } from '../src/constants';

describe('CVPCalculator', () => {
  let calculator: CVPCalculator;

  beforeEach(() => {
    calculator = new CVPCalculator();
  });

  describe('Basic Calculations', () => {
    it('should calculate contribution margin correctly', () => {
      const input = SAMPLE_DATA.basic;
      const result = calculator.calculate(input);

      expect(result.contributionMargin).toBe(3_800_000);
    });

    it('should calculate contribution margin ratio correctly', () => {
      const input = SAMPLE_DATA.basic;
      const result = calculator.calculate(input);

      expect(result.contributionMarginRatio).toBeCloseTo(0.38, 10);
    });

    it('should calculate operating profit correctly (profit scenario)', () => {
      const input = SAMPLE_DATA.basic;
      const result = calculator.calculate(input);

      expect(result.operatingProfit).toBe(700_000);
    });

    it('should calculate operating profit correctly (loss scenario)', () => {
      const input = SAMPLE_DATA.loss;
      const result = calculator.calculate(input);

      expect(result.operatingProfit).toBe(-1_000_000);
    });

    it('should calculate break-even point correctly', () => {
      const input = SAMPLE_DATA.basic;
      const result = calculator.calculate(input);

      // BEP = Fixed Costs / CM Ratio = 3,100,000 / 0.38 ≈ 8,157,894.74
      expect(result.breakEvenPoint).toBeCloseTo(8_157_894.74, 2);
    });

    it('should calculate safety margin correctly', () => {
      const input = SAMPLE_DATA.basic;
      const result = calculator.calculate(input);

      // Safety Margin = Sales - BEP = 10,000,000 - 8,157,894.74 ≈ 1,842,105.26
      expect(result.safetyMargin).toBeCloseTo(1_842_105.26, 2);
    });

    it('should calculate safety margin ratio correctly', () => {
      const input = SAMPLE_DATA.basic;
      const result = calculator.calculate(input);

      // Safety Margin Ratio = Safety Margin / Sales ≈ 0.184
      expect(result.safetyMarginRatio).toBeCloseTo(0.184, 3);
    });

    it('should calculate variable cost ratio correctly', () => {
      const input = SAMPLE_DATA.basic;
      const result = calculator.calculate(input);

      expect(result.variableCostRatio).toBeCloseTo(0.62, 10);
    });

    it('should calculate fixed cost ratio correctly', () => {
      const input = SAMPLE_DATA.basic;
      const result = calculator.calculate(input);

      expect(result.fixedCostRatio).toBeCloseTo(0.31, 10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle variable costs exceeding sales', () => {
      const input = EDGE_CASE_DATA.variableExceedsSales;
      const result = calculator.calculate(input);

      expect(result.contributionMargin).toBe(-2_000_000);
      expect(result.contributionMarginRatio).toBeLessThan(0);
      expect(result.breakEvenPoint).toBeNull(); // Cannot calculate BEP with negative CM ratio
    });

    it('should handle zero fixed costs', () => {
      const input = EDGE_CASE_DATA.zeroFixedCosts;
      const result = calculator.calculate(input);

      expect(result.breakEvenPoint).toBe(0); // BEP is 0 when no fixed costs
      expect(result.operatingProfit).toBe(4_000_000); // All CM is profit
    });

    it('should handle large loss scenario', () => {
      const input = EDGE_CASE_DATA.largeLoss;
      const result = calculator.calculate(input);

      expect(result.operatingProfit).toBe(-3_500_000);
      expect(result.operatingProfitRatio).toBeCloseTo(-0.7, 10);
    });

    it('should handle minimal profit scenario', () => {
      const input = EDGE_CASE_DATA.minimalProfit;
      const result = calculator.calculate(input);

      expect(result.operatingProfit).toBe(1_000);
      expect(result.operatingProfit).toBeGreaterThan(0);
    });

    it('should handle zero sales (returns zero ratios)', () => {
      const input = EDGE_CASE_DATA.zeroSales;
      const result = calculator.calculate(input);

      expect(result.contributionMarginRatio).toBe(0);
      expect(result.operatingProfitRatio).toBe(0);
      expect(result.variableCostRatio).toBe(0);
    });
  });

  describe('Labor Distribution Ratio', () => {
    it('should calculate labor distribution ratio when breakdown is provided', () => {
      const input = {
        ...SAMPLE_DATA.basic,
        fixedCostsBreakdown: {
          labor: 1_800_000,
          rent: 800_000,
          depreciation: 300_000,
          other: 200_000,
        },
      };
      const result = calculator.calculate(input);

      // Labor Distribution = Labor / CM = 1,800,000 / 3,800,000 ≈ 0.474
      expect(result.laborDistributionRatio).toBeCloseTo(0.474, 3);
    });

    it('should return null for labor ratio when breakdown is not provided', () => {
      const input = SAMPLE_DATA.basic;
      const result = calculator.calculate(input);

      expect(result.laborDistributionRatio).toBeNull();
    });
  });

  describe('calculateResult()', () => {
    it('should return complete result with profit flag', () => {
      const input = SAMPLE_DATA.basic;
      const result = calculator.calculateResult(input);

      expect(result.input).toEqual(input);
      expect(result.calculated).toBeDefined();
      expect(result.isProfit).toBe(true);
      expect(result.isProfitable).toBe(true);
    });

    it('should return loss flags for loss scenario', () => {
      const input = SAMPLE_DATA.loss;
      const result = calculator.calculateResult(input);

      expect(result.isProfit).toBe(false);
      expect(result.isProfitable).toBe(false);
    });

    it('should handle break-even case (isProfit=true, isProfitable=false)', () => {
      const input = {
        sales: 10_000_000,
        variableCosts: 6_000_000,
        fixedCosts: 4_000_000, // CM = 4M, Profit = 0
      };
      const result = calculator.calculateResult(input);

      expect(result.calculated.operatingProfit).toBe(0);
      expect(result.isProfit).toBe(true); // >= 0
      expect(result.isProfitable).toBe(false); // > 0
    });
  });

  describe('calculateMultiple()', () => {
    it('should calculate results for multiple periods', () => {
      const inputs = SAMPLE_DATA.multiPeriod;
      const results = calculator.calculateMultiple(inputs);

      expect(results).toHaveLength(4);
      expect(results[0].calculated.contributionMargin).toBe(3_800_000);
      expect(results[2].isProfit).toBe(false); // 2025-12 is a loss period
    });
  });

  describe('Static Methods', () => {
    it('should calculate required sales for target profit', () => {
      // CM ratio = 0.4, Fixed costs = 3M, Target profit = 1M
      // Required sales = (3M + 1M) / 0.4 = 10M
      const requiredSales = CVPCalculator.calculateRequiredSales(1_000_000, 3_000_000, 0.4);

      expect(requiredSales).toBe(10_000_000);
    });

    it('should return null for required sales when CM ratio is zero', () => {
      const requiredSales = CVPCalculator.calculateRequiredSales(1_000_000, 3_000_000, 0);

      expect(requiredSales).toBeNull();
    });

    it('should calculate profit at given sales level', () => {
      // Sales = 10M, VC ratio = 0.6, Fixed costs = 3M
      // Profit = 10M * 0.4 - 3M = 1M
      const profit = CVPCalculator.calculateProfitAtSales(10_000_000, 0.6, 3_000_000);

      expect(profit).toBe(1_000_000);
    });

    it('should round numbers correctly', () => {
      expect(CVPCalculator.round(3.14159, 2)).toBe(3.14);
      expect(CVPCalculator.round(3.145, 2)).toBe(3.15);
      expect(CVPCalculator.round(3.14159, 4)).toBe(3.1416);
    });
  });
});
