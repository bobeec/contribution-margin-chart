/**
 * CVP Analysis Chart Demo - v0.2.0
 * Interactive demonstration of the @contribution-margin/chartjs plugin
 * Now featuring Treemap layout!
 */

import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import {
  ContributionMarginTreemapPlugin,
  createTreemapChartConfig,
  CVPCalculator,
  ValueFormatter,
  SAMPLE_DATA,
  type CVPInput,
} from '@contribution-margin/chartjs';

// Register Chart.js components
Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ContributionMarginTreemapPlugin
);

// Global chart instance
let mainChart: Chart<'bar'> | null = null;

// Formatter for displaying values
const formatter = new ValueFormatter({
  unitMode: 'thousand',
  locale: 'ja-JP',
  currencySymbol: '¥',
});

/**
 * Initialize the main CVP Treemap chart
 */
function initMainChart(): void {
  const canvas = document.getElementById('cvpChart') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const input = getInputData();
  const config = createTreemapChartConfig({
    input,
    title: '月次進捗',
    display: {
      showBEPLine: true,
      showValues: true,
      showLabels: true,
      showPercentages: false,
      lossDisplayMode: 'negative-bar',
      unitMode: 'thousand',
      locale: 'ja-JP',
      currencySymbol: '¥',
    },
    metrics: {
      display: {
        contributionMarginRatio: true,
        breakEvenPoint: true,
        safetyMargin: true,
      },
      position: 'bottom',
    },
  });

  mainChart = new Chart(ctx, config);
  updateMetricsPanel(input);
}

/**
 * Get input data from form
 */
function getInputData(): CVPInput {
  const salesInput = document.getElementById('sales') as HTMLInputElement;
  const variableInput = document.getElementById('variableCosts') as HTMLInputElement;
  const fixedInput = document.getElementById('fixedCosts') as HTMLInputElement;

  return {
    label: '2025年12月',
    sales: (parseFloat(salesInput?.value || '12500') || 0) * 1000,
    variableCosts: (parseFloat(variableInput?.value || '6000') || 0) * 1000,
    fixedCosts: (parseFloat(fixedInput?.value || '3700') || 0) * 1000,
  };
}

/**
 * Update the chart with new data
 */
function updateChart(): void {
  if (!mainChart) return;

  const input = getInputData();

  // Update plugin options
  const pluginOptions = (mainChart.options.plugins as any)?.contributionMarginTreemap;
  if (pluginOptions) {
    pluginOptions.input = input;
  }

  // Clear cached data
  (mainChart as any).$cvpTreemap = undefined;

  // Update chart
  mainChart.update();

  // Update metrics panel
  updateMetricsPanel(input);
}

/**
 * Update metrics panel with calculated values
 */
function updateMetricsPanel(input: CVPInput): void {
  const panel = document.getElementById('metricsPanel');
  if (!panel) return;

  const calculator = new CVPCalculator();
  const result = calculator.calculateResult(input);
  const { calculated } = result;

  const isProfitable = result.isProfitable;

  panel.innerHTML = `
    <div class="metric-card">
      <div class="label">限界利益 (Contribution Margin)</div>
      <div class="value">${formatter.format(calculated.contributionMargin)}</div>
      <div class="sub">${formatter.formatPercentage(calculated.contributionMarginRatio)}</div>
    </div>
    <div class="metric-card">
      <div class="label">損益分岐点 (Break-Even Point)</div>
      <div class="value">${calculated.breakEvenPoint ? formatter.format(calculated.breakEvenPoint) : '-'}</div>
      <div class="sub">${calculated.breakEvenRatio ? formatter.formatPercentage(calculated.breakEvenRatio) + ' of sales' : '-'}</div>
    </div>
    <div class="metric-card ${isProfitable ? 'profit' : 'loss'}">
      <div class="label">${isProfitable ? '経営利益 (Profit)' : '損失 (Loss)'}</div>
      <div class="value">${formatter.format(calculated.operatingProfit)}</div>
      <div class="sub">${formatter.formatPercentage(calculated.operatingProfitRatio)}</div>
    </div>
    <div class="metric-card">
      <div class="label">安全余裕額 (Safety Margin)</div>
      <div class="value">${calculated.safetyMargin ? formatter.format(calculated.safetyMargin) : '-'}</div>
      <div class="sub">${calculated.safetyMarginRatio ? formatter.formatPercentage(calculated.safetyMarginRatio) : '-'}</div>
    </div>
    <div class="metric-card">
      <div class="label">変動費率 (Variable Cost Ratio)</div>
      <div class="value">${formatter.formatPercentage(calculated.variableCostRatio)}</div>
    </div>
    <div class="metric-card">
      <div class="label">固定費率 (Fixed Cost Ratio)</div>
      <div class="value">${formatter.formatPercentage(calculated.fixedCostRatio)}</div>
    </div>
  `;
}

// Make updateChart available globally
(window as any).updateChart = updateChart;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initMainChart();
});
