/**
 * ValueFormatter Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ValueFormatter } from '../src/formatter/ValueFormatter';

describe('ValueFormatter', () => {
  let formatter: ValueFormatter;

  beforeEach(() => {
    formatter = new ValueFormatter();
  });

  describe('format()', () => {
    it('should format with default options (thousand, ja-JP)', () => {
      const result = formatter.format(10_000_000);

      expect(result).toBe('¥10,000千円');
    });

    it('should format with raw unit mode', () => {
      formatter = new ValueFormatter({ unitMode: 'raw' });
      const result = formatter.format(10_000_000);

      expect(result).toBe('¥10,000,000');
    });

    it('should format with million unit mode', () => {
      formatter = new ValueFormatter({ unitMode: 'million' });
      const result = formatter.format(10_000_000);

      expect(result).toBe('¥10百万円');
    });

    it('should format with billion unit mode', () => {
      formatter = new ValueFormatter({ unitMode: 'billion' });
      const result = formatter.format(1_000_000_000);

      expect(result).toBe('¥1億円');
    });

    it('should handle negative values', () => {
      const result = formatter.format(-1_000_000);

      expect(result).toBe('¥-1,000千円');
    });

    it('should show positive sign when requested', () => {
      const result = formatter.format(1_000_000, { showPositiveSign: true });

      expect(result).toBe('¥+1,000千円');
    });

    it('should format with custom currency symbol', () => {
      formatter = new ValueFormatter({ currencySymbol: '$' });
      const result = formatter.format(10_000_000);

      expect(result).toContain('$');
    });

    it('should format with English locale', () => {
      formatter = new ValueFormatter({
        unitMode: 'thousand',
        locale: 'en-US',
        currencySymbol: '$',
      });
      const result = formatter.format(10_000_000);

      expect(result).toBe('$10,000K');
    });

    it('should format with decimal places', () => {
      formatter = new ValueFormatter({
        unitMode: 'thousand',
        decimalPlaces: 2,
      });
      const result = formatter.format(10_500_000);

      expect(result).toBe('¥10,500.00千円');
    });

    it('should format zero correctly', () => {
      const result = formatter.format(0);

      expect(result).toBe('¥0千円');
    });
  });

  describe('formatPercentage()', () => {
    it('should format percentage with default decimal places', () => {
      const result = formatter.formatPercentage(0.38);

      expect(result).toBe('38.0%');
    });

    it('should format percentage with custom decimal places', () => {
      const result = formatter.formatPercentage(0.385, 2);

      expect(result).toBe('38.50%');
    });

    it('should handle null value', () => {
      const result = formatter.formatPercentage(null);

      expect(result).toBe('-');
    });

    it('should format negative percentages', () => {
      const result = formatter.formatPercentage(-0.15);

      expect(result).toBe('-15.0%');
    });

    it('should format zero percentage', () => {
      const result = formatter.formatPercentage(0);

      expect(result).toBe('0.0%');
    });

    it('should format percentages over 100%', () => {
      const result = formatter.formatPercentage(1.5);

      expect(result).toBe('150.0%');
    });
  });

  describe('formatRatio()', () => {
    it('should format ratio with default decimal places', () => {
      const result = formatter.formatRatio(0.38);

      expect(result).toBe('0.38');
    });

    it('should format ratio with custom decimal places', () => {
      const result = formatter.formatRatio(0.38, 4);

      expect(result).toBe('0.3800');
    });

    it('should handle null value', () => {
      const result = formatter.formatRatio(null);

      expect(result).toBe('-');
    });
  });

  describe('formatAuto()', () => {
    it('should select billion for large values', () => {
      const result = formatter.formatAuto(5_000_000_000);

      expect(result).toContain('億');
    });

    it('should select million for medium-large values', () => {
      const result = formatter.formatAuto(50_000_000);

      expect(result).toContain('百万');
    });

    it('should select thousand for medium values', () => {
      const result = formatter.formatAuto(500_000);

      expect(result).toContain('千');
    });

    it('should use raw for small values', () => {
      const result = formatter.formatAuto(500);

      expect(result).not.toContain('千');
      expect(result).not.toContain('百万');
    });
  });

  describe('formatTooltip()', () => {
    it('should format tooltip with label', () => {
      const result = formatter.formatTooltip(10_000_000, '売上高');

      expect(result).toContain('売上高');
      expect(result).toContain('10,000千円');
      expect(result).toContain('10,000,000円');
    });

    it('should format tooltip without label', () => {
      const result = formatter.formatTooltip(10_000_000);

      expect(result).toContain('10,000千円');
    });
  });

  describe('formatCompact()', () => {
    it('should format very large numbers in 億', () => {
      const result = formatter.formatCompact(150_000_000);

      expect(result).toBe('1.5億');
    });

    it('should format medium numbers in 万', () => {
      const result = formatter.formatCompact(500_000);

      expect(result).toBe('50.0万');
    });

    it('should format small numbers with commas', () => {
      const result = formatter.formatCompact(5_000);

      expect(result).toBe('5,000');
    });

    it('should handle negative values', () => {
      const result = formatter.formatCompact(-150_000_000);

      expect(result).toBe('-1.5億');
    });
  });

  describe('setOptions() and getOptions()', () => {
    it('should update options', () => {
      formatter.setOptions({ unitMode: 'million' });
      const options = formatter.getOptions();

      expect(options.unitMode).toBe('million');
    });

    it('should preserve other options when updating', () => {
      formatter.setOptions({ unitMode: 'million' });
      const options = formatter.getOptions();

      expect(options.locale).toBe('ja-JP');
      expect(options.currencySymbol).toBe('¥');
    });
  });

  describe('Static Methods', () => {
    it('fromDisplayOptions should create formatter', () => {
      const formatter = ValueFormatter.fromDisplayOptions({
        unitMode: 'million',
        locale: 'en-US',
        currencySymbol: '$',
      });

      const result = formatter.format(10_000_000);
      expect(result).toContain('$');
      expect(result).toContain('M');
    });

    it('quickFormat should format with specified unit', () => {
      const result = ValueFormatter.quickFormat(10_000_000, 'thousand');

      expect(result).toBe('¥10,000千円');
    });

    it('quickPercentage should format ratio as percentage', () => {
      const result = ValueFormatter.quickPercentage(0.38);

      expect(result).toBe('38.0%');
    });

    it('quickPercentage should handle null', () => {
      const result = ValueFormatter.quickPercentage(null);

      expect(result).toBe('-');
    });
  });
});
