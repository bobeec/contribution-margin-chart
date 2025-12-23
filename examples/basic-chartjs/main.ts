/**
 * CVP Analysis Chart Demo
 * Interactive demonstration of the @contribution-margin/chartjs plugin
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
  ContributionMarginPlugin,
  createCVPChartConfig,
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
  ContributionMarginPlugin
);

// Global chart instance
let mainChart: Chart<'bar'> | null = null;
let multiPeriodChart: Chart<'bar'> | null = null;

// Formatter for displaying values
const formatter = new ValueFormatter({
  unitMode: 'thousand',
  locale: 'ja-JP',
  currencySymbol: '¥',
});

/**
 * Initialize the main CVP chart
 */
function initMainChart(): void {
  const canvas = document.getElementById('cvpChart') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const input = getInputData();
  const config = createCVPChartConfig({
    input,
    title: 'CVP Analysis - Profit Structure',
    display: {
      showBEPLine: true,
      showValues: true,
      showLabels: true,
      lossDisplayMode: 'negative-bar',
      unitMode: 'thousand',
      locale: 'ja-JP',
    },
    events: {
      onSegmentClick: (segment, event, cvpResult) => {
        console.log('Segment clicked:', segment);
        alert(`${segment.label}: ${formatter.format(segment.value)}`);
      },
    },
  });

  mainChart = new Chart(ctx, config);
  updateMetricsPanel(input);
}

/**
 * Initialize multi-period comparison chart
 */
function initMultiPeriodChart(): void {
  const canvas = document.getElementById('multiPeriodChart') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const multiPeriodData = SAMPLE_DATA.multiPeriod;
  const config = createCVPChartConfig({
    input: multiPeriodData,
    title: 'Multi-Period CVP Comparison',
    display: {
      showBEPLine: true,
      showValues: true,
      lossDisplayMode: 'negative-bar',
      unitMode: 'thousand',
    },
  });

  multiPeriodChart = new Chart(ctx, config);
}

/**
 * Get input data from form
 */
function getInputData(): CVPInput {
  const salesInput = document.getElementById('sales') as HTMLInputElement;
  const variableInput = document.getElementById('variableCosts') as HTMLInputElement;
  const fixedInput = document.getElementById('fixedCosts') as HTMLInputElement;

  return {
    label: 'Current Period',
    sales: (parseFloat(salesInput?.value || '10000') || 0) * 1000, // Convert to yen
    variableCosts: (parseFloat(variableInput?.value || '6200') || 0) * 1000,
    fixedCosts: (parseFloat(fixedInput?.value || '3100') || 0) * 1000,
  };
}

/**
 * Update the chart with new data
 */
function updateChart(): void {
  if (!mainChart) return;

  const input = getInputData();

  // Update plugin options
  const pluginOptions = mainChart.options.plugins?.contributionMargin as any;
  if (pluginOptions) {
    pluginOptions.input = input;
  }

  // Clear cached data
  (mainChart as any).$cvp = undefined;

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
  initMultiPeriodChart();
});
