import { describe, it, expect } from 'vitest';
import { TreemapLayoutEngine } from '../src/layout/TreemapLayoutEngine';
import { CVPCalculator } from '../src/calculator';
import { CVPInput } from '../src/types';

describe('TreemapLayoutEngine', () => {
    const calculator = new CVPCalculator();
    const engine = new TreemapLayoutEngine();

    // Helper to generate layout
    const generateLayout = (input: CVPInput, options?: any) => {
        const calculation = calculator.calculateResult(input);
        return engine.generateLayout(input, calculation.calculated, options);
    };

    it('should generate basic layout correctly', () => {
        const input: CVPInput = { sales: 100, variableCosts: 40, fixedCosts: 30 }; // Profit: 30
        const layout = generateLayout(input);

        expect(layout.meta.heightExtension).toBe(1);
        expect(layout.meta.hasLoss).toBe(false);
    });

    it('should handle negative-bar loss mode correctly', () => {
        const input: CVPInput = { sales: 100, variableCosts: 60, fixedCosts: 50 }; // Profit: -10 (Loss)
        // Total Costs = 110. Height Extension should be 110/100 = 1.1

        const layout = generateLayout(input, { lossDisplayMode: 'negative-bar' });

        expect(layout.meta.hasLoss).toBe(true);
        expect(layout.meta.heightExtension).toBeCloseTo(1.1);
    });

    it('should handle separate loss mode correctly (BUG REPRODUCTION)', () => {
        const input: CVPInput = { sales: 100, variableCosts: 60, fixedCosts: 50 }; // Profit: -10
        // Total Costs = 110. 
        // In separate mode, loss block starts at 1 + gap.
        // Height extension should cover the separate block.

        const layout = generateLayout(input, { lossDisplayMode: 'separate' });

        expect(layout.meta.hasLoss).toBe(true);

        const lossBlock = layout.blocks.find(b => b.type === 'loss');
        expect(lossBlock).toBeDefined();
        expect(lossBlock?.y).toBeGreaterThan(1); // Should start below sales

        // The height extension must be greater than 1 to show the separate block
        // Current implementation likely returns 1 (BUG)
        expect(layout.meta.heightExtension).toBeGreaterThan(1);

        // More specifically, it should cover y + height of the loss block
        // y is at least 1.01 (1 + 0.01 gap)
        const expectedMinHeight = (lossBlock?.y || 0) + (lossBlock?.height || 0);
        expect(layout.meta.heightExtension).toBeGreaterThanOrEqual(expectedMinHeight);
    });
});
