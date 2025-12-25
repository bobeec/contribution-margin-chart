/**
 * @bobeec/contribution-margin-core - Treemap Layout Engine
 * Generate treemap-style layout for CVP chart rendering
 * 
 * Layout structure (Profit case):
 * ┌─────────────┬──────────────────────────┐
 * │             │        変動費            │
 * │             │        (Variable)        │
 * │   売上高    ├────────────┬─────────────┤
 * │   (Sales)   │            │   固定費    │
 * │             │   粗利     │   (Fixed)   │
 * │             │   (CM)     ├─────────────┤
 * │             │            │  利益       │
 * └─────────────┴────────────┴─────────────┘
 * 
 * Layout structure (Loss case - extends downward):
 * ┌─────────────┬──────────────────────────┐
 * │             │        変動費            │
 * │             │        (Variable)        │
 * │   売上高    ├────────────┬─────────────┤
 * │   (Sales)   │            │   固定費    │
 * │             │   粗利     │   (Fixed)   │
 * │             │   (CM)     │             │
 * └─────────────┴────────────┼─────────────┤
 *                            │   損失      │  ← はみ出る
 *                            └─────────────┘
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
    /** Height extension ratio for loss (1.0 = no extension, >1.0 = extends below) */
    heightExtension: number;
  };
}

/**
 * Treemap Layout Engine
 * CVP分析のTreemap形式レイアウトを生成
 * 
 * 赤字（損失）の場合：
 * - negative-bar モード: 右側のコストが売上を超えた分、下にはみ出る
 * - separate モード: 損失を別ブロックとして右側に表示
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

    const { blocks, heightExtension } = this.generateBlocks(input, calculated, displayOptions);
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
        heightExtension,
      },
    };
  }

  /**
   * Generate treemap blocks
   * 
   * 赤字（損失）の場合の動作：
   * - negative-bar: 総コスト（変動費+固定費）が売上を超えた分、右側全体が下にはみ出る
   * - separate: 損失を別ブロックとして表示
   */
  private generateBlocks(
    input: CVPInput,
    calculated: CVPCalculatedValues,
    options: DisplayOptions
  ): { blocks: TreemapBlock[]; heightExtension: number } {
    const blocks: TreemapBlock[] = [];
    const sales = input.sales;

    if (sales <= 0) return { blocks, heightExtension: 1 };

    // 総コスト = 変動費 + 固定費
    const totalCosts = input.variableCosts + input.fixedCosts;
    const isLoss = calculated.operatingProfit < 0;
    const lossDisplayMode = options.lossDisplayMode ?? 'negative-bar';

    // Calculate height extension for loss (how much the right side extends beyond sales)
    // 赤字の場合、コストが売上を超えた分だけ高さを拡張
    let heightExtension = 1;
    if (isLoss && lossDisplayMode === 'negative-bar') {
      // Total height should represent total costs when in loss
      heightExtension = totalCosts / sales;
    } else if (isLoss && lossDisplayMode === 'separate') {
      // separate モード：売上高(1.0) + 隙間 + 損失ブロックの高さ
      // Note: ブロック生成ロジックと同期する必要がある (gap=0.01, minHeight=0.15)
      const lossAmount = Math.abs(calculated.operatingProfit);
      const lossRatio = lossAmount / sales;
      const separateGap = 0.01;
      const lossBlockHeight = Math.max(lossRatio, 0.15);

      heightExtension = 1.0 + separateGap + lossBlockHeight;
    }

    // Calculate ratios based on sales (for normal case) or total costs (for loss)
    const variableRatio = input.variableCosts / sales;
    const contributionRatio = calculated.contributionMargin / sales;
    const fixedRatio = input.fixedCosts / sales;

    // Sales block takes left portion
    const salesWidth = 0.35;

    // Block 1: Sales (left column, height = 1.0 = 売上高を基準)
    blocks.push({
      id: 'sales',
      type: 'sales',
      label: this.labels.sales,
      value: sales,
      x: 0,
      y: 0,
      width: salesWidth,
      height: 1, // Sales is always height 1 (base reference)
      color: this.colors.sales,
      borderColor: '#FFFFFF',
      textColor: this.getContrastColor(this.colors.sales),
      percentage: 1,
      isCalculated: false,
    });

    // Right side blocks
    const rightWidth = 1 - salesWidth;
    const rightX = salesWidth;

    // Block 2: Variable Costs (top right)
    // 変動費の高さは、売上に対する比率
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

    if (contributionRatio > 0) {
      // 限界利益がプラスの場合
      const contributionHeight = contributionRatio;

      // Block 3: Contribution Margin / Gross Profit
      blocks.push({
        id: 'contribution',
        type: 'contribution',
        label: this.labels.contribution,
        value: calculated.contributionMargin,
        x: rightX,
        y: contributionY,
        width: rightWidth * 0.5,
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
      // 固定費の高さは売上に対する比率
      blocks.push({
        id: 'fixed',
        type: 'fixed',
        label: this.labels.fixed,
        value: input.fixedCosts,
        x: innerRightX,
        y: contributionY,
        width: innerRightWidth,
        height: fixedRatio,
        color: this.colors.fixed,
        borderColor: '#FFFFFF',
        textColor: this.getContrastColor(this.colors.fixed),
        percentage: fixedRatio,
        isCalculated: false,
      });

      // Block 5: Profit or Loss
      if (!isLoss) {
        // 黒字の場合：利益ブロックを固定費の下に表示
        const profitRatio = calculated.operatingProfit / sales;
        const profitY = contributionY + fixedRatio;

        blocks.push({
          id: 'profit',
          type: 'profit',
          label: this.labels.profit,
          value: calculated.operatingProfit,
          x: innerRightX,
          y: profitY,
          width: innerRightWidth,
          height: profitRatio,
          color: this.colors.profit,
          borderColor: '#FFFFFF',
          textColor: this.getContrastColor(this.colors.profit),
          percentage: profitRatio,
          isCalculated: true,
        });
      } else {
        // 赤字の場合：損失の表示方法を選択
        const lossAmount = Math.abs(calculated.operatingProfit);
        const lossRatio = lossAmount / sales;

        if (lossDisplayMode === 'negative-bar') {
          // negative-bar モード：右側が下にはみ出る
          // 固定費が限界利益を超えた分 = 損失 → 下にはみ出る
          // 損失ブロックは y=1.0 から開始（売上高の下端から）
          blocks.push({
            id: 'loss',
            type: 'loss',
            label: this.labels.loss,
            value: calculated.operatingProfit,
            x: innerRightX,
            y: 1, // Start from bottom of sales (y=1.0)
            width: innerRightWidth,
            height: lossRatio, // Extends below
            color: this.colors.loss,
            borderColor: '#FFFFFF',
            textColor: this.getContrastColor(this.colors.loss),
            percentage: lossRatio,
            isCalculated: true,
            meta: { isLoss: true, extendsBelow: true },
          });
        } else {
          // separate モード：損失を別ブロックとして右下に表示（はみ出る、分離）
          // 固定費ブロックとは視覚的に分離した別ブロックとして、下にはみ出す
          // 少しだけ隙間を空けて「別ブロック」であることを強調
          const separateGap = 0.01; // 縦方向の小さな隙間（分離感）
          blocks.push({
            id: 'loss',
            type: 'loss',
            label: this.labels.loss,
            value: calculated.operatingProfit,
            x: innerRightX,
            y: 1 + separateGap, // 売上高の下端から隙間を空けて開始（はみ出る＋分離）
            width: innerRightWidth,
            height: Math.max(lossRatio, 0.15), // 最小15%の高さを確保して視認性UP
            color: this.colors.loss,
            borderColor: '#FFFFFF',
            textColor: '#FFFFFF',
            percentage: lossRatio,
            isCalculated: true,
            meta: { isLoss: true, displayMode: 'separate', extendsBelow: true },
          });
        }
      }
    } else {
      // Negative or zero contribution margin - all loss
      // 限界利益がマイナスまたはゼロの場合
      const lossAmount = Math.abs(calculated.operatingProfit);
      blocks.push({
        id: 'loss',
        type: 'loss',
        label: this.labels.loss,
        value: calculated.operatingProfit,
        x: rightX,
        y: variableHeight,
        width: rightWidth,
        height: lossAmount / sales,
        color: this.colors.loss,
        borderColor: '#FFFFFF',
        textColor: this.getContrastColor(this.colors.loss),
        percentage: lossAmount / sales,
        isCalculated: true,
        meta: { isLoss: true, extendsBelow: true },
      });
    }

    return { blocks, heightExtension };
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
