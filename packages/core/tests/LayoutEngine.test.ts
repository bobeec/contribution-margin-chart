/**
 * LayoutEngine Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LayoutEngine } from '../src/layout/LayoutEngine';
import { CVPCalculator } from '../src/calculator/CVPCalculator';
import { SAMPLE_DATA, DEFAULT_COLORS } from '../src/constants';

describe('LayoutEngine', () => {
  let layoutEngine: LayoutEngine;
  let calculator: CVPCalculator;

  beforeEach(() => {
    layoutEngine = new LayoutEngine();
    calculator = new CVPCalculator();
  });

  describe('generateLayout()', () => {
    it('should generate complete layout output', () => {
      const input = SAMPLE_DATA.basic;
      const calculated = calculator.calculate(input);
      const layout = layoutEngine.generateLayout(input, calculated);

      expect(layout.segments).toBeDefined();
      expect(layout.annotations).toBeDefined();
      expect(layout.totalWidth).toBeGreaterThan(0);
      expect(layout.rowCount).toBe(2);
    });

    it('should include metadata in layout', () => {
      const input = SAMPLE_DATA.basic;
      const calculated = calculator.calculate(input);
      const layout = layoutEngine.generateLayout(input, calculated);

      expect(layout.meta).toBeDefined();
      expect(layout.meta?.hasLoss).toBe(false);
      expect(layout.meta?.hasBEP).toBe(true);
    });

    it('should set hasLoss flag for loss scenario', () => {
      const input = SAMPLE_DATA.loss;
      const calculated = calculator.calculate(input);
      const layout = layoutEngine.generateLayout(input, calculated);

      expect(layout.meta?.hasLoss).toBe(true);
    });
  });

  describe('generateSegments()', () => {
    it('should generate all required segments for profit scenario', () => {
      const input = SAMPLE_DATA.basic;
      const calculated = calculator.calculate(input);
      const segments = layoutEngine.generateSegments(input, calculated);

      const types = segments.map(s => s.type);
      expect(types).toContain('sales');
      expect(types).toContain('variable');
      expect(types).toContain('contribution');
      expect(types).toContain('fixed');
      expect(types).toContain('profit');
    });

    it('should generate loss segment for loss scenario', () => {
      const input = SAMPLE_DATA.loss;
      const calculated = calculator.calculate(input);
      const segments = layoutEngine.generateSegments(input, calculated);

      const types = segments.map(s => s.type);
      expect(types).toContain('loss');
      expect(types).not.toContain('profit');
    });

    it('should use default colors', () => {
      const input = SAMPLE_DATA.basic;
      const calculated = calculator.calculate(input);
      const segments = layoutEngine.generateSegments(input, calculated);

      const salesSegment = segments.find(s => s.type === 'sales');
      expect(salesSegment?.color).toBe(DEFAULT_COLORS.sales);
    });

    it('should apply custom colors when specified', () => {
      const engine = new LayoutEngine({
        customColors: {
          sales: '#FF0000',
        },
      });
      const input = SAMPLE_DATA.basic;
      const calculated = calculator.calculate(input);
      const segments = engine.generateSegments(input, calculated);

      const salesSegment = segments.find(s => s.type === 'sales');
      expect(salesSegment?.color).toBe('#FF0000');
    });

    it('should set correct values for each segment', () => {
      const input = SAMPLE_DATA.basic;
      const calculated = calculator.calculate(input);
      const segments = layoutEngine.generateSegments(input, calculated);

      const salesSegment = segments.find(s => s.type === 'sales');
      expect(salesSegment?.value).toBe(10_000_000);

      const variableSegment = segments.find(s => s.type === 'variable');
      expect(variableSegment?.value).toBe(6_200_000);

      const contributionSegment = segments.find(s => s.type === 'contribution');
      expect(contributionSegment?.value).toBe(3_800_000);

      const fixedSegment = segments.find(s => s.type === 'fixed');
      expect(fixedSegment?.value).toBe(3_100_000);

      const profitSegment = segments.find(s => s.type === 'profit');
      expect(profitSegment?.value).toBe(700_000);
    });

    it('should calculate correct start positions', () => {
      const input = SAMPLE_DATA.basic;
      const calculated = calculator.calculate(input);
      const segments = layoutEngine.generateSegments(input, calculated);

      const salesSegment = segments.find(s => s.type === 'sales');
      expect(salesSegment?.start).toBe(0);

      const variableSegment = segments.find(s => s.type === 'variable');
      expect(variableSegment?.start).toBe(0);

      const fixedSegment = segments.find(s => s.type === 'fixed');
      expect(fixedSegment?.start).toBe(6_200_000); // After variable costs
    });

    it('should mark calculated segments correctly', () => {
      const input = SAMPLE_DATA.basic;
      const calculated = calculator.calculate(input);
      const segments = layoutEngine.generateSegments(input, calculated);

      const salesSegment = segments.find(s => s.type === 'sales');
      expect(salesSegment?.isCalculated).toBe(false);

      const contributionSegment = segments.find(s => s.type === 'contribution');
      expect(contributionSegment?.isCalculated).toBe(true);

      const profitSegment = segments.find(s => s.type === 'profit');
      expect(profitSegment?.isCalculated).toBe(true);
    });

    it('should calculate percentage for each segment', () => {
      const input = SAMPLE_DATA.basic;
      const calculated = calculator.calculate(input);
      const segments = layoutEngine.generateSegments(input, calculated);

      const variableSegment = segments.find(s => s.type === 'variable');
      expect(variableSegment?.percentage).toBeCloseTo(0.62, 10);

      const profitSegment = segments.find(s => s.type === 'profit');
      expect(profitSegment?.percentage).toBeCloseTo(0.07, 10);
    });
  });

  describe('Loss Display Modes', () => {
    it('should handle negative-bar mode (default)', () => {
      const input = SAMPLE_DATA.loss;
      const calculated = calculator.calculate(input);
      const segments = layoutEngine.generateSegments(input, calculated, {
        lossDisplayMode: 'negative-bar',
      });

      const lossSegment = segments.find(s => s.type === 'loss');
      expect(lossSegment?.width).toBe(1_000_000); // Absolute value
      expect(lossSegment?.value).toBe(-1_000_000); // Original value
    });

    it('should handle downward mode', () => {
      const input = SAMPLE_DATA.loss;
      const calculated = calculator.calculate(input);
      const segments = layoutEngine.generateSegments(input, calculated, {
        lossDisplayMode: 'downward',
      });

      const lossSegment = segments.find(s => s.type === 'loss');
      expect(lossSegment?.width).toBe(0); // No horizontal width
      expect(lossSegment?.meta?.direction).toBe('downward');
      expect(lossSegment?.meta?.height).toBe(1_000_000);
    });

    it('should handle separate mode', () => {
      const input = SAMPLE_DATA.loss;
      const calculated = calculator.calculate(input);
      const segments = layoutEngine.generateSegments(input, calculated, {
        lossDisplayMode: 'separate',
      });

      const lossSegment = segments.find(s => s.type === 'loss');
      expect(lossSegment?.start).toBe(0); // Starts at 0
      expect(lossSegment?.meta?.isSeparate).toBe(true);
    });
  });

  describe('generateAnnotations()', () => {
    it('should generate BEP annotation when showBEPLine is true', () => {
      const input = SAMPLE_DATA.basic;
      const calculated = calculator.calculate(input);
      const segments = layoutEngine.generateSegments(input, calculated);
      const annotations = layoutEngine.generateAnnotations(segments, calculated, {
        showBEPLine: true,
      });

      const bepAnnotation = annotations.find(a => a.type === 'line');
      expect(bepAnnotation).toBeDefined();
      expect(bepAnnotation?.orientation).toBe('vertical');
      expect(bepAnnotation?.position.x).toBeCloseTo(8_157_894.74, 0);
    });

    it('should not generate BEP annotation when showBEPLine is false', () => {
      const input = SAMPLE_DATA.basic;
      const calculated = calculator.calculate(input);
      const segments = layoutEngine.generateSegments(input, calculated);
      const annotations = layoutEngine.generateAnnotations(segments, calculated, {
        showBEPLine: false,
      });

      const bepAnnotation = annotations.find(a => a.type === 'line');
      expect(bepAnnotation).toBeUndefined();
    });

    it('should generate contribution ellipse when enabled', () => {
      const input = SAMPLE_DATA.basic;
      const calculated = calculator.calculate(input);
      const segments = layoutEngine.generateSegments(input, calculated);
      const annotations = layoutEngine.generateAnnotations(segments, calculated, {
        showContributionEllipse: true,
      });

      const ellipse = annotations.find(a => a.type === 'ellipse');
      expect(ellipse).toBeDefined();
      expect(ellipse?.text).toContain('38.0%'); // CM ratio
    });

    it('should include BEP line style with dash pattern', () => {
      const input = SAMPLE_DATA.basic;
      const calculated = calculator.calculate(input);
      const segments = layoutEngine.generateSegments(input, calculated);
      const annotations = layoutEngine.generateAnnotations(segments, calculated, {
        showBEPLine: true,
        bepOptions: {
          showLine: true,
          showLabel: true,
          lineStyle: {
            dashArray: '5,5',
          },
        },
      });

      const bepAnnotation = annotations.find(a => a.type === 'line');
      expect(bepAnnotation?.style?.strokeDasharray).toBe('5,5');
    });
  });

  describe('Color Schemes', () => {
    it('should apply pastel color scheme', () => {
      const engine = new LayoutEngine({ colorScheme: 'pastel' });
      const colors = engine.getColors();

      expect(colors.sales).toBe('#A8D5E5');
    });

    it('should apply vivid color scheme', () => {
      const engine = new LayoutEngine({ colorScheme: 'vivid' });
      const colors = engine.getColors();

      expect(colors.sales).toBe('#2196F3');
    });

    it('should apply colorblind color scheme', () => {
      const engine = new LayoutEngine({ colorScheme: 'colorblind' });
      const colors = engine.getColors();

      expect(colors.sales).toBe('#0077BB');
    });

    it('should override scheme colors with custom colors', () => {
      const engine = new LayoutEngine({
        colorScheme: 'pastel',
        customColors: {
          sales: '#123456',
        },
      });
      const colors = engine.getColors();

      expect(colors.sales).toBe('#123456');
      expect(colors.variable).toBe('#FFD5A5'); // From pastel scheme
    });
  });

  describe('Labels', () => {
    it('should use Japanese labels by default', () => {
      const engine = new LayoutEngine({ locale: 'ja-JP' });
      const labels = engine.getLabels();

      expect(labels.sales).toBe('売上高');
      expect(labels.contribution).toBe('限界利益');
    });

    it('should use English labels for en locale', () => {
      const engine = new LayoutEngine({ locale: 'en-US' });
      const labels = engine.getLabels();

      expect(labels.sales).toBe('Sales');
      expect(labels.contribution).toBe('Contribution Margin');
    });
  });
});
