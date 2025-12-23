/**
 * @contribution-margin/core - Layout Engine
 * Generate segments and annotations for CVP chart rendering
 */

import type {
  CVPInput,
  CVPCalculatedValues,
  DisplayOptions,
  Segment,
  Annotation,
  LayoutOutput,
  ColorPalette,
  SegmentType,
  TextPosition,
  LossDisplayMode,
} from '../types';
import { DEFAULT_COLORS, COLOR_SCHEMES, DEFAULT_DISPLAY_OPTIONS, getLabels } from '../constants';
import { ValueFormatter } from '../formatter/ValueFormatter';

/**
 * Layout Engine - Generate visual layout for CVP charts
 * レイアウトエンジン - CVPグラフの視覚レイアウトを生成
 */
export class LayoutEngine {
  private colors: Required<ColorPalette>;
  private labels: Record<string, string>;
  private formatter: ValueFormatter;

  constructor(displayOptions?: DisplayOptions) {
    this.colors = this.resolveColors(displayOptions);
    this.labels = getLabels(displayOptions?.locale ?? 'ja-JP');
    this.formatter = ValueFormatter.fromDisplayOptions(displayOptions ?? {});
  }

  /**
   * Generate complete layout output
   * 完全なレイアウト出力を生成
   *
   * @param input - CVP input data
   * @param calculated - Calculated CVP values
   * @param options - Display options
   * @returns Layout output with segments and annotations
   */
  generateLayout(
    input: CVPInput,
    calculated: CVPCalculatedValues,
    options?: DisplayOptions
  ): LayoutOutput {
    const displayOptions = this.mergeOptions(options);

    // Update internal state if options provided
    this.colors = this.resolveColors(displayOptions);
    this.labels = getLabels(displayOptions.locale);
    this.formatter = ValueFormatter.fromDisplayOptions(displayOptions);

    const segments = this.generateSegments(input, calculated, displayOptions);
    const annotations = this.generateAnnotations(segments, calculated, displayOptions);

    // Calculate metadata
    const hasLoss = calculated.operatingProfit < 0;
    const hasBEP = calculated.breakEvenPoint !== null;
    const maxValue = Math.max(input.sales, this.calculateTotalWidth(segments));

    return {
      segments,
      annotations,
      totalWidth: maxValue,
      rowCount: 2, // Sales row + breakdown row
      meta: {
        hasLoss,
        hasBEP,
        maxValue,
      },
    };
  }

  /**
   * Generate segments for chart rendering
   * グラフ描画用セグメントを生成
   */
  generateSegments(
    input: CVPInput,
    calculated: CVPCalculatedValues,
    options?: DisplayOptions
  ): Segment[] {
    const displayOptions = this.mergeOptions(options);
    const segments: Segment[] = [];

    // Row 1: Sales bar (full width reference)
    segments.push(
      this.createSegment({
        id: 'sales',
        type: 'sales',
        label: this.labels.sales,
        value: input.sales,
        start: 0,
        width: input.sales,
        color: this.colors.sales,
        textPosition: 'inside',
        isCalculated: false,
        sales: input.sales,
      })
    );

    // Row 2: Breakdown segments
    let cumulativePosition = 0;

    // Variable costs segment
    segments.push(
      this.createSegment({
        id: 'variable',
        type: 'variable',
        label: this.labels.variable,
        value: input.variableCosts,
        start: cumulativePosition,
        width: input.variableCosts,
        color: this.colors.variable,
        textPosition: this.getTextPosition(input.variableCosts, input.sales),
        isCalculated: false,
        sales: input.sales,
      })
    );
    cumulativePosition += input.variableCosts;

    // Contribution margin segment (if positive)
    if (calculated.contributionMargin > 0) {
      segments.push(
        this.createSegment({
          id: 'contribution',
          type: 'contribution',
          label: this.labels.contribution,
          value: calculated.contributionMargin,
          start: cumulativePosition,
          width: calculated.contributionMargin,
          color: this.colors.contribution,
          textPosition: 'center',
          isCalculated: true,
          sales: input.sales,
        })
      );

      // Fixed costs and profit/loss are within contribution margin
      const contributionStart = cumulativePosition;

      // Fixed costs segment
      segments.push(
        this.createSegment({
          id: 'fixed',
          type: 'fixed',
          label: this.labels.fixed,
          value: input.fixedCosts,
          start: contributionStart,
          width: input.fixedCosts,
          color: this.colors.fixed,
          textPosition: this.getTextPosition(input.fixedCosts, calculated.contributionMargin),
          isCalculated: false,
          sales: input.sales,
        })
      );

      // Profit or loss segment
      const profitLossStart = contributionStart + input.fixedCosts;

      if (calculated.operatingProfit >= 0) {
        // Profit segment
        segments.push(
          this.createSegment({
            id: 'profit',
            type: 'profit',
            label: this.labels.profit,
            value: calculated.operatingProfit,
            start: profitLossStart,
            width: calculated.operatingProfit,
            color: this.colors.profit,
            textPosition: this.getTextPosition(calculated.operatingProfit, input.sales),
            isCalculated: true,
            sales: input.sales,
          })
        );
      } else {
        // Loss segment - apply lossDisplayMode
        segments.push(
          this.createLossSegment(
            calculated.operatingProfit,
            profitLossStart,
            input.sales,
            displayOptions.lossDisplayMode ?? 'negative-bar'
          )
        );
      }
    } else {
      // Contribution margin is zero or negative - special handling
      if (calculated.contributionMargin === 0) {
        // Just show fixed costs as loss
        segments.push(
          this.createLossSegment(
            -input.fixedCosts,
            cumulativePosition,
            input.sales,
            displayOptions.lossDisplayMode ?? 'negative-bar'
          )
        );
      } else {
        // Negative contribution margin - show as negative segment
        segments.push(
          this.createSegment({
            id: 'contribution-negative',
            type: 'contribution',
            label: `${this.labels.contribution}（マイナス）`,
            value: calculated.contributionMargin,
            start: cumulativePosition,
            width: 0, // No positive width
            color: this.colors.loss,
            textPosition: 'outside',
            isCalculated: true,
            sales: input.sales,
          })
        );
      }
    }

    return segments;
  }

  /**
   * Generate annotations for chart rendering
   * グラフ描画用注釈を生成
   */
  generateAnnotations(
    segments: Segment[],
    calculated: CVPCalculatedValues,
    options?: DisplayOptions
  ): Annotation[] {
    const displayOptions = this.mergeOptions(options);
    const annotations: Annotation[] = [];

    // BEP line annotation
    if (displayOptions.showBEPLine && calculated.breakEvenPoint !== null) {
      annotations.push(this.createBEPAnnotation(calculated, displayOptions));
    }

    // Contribution margin ellipse annotation
    if (displayOptions.showContributionEllipse) {
      const contributionSegment = segments.find(s => s.type === 'contribution');
      if (contributionSegment && contributionSegment.width > 0) {
        annotations.push(
          this.createContributionEllipseAnnotation(contributionSegment, calculated)
        );
      }
    }

    return annotations;
  }

  /**
   * Create a segment object
   */
  private createSegment(params: {
    id: string;
    type: SegmentType;
    label: string;
    value: number;
    start: number;
    width: number;
    color: string;
    textPosition: TextPosition;
    isCalculated: boolean;
    sales: number;
  }): Segment {
    return {
      id: params.id,
      type: params.type,
      label: params.label,
      value: params.value,
      start: params.start,
      width: Math.max(0, params.width),
      color: params.color,
      textPosition: params.textPosition,
      isCalculated: params.isCalculated,
      percentage: params.sales > 0 ? params.value / params.sales : 0,
    };
  }

  /**
   * Create loss segment based on display mode
   * 表示モードに応じた損失セグメントを作成
   */
  private createLossSegment(
    loss: number,
    position: number,
    sales: number,
    mode: LossDisplayMode
  ): Segment {
    const absLoss = Math.abs(loss);

    switch (mode) {
      case 'negative-bar':
        // Default: show loss as a red bar extending right
        return this.createSegment({
          id: 'loss',
          type: 'loss',
          label: this.labels.loss,
          value: loss,
          start: position,
          width: absLoss,
          color: this.colors.loss,
          textPosition: this.getTextPosition(absLoss, sales),
          isCalculated: true,
          sales,
        });

      case 'downward':
        // Show loss extending downward (handled by renderer)
        return {
          ...this.createSegment({
            id: 'loss',
            type: 'loss',
            label: this.labels.loss,
            value: loss,
            start: position,
            width: 0, // No horizontal width
            color: this.colors.loss,
            textPosition: 'outside',
            isCalculated: true,
            sales,
          }),
          meta: {
            direction: 'downward',
            height: absLoss,
          },
        };

      case 'separate':
        // Show loss as separate block
        return {
          ...this.createSegment({
            id: 'loss',
            type: 'loss',
            label: this.labels.loss,
            value: absLoss,
            start: 0,
            width: absLoss,
            color: this.colors.loss,
            textPosition: 'center',
            isCalculated: true,
            sales,
          }),
          meta: {
            isSeparate: true,
          },
        };

      default:
        return this.createLossSegment(loss, position, sales, 'negative-bar');
    }
  }

  /**
   * Create BEP line annotation
   */
  private createBEPAnnotation(
    calculated: CVPCalculatedValues,
    options: DisplayOptions
  ): Annotation {
    const bepOptions = options.bepOptions ?? DEFAULT_DISPLAY_OPTIONS.bepOptions;
    const bep = calculated.breakEvenPoint!;

    // Format BEP value
    let labelText = '';
    if (bepOptions.labelContent === 'value' || bepOptions.labelContent === 'both') {
      labelText = `${this.labels.breakEvenPoint}: ${this.formatter.format(bep)}`;
    }
    if (bepOptions.labelContent === 'ratio' || bepOptions.labelContent === 'both') {
      const ratio = this.formatter.formatPercentage(calculated.breakEvenRatio);
      labelText = labelText ? `${labelText} (${ratio})` : `${this.labels.breakEvenPoint}: ${ratio}`;
    }

    return {
      type: 'line',
      orientation: 'vertical',
      position: { x: bep, y: 0 },
      text: bepOptions.showLabel ? labelText : undefined,
      style: {
        strokeWidth: bepOptions.lineStyle?.strokeWidth ?? 2,
        strokeDasharray: bepOptions.lineStyle?.dashArray ?? '5,5',
        strokeColor: bepOptions.lineStyle?.color ?? '#666666',
        fontSize: 12,
        fontColor: '#333333',
      },
      meta: {
        labelPosition: bepOptions.labelPosition ?? 'top',
      },
    };
  }

  /**
   * Create contribution margin ellipse annotation
   */
  private createContributionEllipseAnnotation(
    segment: Segment,
    calculated: CVPCalculatedValues
  ): Annotation {
    return {
      type: 'ellipse',
      position: {
        x: segment.start + segment.width / 2,
        y: 0.5,
      },
      size: {
        width: segment.width * 0.8,
        height: 0.6,
      },
      text: `${this.labels.contributionMarginRatio}\n${this.formatter.formatPercentage(calculated.contributionMarginRatio)}`,
      style: {
        strokeWidth: 2,
        strokeColor: this.colors.contribution,
        fillColor: this.colors.contribution,
        fillOpacity: 0.1,
        fontSize: 12,
        fontColor: '#333333',
      },
    };
  }

  /**
   * Determine text position based on segment size relative to total
   */
  private getTextPosition(segmentValue: number, totalValue: number): TextPosition {
    if (totalValue === 0) return 'outside';

    const ratio = Math.abs(segmentValue) / totalValue;

    if (ratio < 0.1) {
      return 'outside';
    } else if (ratio < 0.2) {
      return 'center';
    } else {
      return 'inside';
    }
  }

  /**
   * Calculate total width from segments
   */
  private calculateTotalWidth(segments: Segment[]): number {
    return segments.reduce((max, segment) => {
      const end = segment.start + segment.width;
      return Math.max(max, end);
    }, 0);
  }

  /**
   * Resolve colors from options
   */
  private resolveColors(options?: DisplayOptions): Required<ColorPalette> {
    // Start with default colors
    let colors = { ...DEFAULT_COLORS };

    // Apply color scheme if specified
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

    // Override with custom colors if specified
    if (options?.customColors) {
      colors = { ...colors, ...options.customColors };
    }

    return colors as Required<ColorPalette>;
  }

  /**
   * Merge display options with defaults
   */
  private mergeOptions(options?: DisplayOptions): DisplayOptions {
    return {
      ...DEFAULT_DISPLAY_OPTIONS,
      ...options,
    };
  }

  /**
   * Get labels for current locale
   */
  getLabels(): Record<string, string> {
    return { ...this.labels };
  }

  /**
   * Get current color palette
   */
  getColors(): Required<ColorPalette> {
    return { ...this.colors };
  }
}
