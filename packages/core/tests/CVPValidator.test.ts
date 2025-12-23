/**
 * CVPValidator Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CVPValidator } from '../src/validator/CVPValidator';
import { SAMPLE_DATA, EDGE_CASE_DATA } from '../src/constants';

describe('CVPValidator', () => {
  let validator: CVPValidator;

  beforeEach(() => {
    validator = new CVPValidator();
  });

  describe('Valid Input', () => {
    it('should validate correct input as valid', () => {
      const result = validator.validate(SAMPLE_DATA.basic);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return warnings for loss scenario but still valid', () => {
      const result = validator.validate(SAMPLE_DATA.loss);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.code === 'NEGATIVE_PROFIT')).toBe(true);
    });
  });

  describe('Required Fields', () => {
    it('should error when sales is missing', () => {
      const result = validator.validate({
        variableCosts: 6_200_000,
        fixedCosts: 3_100_000,
      } as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'sales')).toBe(true);
    });

    it('should error when variableCosts is missing', () => {
      const result = validator.validate({
        sales: 10_000_000,
        fixedCosts: 3_100_000,
      } as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'variableCosts')).toBe(true);
    });

    it('should error when fixedCosts is missing', () => {
      const result = validator.validate({
        sales: 10_000_000,
        variableCosts: 6_200_000,
      } as any);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'fixedCosts')).toBe(true);
    });

    it('should error when all fields are missing', () => {
      const result = validator.validate({} as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe('Type Validation', () => {
    it('should error when sales is not a number', () => {
      const result = validator.validate({
        sales: 'not a number' as any,
        variableCosts: 6_200_000,
        fixedCosts: 3_100_000,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_TYPE')).toBe(true);
    });

    it('should error when sales is NaN', () => {
      const result = validator.validate({
        sales: NaN,
        variableCosts: 6_200_000,
        fixedCosts: 3_100_000,
      });

      expect(result.isValid).toBe(false);
    });

    it('should error when any value is Infinity', () => {
      const result = validator.validate({
        sales: Infinity,
        variableCosts: 6_200_000,
        fixedCosts: 3_100_000,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_VALUE')).toBe(true);
    });
  });

  describe('Value Range Validation', () => {
    it('should error when sales is zero', () => {
      const result = validator.validate(EDGE_CASE_DATA.zeroSales);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'ZERO_SALES')).toBe(true);
    });

    it('should error when sales is negative', () => {
      const result = validator.validate({
        sales: -10_000_000,
        variableCosts: 6_200_000,
        fixedCosts: 3_100_000,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'ZERO_SALES')).toBe(true);
    });

    it('should error when variableCosts is negative', () => {
      const result = validator.validate({
        sales: 10_000_000,
        variableCosts: -100_000,
        fixedCosts: 3_100_000,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'NEGATIVE_VARIABLE_COSTS')).toBe(true);
    });

    it('should error when fixedCosts is negative', () => {
      const result = validator.validate({
        sales: 10_000_000,
        variableCosts: 6_200_000,
        fixedCosts: -100_000,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'NEGATIVE_FIXED_COSTS')).toBe(true);
    });
  });

  describe('Business Rule Warnings', () => {
    it('should warn when variable costs exceed sales', () => {
      const result = validator.validate(EDGE_CASE_DATA.variableExceedsSales);

      expect(result.isValid).toBe(true); // Still valid, just a warning
      expect(result.warnings.some(w => w.code === 'VARIABLE_EXCEEDS_SALES')).toBe(true);
    });

    it('should warn when contribution margin is negative', () => {
      const result = validator.validate(EDGE_CASE_DATA.variableExceedsSales);

      expect(result.warnings.some(w => w.code === 'NEGATIVE_CONTRIBUTION_MARGIN')).toBe(true);
    });

    it('should warn when fixed costs are zero', () => {
      const result = validator.validate(EDGE_CASE_DATA.zeroFixedCosts);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.code === 'ZERO_FIXED_COSTS')).toBe(true);
    });

    it('should warn about large loss', () => {
      const result = validator.validate(EDGE_CASE_DATA.largeLoss);

      expect(result.warnings.some(w => w.code === 'LARGE_LOSS')).toBe(true);
      expect(result.warnings.some(w => w.code === 'NEGATIVE_PROFIT')).toBe(true);
    });

    it('should warn about negative profit (info level)', () => {
      const result = validator.validate(SAMPLE_DATA.loss);

      const negProfitWarning = result.warnings.find(w => w.code === 'NEGATIVE_PROFIT');
      expect(negProfitWarning).toBeDefined();
      expect(negProfitWarning?.severity).toBe('info');
    });
  });

  describe('Breakdown Consistency', () => {
    it('should warn when variable costs breakdown does not match total', () => {
      const result = validator.validate({
        sales: 10_000_000,
        variableCosts: 6_200_000,
        fixedCosts: 3_100_000,
        variableCostsBreakdown: {
          materials: 3_000_000,
          outsourcing: 1_000_000,
          // Total: 4M, but declared 6.2M
        },
      });

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.affectedField === 'variableCostsBreakdown')).toBe(true);
    });

    it('should warn when fixed costs breakdown does not match total', () => {
      const result = validator.validate({
        sales: 10_000_000,
        variableCosts: 6_200_000,
        fixedCosts: 3_100_000,
        fixedCostsBreakdown: {
          labor: 1_000_000,
          rent: 500_000,
          // Total: 1.5M, but declared 3.1M
        },
      });

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.affectedField === 'fixedCostsBreakdown')).toBe(true);
    });

    it('should not warn when breakdown matches total', () => {
      const result = validator.validate({
        sales: 10_000_000,
        variableCosts: 4_000_000,
        fixedCosts: 3_100_000,
        variableCostsBreakdown: {
          materials: 3_000_000,
          outsourcing: 1_000_000,
        },
        fixedCostsBreakdown: {
          labor: 1_800_000,
          rent: 800_000,
          depreciation: 300_000,
          other: 200_000,
        },
      });

      expect(
        result.warnings.some(w => w.affectedField === 'variableCostsBreakdown')
      ).toBe(false);
      expect(
        result.warnings.some(w => w.affectedField === 'fixedCostsBreakdown')
      ).toBe(false);
    });
  });

  describe('isValid() convenience method', () => {
    it('should return true for valid input', () => {
      expect(validator.isValid(SAMPLE_DATA.basic)).toBe(true);
    });

    it('should return false for invalid input', () => {
      expect(validator.isValid(EDGE_CASE_DATA.zeroSales)).toBe(false);
    });
  });

  describe('Warning Severity', () => {
    it('should assign correct severity levels', () => {
      const result = validator.validate(EDGE_CASE_DATA.variableExceedsSales);

      // VARIABLE_EXCEEDS_SALES should be 'warning'
      const vcWarning = result.warnings.find(w => w.code === 'VARIABLE_EXCEEDS_SALES');
      expect(vcWarning?.severity).toBe('warning');

      // NEGATIVE_CONTRIBUTION_MARGIN should be 'error'
      const ncmWarning = result.warnings.find(w => w.code === 'NEGATIVE_CONTRIBUTION_MARGIN');
      expect(ncmWarning?.severity).toBe('error');
    });
  });
});
