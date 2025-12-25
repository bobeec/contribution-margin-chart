/**
 * @bobeec/contribution-margin-chart - Renderer
 * Canvas rendering utilities for CVP charts
 */

import type { ChartArea } from 'chart.js';
import type {
  Segment,
  Annotation,
  DisplayOptions,
  CVPResult,
} from '@bobeec/contribution-margin-core';
import { ValueFormatter, DEFAULT_DISPLAY_OPTIONS } from '@bobeec/contribution-margin-core';

/**
 * Renderer for CVP chart elements on Canvas
 */
export class CVPRenderer {
  private ctx: CanvasRenderingContext2D;
  private chartArea: ChartArea;
  private formatter: ValueFormatter;
  private options: DisplayOptions;
  private maxValue: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    chartArea: ChartArea,
    options: DisplayOptions = {},
    maxValue: number = 0
  ) {
    this.ctx = ctx;
    this.chartArea = chartArea;
    this.options = { ...DEFAULT_DISPLAY_OPTIONS, ...options };
    this.formatter = ValueFormatter.fromDisplayOptions(this.options);
    this.maxValue = maxValue;
  }

  /**
   * Render all segments as horizontal stacked bars
   */
  renderSegments(segments: Segment[], _rowIndex: number = 0, totalRows: number = 2): void {
    const { left, right, top, bottom } = this.chartArea;
    const chartWidth = right - left;
    const chartHeight = bottom - top;

    // Calculate row height and y position
    const rowHeight = chartHeight / totalRows;
    const barHeight = Math.min(rowHeight * 0.6, this.options.barThickness ?? 40);

    // Separate sales segment (row 0) from breakdown segments (row 1)
    const salesSegment = segments.find(s => s.type === 'sales');
    const breakdownSegments = segments.filter(s => s.type !== 'sales');

    // Render sales bar (row 0)
    if (salesSegment) {
      const y = top + rowHeight * 0.5 - barHeight / 2;
      this.renderSingleSegment(salesSegment, left, y, chartWidth, barHeight);
    }

    // Render breakdown segments (row 1)
    if (breakdownSegments.length > 0) {
      const y = top + rowHeight * 1.5 - barHeight / 2;
      breakdownSegments.forEach(segment => {
        if (segment.width > 0) {
          const x = left + this.scaleX(segment.start, chartWidth);
          const width = this.scaleX(segment.width, chartWidth);
          this.renderSingleSegment(segment, x, y, width, barHeight);
        }
      });
    }
  }

  /**
   * Render a single segment
   */
  private renderSingleSegment(
    segment: Segment,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const ctx = this.ctx;

    // Draw bar
    ctx.fillStyle = segment.color;
    ctx.fillRect(x, y, width, height);

    // Draw border
    ctx.strokeStyle = this.darkenColor(segment.color, 0.2);
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    // Draw label and value
    if (this.options.showLabels && width > 30) {
      this.renderSegmentLabel(segment, x, y, width, height);
    }
  }

  /**
   * Render segment label and value
   */
  private renderSegmentLabel(
    segment: Segment,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const ctx = this.ctx;

    // Calculate text color based on background
    const textColor = this.getContrastColor(segment.color);

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Label
    if (width > 60) {
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(segment.label, centerX, centerY - 8);
    }

    // Value
    if (this.options.showValues && width > 40) {
      ctx.font = '11px sans-serif';
      const valueText = this.formatter.format(segment.value);
      ctx.fillText(valueText, centerX, centerY + 8);
    }

    // Percentage
    if (this.options.showPercentages && segment.percentage !== undefined && width > 50) {
      ctx.font = '10px sans-serif';
      const percentText = this.formatter.formatPercentage(segment.percentage);
      ctx.fillText(percentText, centerX, centerY + 20);
    }
  }

  /**
   * Render annotations (BEP line, ellipses, etc.)
   */
  renderAnnotations(annotations: Annotation[]): void {
    annotations.forEach(annotation => {
      switch (annotation.type) {
        case 'line':
          this.renderLine(annotation);
          break;
        case 'ellipse':
          this.renderEllipse(annotation);
          break;
        case 'label':
          this.renderLabel(annotation);
          break;
        case 'arrow':
          this.renderArrow(annotation);
          break;
      }
    });
  }

  /**
   * Render BEP vertical line
   */
  private renderLine(annotation: Annotation): void {
    const ctx = this.ctx;
    const { left, top, bottom } = this.chartArea;
    const chartWidth = this.chartArea.right - left;

    const x = left + this.scaleX(annotation.position.x, chartWidth);
    const style = annotation.style ?? {};

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = style.strokeColor ?? '#666666';
    ctx.lineWidth = style.strokeWidth ?? 2;

    // Set dash pattern
    if (style.strokeDasharray) {
      const dashPattern = style.strokeDasharray.split(',').map(Number);
      ctx.setLineDash(dashPattern);
    }

    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();

    // Reset dash pattern
    ctx.setLineDash([]);

    // Draw label
    if (annotation.text) {
      const labelPosition = (annotation.meta?.labelPosition as string) ?? 'top';
      const labelY = labelPosition === 'top' ? top - 10 : bottom + 15;

      ctx.fillStyle = style.fontColor ?? '#333333';
      ctx.font = `${style.fontSize ?? 12}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = labelPosition === 'top' ? 'bottom' : 'top';
      ctx.fillText(annotation.text, x, labelY);
    }
  }

  /**
   * Render ellipse annotation
   */
  private renderEllipse(annotation: Annotation): void {
    const ctx = this.ctx;
    const { left, top } = this.chartArea;
    const chartWidth = this.chartArea.right - left;
    const chartHeight = this.chartArea.bottom - top;

    const x = left + this.scaleX(annotation.position.x, chartWidth);
    const y = top + annotation.position.y * chartHeight;
    const width = annotation.size?.width ? this.scaleX(annotation.size.width, chartWidth) / 2 : 50;
    const height = annotation.size?.height ? (annotation.size.height * chartHeight) / 2 : 30;

    const style = annotation.style ?? {};

    // Draw ellipse
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = style.strokeColor ?? '#7ED321';
    ctx.lineWidth = style.strokeWidth ?? 2;
    ctx.stroke();

    if (style.fillOpacity && style.fillOpacity > 0) {
      ctx.fillStyle = this.hexToRgba(style.fillColor ?? style.strokeColor ?? '#7ED321', style.fillOpacity);
      ctx.fill();
    }

    // Draw text
    if (annotation.text) {
      const lines = annotation.text.split('\n');
      ctx.fillStyle = style.fontColor ?? '#333333';
      ctx.font = `${style.fontSize ?? 12}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      lines.forEach((line, i) => {
        const lineY = y + (i - (lines.length - 1) / 2) * 14;
        ctx.fillText(line, x, lineY);
      });
    }
  }

  /**
   * Render text label annotation
   */
  private renderLabel(annotation: Annotation): void {
    const ctx = this.ctx;
    const { left, top } = this.chartArea;
    const chartWidth = this.chartArea.right - left;
    const chartHeight = this.chartArea.bottom - top;

    const x = left + this.scaleX(annotation.position.x, chartWidth);
    const y = top + annotation.position.y * chartHeight;

    const style = annotation.style ?? {};

    ctx.fillStyle = style.fontColor ?? '#333333';
    ctx.font = `${style.fontWeight ?? 'normal'} ${style.fontSize ?? 12}px ${style.fontFamily ?? 'sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (annotation.text) {
      ctx.fillText(annotation.text, x, y);
    }
  }

  /**
   * Render arrow annotation
   */
  private renderArrow(annotation: Annotation): void {
    if (!annotation.target) return;

    const ctx = this.ctx;
    const { left, top } = this.chartArea;
    const chartWidth = this.chartArea.right - left;
    const chartHeight = this.chartArea.bottom - top;

    const startX = left + this.scaleX(annotation.position.x, chartWidth);
    const startY = top + annotation.position.y * chartHeight;
    const endX = left + this.scaleX(annotation.target.x, chartWidth);
    const endY = top + annotation.target.y * chartHeight;

    const style = annotation.style ?? {};

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = style.strokeColor ?? '#333333';
    ctx.lineWidth = style.strokeWidth ?? 2;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw arrowhead
    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowLength = 10;

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle - Math.PI / 6),
      endY - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle + Math.PI / 6),
      endY - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = style.strokeColor ?? '#333333';
    ctx.fill();
  }

  /**
   * Render metrics panel
   */
  renderMetrics(results: CVPResult[], position: 'top' | 'bottom' | 'side' = 'top'): void {
    if (results.length === 0) return;

    const ctx = this.ctx;
    const result = results[0];
    const { calculated } = result;

    const metrics = [
      { label: '限界利益率', value: this.formatter.formatPercentage(calculated.contributionMarginRatio) },
      { label: '損益分岐点', value: calculated.breakEvenPoint ? this.formatter.format(calculated.breakEvenPoint) : '-' },
      { label: '営業利益率', value: this.formatter.formatPercentage(calculated.operatingProfitRatio) },
    ];

    const { left, top } = this.chartArea;
    let x = left;
    const y = position === 'top' ? top - 40 : this.chartArea.bottom + 30;

    ctx.font = '11px sans-serif';
    ctx.textBaseline = 'middle';

    metrics.forEach(metric => {
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'left';
      ctx.fillText(metric.label + ':', x, y);

      ctx.fillStyle = '#333333';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(metric.value, x + 70, y);

      ctx.font = '11px sans-serif';
      x += 150;
    });
  }

  // =========================================================================
  // Utility methods
  // =========================================================================

  /**
   * Scale X value to canvas coordinates
   */
  private scaleX(value: number, chartWidth: number): number {
    if (this.maxValue === 0) return 0;
    return (value / this.maxValue) * chartWidth;
  }

  /**
   * Get contrasting text color (black or white)
   */
  private getContrastColor(hexColor: string): string {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#333333' : '#FFFFFF';
  }

  /**
   * Darken a hex color
   */
  private darkenColor(hexColor: string, amount: number): string {
    const hex = hexColor.replace('#', '');
    const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 255 * amount);
    const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 255 * amount);
    const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 255 * amount);

    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  }

  /**
   * Convert hex color to rgba
   */
  private hexToRgba(hexColor: string, alpha: number): string {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
