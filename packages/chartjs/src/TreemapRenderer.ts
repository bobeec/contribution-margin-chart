/**
 * @contribution-margin/chartjs - Treemap Renderer
 * Canvas rendering for CVP Treemap charts
 * 
 * Layout:
 * ┌─────────────┬──────────────────────────┐
 * │             │        変動費            │
 * │   売上高    ├────────────┬─────────────┤
 * │             │   粗利     │   固定費    │
 * │             │            ├─────────────┤
 * │             │            │   利益      │
 * └─────────────┴────────────┴─────────────┘
 */

import type { ChartArea } from 'chart.js';
import type { DisplayOptions, CVPResult, Annotation } from '@contribution-margin/core';
import type { TreemapBlock } from '@contribution-margin/core';
import { ValueFormatter, DEFAULT_DISPLAY_OPTIONS } from '@contribution-margin/core';

/**
 * Treemap Renderer for CVP charts
 */
export class TreemapRenderer {
  private ctx: CanvasRenderingContext2D;
  private chartArea: ChartArea;
  private formatter: ValueFormatter;
  private options: DisplayOptions;

  constructor(
    ctx: CanvasRenderingContext2D,
    chartArea: ChartArea,
    options: DisplayOptions = {}
  ) {
    this.ctx = ctx;
    this.chartArea = chartArea;
    this.options = { ...DEFAULT_DISPLAY_OPTIONS, ...options };
    this.formatter = ValueFormatter.fromDisplayOptions(this.options);
  }

  /**
   * Render all treemap blocks
   */
  renderBlocks(blocks: TreemapBlock[]): void {
    const { left, top, right, bottom } = this.chartArea;
    const chartWidth = right - left;
    const chartHeight = bottom - top;

    // Sort blocks by type to ensure proper layering
    const sortOrder = ['sales', 'variable', 'contribution', 'fixed', 'profit', 'loss'];
    const sortedBlocks = [...blocks].sort(
      (a, b) => sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type)
    );

    sortedBlocks.forEach(block => {
      this.renderBlock(block, left, top, chartWidth, chartHeight);
    });
  }

  /**
   * Render a single block
   */
  private renderBlock(
    block: TreemapBlock,
    baseX: number,
    baseY: number,
    totalWidth: number,
    totalHeight: number
  ): void {
    const ctx = this.ctx;

    // Calculate pixel coordinates
    const x = baseX + block.x * totalWidth;
    const y = baseY + block.y * totalHeight;
    const width = block.width * totalWidth;
    const height = block.height * totalHeight;

    // Skip blocks with no visible area
    if (width < 1 || height < 1) return;

    // Draw background
    ctx.fillStyle = block.color;
    ctx.fillRect(x, y, width, height);

    // Draw border
    ctx.strokeStyle = block.borderColor ?? '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Draw label and value
    this.renderBlockLabel(block, x, y, width, height);
  }

  /**
   * Render block label and value
   */
  private renderBlockLabel(
    block: TreemapBlock,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const ctx = this.ctx;
    const textColor = block.textColor ?? this.getContrastColor(block.color);

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Determine font sizes based on block size
    const minDimension = Math.min(width, height);
    const baseFontSize = Math.min(14, Math.max(10, minDimension / 8));

    // Draw label
    if (this.options.showLabels !== false && width > 40 && height > 30) {
      ctx.font = `bold ${baseFontSize}px sans-serif`;
      ctx.fillText(block.label, centerX, centerY - baseFontSize * 0.8);
    }

    // Draw value
    if (this.options.showValues !== false && width > 50 && height > 40) {
      ctx.font = `${baseFontSize - 1}px sans-serif`;
      const valueText = this.formatter.format(Math.abs(block.value));
      ctx.fillText(valueText, centerX, centerY + baseFontSize * 0.5);
    }

    // Draw percentage for larger blocks
    if (this.options.showPercentages && width > 60 && height > 50) {
      ctx.font = `${baseFontSize - 2}px sans-serif`;
      const percentText = `(${(block.percentage * 100).toFixed(1)}%)`;
      ctx.fillText(percentText, centerX, centerY + baseFontSize * 1.3);
    }
  }

  /**
   * Render annotations (BEP line, etc.)
   */
  renderAnnotations(annotations: Annotation[], salesValue: number): void {
    annotations.forEach(annotation => {
      switch (annotation.type) {
        case 'line':
          this.renderBEPLine(annotation, salesValue);
          break;
      }
    });
  }

  /**
   * Render BEP vertical line
   */
  private renderBEPLine(annotation: Annotation, salesValue: number): void {
    const ctx = this.ctx;
    const { left, top, bottom, right } = this.chartArea;
    const chartWidth = right - left;

    // BEP position is relative to sales
    // In treemap, we show it as a line across the chart
    const bepValue = annotation.position.x * salesValue;
    const bepRatio = bepValue / salesValue;

    // Position the BEP line at the appropriate x position
    // Sales column is 35% width, so BEP line goes in the remaining area
    const salesWidth = 0.35;
    const x = left + salesWidth * chartWidth + (1 - salesWidth) * chartWidth * bepRatio;

    const style = annotation.style ?? {};

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = style.strokeColor ?? '#E74C3C';
    ctx.lineWidth = style.strokeWidth ?? 2;

    if (style.strokeDasharray) {
      const dashPattern = style.strokeDasharray.split(',').map(Number);
      ctx.setLineDash(dashPattern);
    }

    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw label
    if (annotation.text) {
      const labelY = top - 10;
      ctx.fillStyle = style.fontColor ?? '#333333';
      ctx.font = `${style.fontSize ?? 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(annotation.text, x, labelY);
    }
  }

  /**
   * Render metrics summary
   */
  renderMetrics(results: CVPResult[], position: 'top' | 'bottom' = 'bottom'): void {
    if (results.length === 0) return;

    const ctx = this.ctx;
    const result = results[0];
    const { calculated } = result;

    const { left, bottom, right } = this.chartArea;
    const chartWidth = right - left;

    const metrics = [
      { label: '限界利益率', value: this.formatter.formatPercentage(calculated.contributionMarginRatio) },
      { label: '損益分岐点', value: calculated.breakEvenPoint ? this.formatter.format(calculated.breakEvenPoint) : '-' },
      { label: '安全余裕率', value: calculated.safetyMarginRatio ? this.formatter.formatPercentage(calculated.safetyMarginRatio) : '-' },
    ];

    const y = position === 'bottom' ? bottom + 25 : this.chartArea.top - 25;
    const spacing = chartWidth / metrics.length;

    ctx.font = '11px sans-serif';
    ctx.textBaseline = 'middle';

    metrics.forEach((metric, i) => {
      const x = left + spacing * i + spacing / 2;

      ctx.fillStyle = '#666666';
      ctx.textAlign = 'center';
      ctx.fillText(`${metric.label}: ${metric.value}`, x, y);
    });
  }

  // =========================================================================
  // Utility methods
  // =========================================================================

  /**
   * Get contrasting text color
   */
  private getContrastColor(hexColor: string): string {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#333333' : '#FFFFFF';
  }
}
