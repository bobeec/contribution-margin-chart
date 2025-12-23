/**
 * @contribution-margin/core - Treemap Layout Engine
 * Generate treemap-style layout for CVP chart rendering
 * 
 * Layout structure:
 * ┌─────────────┬──────────────────────────┐
 * │             │        変動費            │
 * │             │        (Variable)        │
 * │   売上高    ├────────────┬─────────────┤
 * │   (Sales)   │            │   固定費    │
 * │             │   粗利     │   (Fixed)   │
 * │             │   (CM)     ├─────────────┤
 * │             │            │  利益/損失  │
 * └─────────────┴────────────┴─────────────┘
 */

import type {
  CVPInput,
  CVPCalculatedValues,
  DisplayOptions,
  ColorPalette,
  Annotation,
} from '../types';
import { DEFAULT_COLORS, COLOR_SCHEMES, DEFAULT_DISPLAY_OPTIONS, getLabels } from '../constants';
import { ValueFormatter } from '../formatter/ValueFormatter';

/**
 * Treemap block definition
 * ツリーマップブロック定義
 */
export interface TreemapBlock {
  /** Unique block identifier */
  id: string;
  /** Block type */
  type: 'sales' | 'variable' | 'contribution' | 'fixed' | 'profit' | 'loss';
  /** Display label */
  label: string;
  /** Monetary value */
  value: number;
  /** X position (0-1 normalized) */
  x: number;
  /** Y position (0-1 normalized) */
  y: number;
  /** Width (0-1 normalized) */
  width: number;
  /** Height (0-1 normalized) */
  height: number;
  /** Display color */
  color: string;
  /** Border color */
  borderColor?: string;
  /** Text color */
  textColor?: string;
  /** Font size */
  fontSize?: number;
  /** Percentage of total sales */
  percentage: number;
  /** Whether this is a calculated value */
  isCalculated: boolean;
  /** Additional metadata */
  meta?: Record<string, unknown>;
}

/**
 * Treemap layout output
 */
export interface TreemapLayoutOutput {
  /** Generated blocks */
  blocks: TreemapBlock[];
  /** Annotations (BEP line, etc.) */
  annotations: Annotation[];
  /** Total width in pixels (for reference) */
  referenceWidth: number;
  /** Total height in pixels (for reference) */
  referenceHeight: number;
  /** Layout metadata */
  meta: {
    hasLoss: boolean;
    hasBEP: boolean;
    salesValue: number;
  };
}

/**
 * Treemap Layout Engine
 * CVP分析のTreemap形式レイアウトを生成
 */
export class TreemapLayoutEngine {
  private colors: Required<ColorPalette>;
  private labels: Record<string, string>;
  private formatter: ValueFormatter;

  constructor(displayOptions?: DisplayOptions) {
    this.colors = this.resolveColors(displayOptions);
    this.labels = getLabels(displayOptions?.locale ?? 'ja-JP');
    this.formatter = ValueFormatter.fromDisplayOptions(displayOptions ?? {});
  }

  /**
   * Generate treemap layout
   */
  generateLayout(
    input: CVPInput,
    calculated: CVPCalculatedValues,
    options?: DisplayOptions
  ): TreemapLayoutOutput {
    const displayOptions = this.mergeOptions(options);
    
    // Update internal state
    this.colors = this.resolveColors(displayOptions);
    this.labels = getLabels(displayOptions.locale ?? 'ja-JP');
    this.formatter = ValueFormatter.fromDisplayOptions(displayOptions);

    const blocks = this.generateBlocks(input, calculated, displayOptions);
    const annotations = this.generateAnnotations(input, calculated, displayOptions);

    return {
      blocks,
      annotations,
      referenceWidth: 800,
      referenceHeight: 400,
      meta: {
        hasLoss: calculated.operatingProfit < 0,
        hasBEP: calculated.breakEvenPoint !== null,
        salesValue: input.sales,
      },
    };
  }

  /**
   * Generate treemap blocks
   */
  private generateBlocks(
    input: CVPInput,
    calculated: CVPCalculatedValues,
    options: DisplayOptions
  ): TreemapBlock[] {
    const blocks: TreemapBlock[] = [];
    const sales = input.sales;
    
    if (sales <= 0) return blocks;

    // Calculate ratios
    const variableRatio = input.variableCosts / sales;
    const contributionRatio = calculated.contributionMargin / sales;
    const fixedRatio = input.fixedCosts / sales;
    const profitRatio = calculated.operatingProfit / sales;

    // Sales block takes left portion (width = contribution margin ratio)
    // This creates the visual effect where Sales height = Variable + Contribution
    const salesWidth = 0.35; // Fixed width for sales column

    // Block 1: Sales (left column, full height)
    blocks.push({
      id: 'sales',
      type: 'sales',
      label: this.labels.sales,
      value: sales,
      x: 0,
      y: 0,
      width: salesWidth,
      height: 1,
      color: this.colors.sales,
      borderColor: '#FFFFFF',
      textColor: this.getContrastColor(this.colors.sales),
      percentage: 1,
      isCalculated: false,
    });

    // Right side blocks (1 - salesWidth)
    const rightWidth = 1 - salesWidth;
    const rightX = salesWidth;

    // Block 2: Variable Costs (top right)
    const variableHeight = variableRatio;
    blocks.push({
      id: 'variable',
      type: 'variable',
      label: this.labels.variable,
      value: input.variableCosts,
      x: rightX,
      y: 0,
      width: rightWidth,
      height: variableHeight,
      color: this.colors.variable,
      borderColor: '#FFFFFF',
      textColor: this.getContrastColor(this.colors.variable),
      percentage: variableRatio,
      isCalculated: false,
    });

    // Contribution margin area (below variable costs)
    const contributionY = variableHeight;
    const contributionHeight = contributionRatio;

    if (contributionRatio > 0) {
      // Block 3: Contribution Margin / Gross Profit (middle right - spanning)
      // This is shown as a "container" - we'll add it as background
      blocks.push({
        id: 'contribution',
        type: 'contribution',
        label: this.labels.contribution,
        value: calculated.contributionMargin,
        x: rightX,
        y: contributionY,
        width: rightWidth * 0.5, // Takes left half of right section
        height: contributionHeight,
        color: this.colors.contribution,
        borderColor: '#FFFFFF',
        textColor: this.getContrastColor(this.colors.contribution),
        percentage: contributionRatio,
        isCalculated: true,
      });

      // Right side of contribution area: Fixed + Profit/Loss
      const innerRightX = rightX + rightWidth * 0.5;
      const innerRightWidth = rightWidth * 0.5;

      // Block 4: Fixed Costs
      const fixedHeightNormalized = (fixedRatio / contributionRatio) * contributionHeight;
      blocks.push({
        id: 'fixed',
        type: 'fixed',
        label: this.labels.fixed,
        value: input.fixedCosts,
        x: innerRightX,
        y: contributionY,
        width: innerRightWidth,
        height: Math.min(fixedHeightNormalized, contributionHeight),
        color: this.colors.fixed,
        borderColor: '#FFFFFF',
        textColor: this.getContrastColor(this.colors.fixed),
        percentage: fixedRatio,
        isCalculated: false,
      });

      // Block 5: Profit or Loss
      const profitY = contributionY + fixedHeightNormalized;
      const profitHeightNormalized = contributionHeight - fixedHeightNormalized;

      if (calculated.operatingProfit >= 0) {
        blocks.push({
          id: 'profit',
          type: 'profit',
          label: this.labels.profit,
          value: calculated.operatingProfit,
          x: innerRightX,
          y: profitY,
          width: innerRightWidth,
          height: Math.max(0, profitHeightNormalized),
          color: this.colors.profit,
          borderColor: '#FFFFFF',
          textColor: this.getContrastColor(this.colors.profit),
          percentage: Math.abs(profitRatio),
          isCalculated: true,
        });
      } else {
        // Loss case - show as extending beyond or as overlay
        const lossDisplayMode = options.lossDisplayMode ?? 'negative-bar';
        
        if (lossDisplayMode === 'negative-bar') {
          // Show loss extending beyond the contribution area
          blocks.push({
            id: 'loss',
            type: 'loss',
            label: this.labels.loss,
            value: calculated.operatingProfit,
            x: innerRightX,
            y: contributionY + contributionHeight,
            width: innerRightWidth,
            height: Math.abs(profitRatio),
            color: this.colors.loss,
            borderColor: '#FFFFFF',
            textColor: this.getContrastColor(this.colors.loss),
            percentage: Math.abs(profitRatio),
            isCalculated: true,
            meta: { isLoss: true },
          });
        } else {
          // Overlay mode - show within fixed costs area
          blocks.push({
            id: 'loss',
            type: 'loss',
            label: this.labels.loss,
            value: calculated.operatingProfit,
            x: innerRightX,
            y: contributionY + contributionHeight - 0.05,
            width: innerRightWidth,
            height: 0.05,
            color: this.colors.loss,
            borderColor: '#FFFFFF',
            textColor: '#FFFFFF',
            percentage: Math.abs(profitRatio),
            isCalculated: true,
            meta: { isLoss: true, displayMode: lossDisplayMode },
          });
        }
      }
    } else {
      // Negative or zero contribution margin - all loss
      blocks.push({
        id: 'loss',
        type: 'loss',
        label: this.labels.loss,
        value: calculated.operatingProfit,
        x: rightX,
        y: variableHeight,
        width: rightWidth,
        height: 1 - variableHeight,
        color: this.colors.loss,
        borderColor: '#FFFFFF',
        textColor: this.getContrastColor(this.colors.loss),
        percentage: Math.abs(calculated.operatingProfit / sales),
        isCalculated: true,
        meta: { isLoss: true },
      });
    }

    return blocks;
  }

  /**
   * Generate annotations
   */
  private generateAnnotations(
    input: CVPInput,
    calculated: CVPCalculatedValues,
    options: DisplayOptions
  ): Annotation[] {
    const annotations: Annotation[] = [];

    // BEP line annotation
    if (options.showBEPLine && calculated.breakEvenPoint !== null) {
      const bepRatio = calculated.breakEvenPoint / input.sales;
      const bepOptions = options.bepOptions ?? DEFAULT_DISPLAY_OPTIONS.bepOptions;

      let labelText = '';
      if (bepOptions?.labelContent === 'value' || bepOptions?.labelContent === 'both') {
        labelText = `BEP: ${this.formatter.format(calculated.breakEvenPoint)}`;
      }

      annotations.push({
        type: 'line',
        orientation: 'vertical',
        position: { x: bepRatio, y: 0 },
        text: bepOptions?.showLabel ? labelText : undefined,
        style: {
          strokeWidth: bepOptions?.lineStyle?.strokeWidth ?? 2,
          strokeDasharray: bepOptions?.lineStyle?.dashArray ?? '5,5',
          strokeColor: bepOptions?.lineStyle?.color ?? '#E74C3C',
          fontSize: 11,
          fontColor: '#333333',
        },
        meta: {
          labelPosition: bepOptions?.labelPosition ?? 'top',
        },
      });
    }

    return annotations;
  }

  /**
   * Get contrasting text color for background
   */
  private getContrastColor(bgColor: string): string {
    // Simple luminance check
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#333333' : '#FFFFFF';
  }

  /**
   * Resolve colors from options
   */
  private resolveColors(options?: DisplayOptions): Required<ColorPalette> {
    let colors = { ...DEFAULT_COLORS };

    if (options?.colorScheme) {
      if (typeof options.colorScheme === 'string') {
        const scheme = COLOR_SCHEMES[options.colorScheme];
        if (scheme) {
          colors = { ...scheme.colors };
        }
      } else {
        colors = { ...options.colorScheme.colors };
      }
    }

    if (options?.customColors) {
      colors = { ...colors, ...options.customColors };
    }

    return colors as Required<ColorPalette>;
  }

  /**
   * Merge options with defaults
   */
  private mergeOptions(options?: DisplayOptions): DisplayOptions {
    return {
      ...DEFAULT_DISPLAY_OPTIONS,
      ...options,
    };
  }

  /**
   * Get current labels
   */
  getLabels(): Record<string, string> {
    return { ...this.labels };
  }

  /**
   * Get current colors
   */
  getColors(): Required<ColorPalette> {
    return { ...this.colors };
  }
}
