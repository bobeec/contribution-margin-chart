/**
 * CVP Analysis Chart Demo - v0.3.0
 * Comprehensive demonstration of the @contribution-margin/chartjs library
 * 
 * This demo showcases various use cases for CVP (Cost-Volume-Profit) Treemap charts
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

// ============================================================================
// Configuration
// ============================================================================

// Formatter for displaying values
const formatter = new ValueFormatter({
  unitMode: 'thousand',
  locale: 'ja-JP',
  currencySymbol: '¥',
});

// Default display options (BEP line is OFF by default for Treemap)
const defaultDisplayOptions = {
  showBEPLine: false,  // Treemap形式ではBEPラインは不要
  showValues: true,
  showLabels: true,
  showPercentages: false,
  unitMode: 'thousand' as const,
  locale: 'ja-JP',
  currencySymbol: '¥',
};

// ============================================================================
// Chart Instances
// ============================================================================

let interactiveChart: Chart<'bar'> | null = null;

// ============================================================================
// 1. Basic Chart
// ============================================================================

function initBasicChart(): void {
  const canvas = document.getElementById('basicChart') as HTMLCanvasElement;
  if (!canvas) return;

  const config = createTreemapChartConfig({
    input: {
      label: '基本例',
      sales: 10_000_000,
      variableCosts: 4_000_000,
      fixedCosts: 3_000_000,
    },
    title: '基本的なCVPグラフ',
    display: defaultDisplayOptions,
  });

  new Chart(canvas, config);
}

// ============================================================================
// 2. Interactive Chart
// ============================================================================

function initInteractiveChart(): void {
  const canvas = document.getElementById('interactiveChart') as HTMLCanvasElement;
  if (!canvas) return;

  const input = getInputData();
  const config = createTreemapChartConfig({
    input,
    title: '月次進捗',
    display: defaultDisplayOptions,
  });

  interactiveChart = new Chart(canvas, config);
  updateMetricsPanel(input);
}

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

function updateChart(): void {
  if (!interactiveChart) return;

  const input = getInputData();

  // Update plugin options
  const pluginOptions = (interactiveChart.options.plugins as any)?.contributionMarginTreemap;
  if (pluginOptions) {
    pluginOptions.input = input;
  }

  // Clear cached data
  (interactiveChart as any).$cvpTreemap = undefined;

  // Update chart
  interactiveChart.update();

  // Update metrics panel
  updateMetricsPanel(input);
}

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

// ============================================================================
// 3. Profit Charts
// ============================================================================

function initProfitCharts(): void {
  // High profit case
  const canvas1 = document.getElementById('profitChart1') as HTMLCanvasElement;
  if (canvas1) {
    const config = createTreemapChartConfig({
      input: {
        label: '高収益',
        sales: 10_000_000,
        variableCosts: 3_000_000,
        fixedCosts: 3_000_000,
      },
      display: defaultDisplayOptions,
    });
    new Chart(canvas1, config);
  }

  // Standard profit case
  const canvas2 = document.getElementById('profitChart2') as HTMLCanvasElement;
  if (canvas2) {
    const config = createTreemapChartConfig({
      input: {
        label: '標準',
        sales: 10_000_000,
        variableCosts: 5_000_000,
        fixedCosts: 3_000_000,
      },
      display: defaultDisplayOptions,
    });
    new Chart(canvas2, config);
  }
}

// ============================================================================
// 4. Loss Charts
// ============================================================================

function initLossCharts(): void {
  // Minor loss case
  const canvas1 = document.getElementById('lossChart1') as HTMLCanvasElement;
  if (canvas1) {
    const config = createTreemapChartConfig({
      input: {
        label: '軽度赤字',
        sales: 10_000_000,
        variableCosts: 5_000_000,
        fixedCosts: 6_000_000,
      },
      display: {
        ...defaultDisplayOptions,
        lossDisplayMode: 'negative-bar',
      },
    });
    new Chart(canvas1, config);
  }

  // Major loss case
  const canvas2 = document.getElementById('lossChart2') as HTMLCanvasElement;
  if (canvas2) {
    const config = createTreemapChartConfig({
      input: {
        label: '重度赤字',
        sales: 10_000_000,
        variableCosts: 6_000_000,
        fixedCosts: 6_000_000,
      },
      display: {
        ...defaultDisplayOptions,
        lossDisplayMode: 'negative-bar',
      },
    });
    new Chart(canvas2, config);
  }
}

// ============================================================================
// 5. Monthly Comparison Charts
// ============================================================================

function initMonthlyCharts(): void {
  const monthlyData = [
    { id: 'monthChart1', label: '10月', sales: 10_000_000, variableCosts: 5_000_000, fixedCosts: 3_000_000 },
    { id: 'monthChart2', label: '11月', sales: 9_000_000, variableCosts: 4_500_000, fixedCosts: 3_000_000 },
    { id: 'monthChart3', label: '12月', sales: 12_000_000, variableCosts: 6_000_000, fixedCosts: 3_000_000 },
  ];

  monthlyData.forEach(data => {
    const canvas = document.getElementById(data.id) as HTMLCanvasElement;
    if (canvas) {
      const config = createTreemapChartConfig({
        input: {
          label: data.label,
          sales: data.sales,
          variableCosts: data.variableCosts,
          fixedCosts: data.fixedCosts,
        },
        display: {
          ...defaultDisplayOptions,
          showLabels: true,
          showValues: true,
        },
      });
      new Chart(canvas, config);
    }
  });
}

// ============================================================================
// 6. Color Scheme Charts
// ============================================================================

function initColorCharts(): void {
  const sampleInput = {
    label: 'サンプル',
    sales: 10_000_000,
    variableCosts: 4_000_000,
    fixedCosts: 3_000_000,
  };

  // Default colors
  const canvas1 = document.getElementById('colorChart1') as HTMLCanvasElement;
  if (canvas1) {
    const config = createTreemapChartConfig({
      input: sampleInput,
      display: {
        ...defaultDisplayOptions,
        colorScheme: 'default',
      },
    });
    new Chart(canvas1, config);
  }

  // Pastel colors
  const canvas2 = document.getElementById('colorChart2') as HTMLCanvasElement;
  if (canvas2) {
    const config = createTreemapChartConfig({
      input: sampleInput,
      display: {
        ...defaultDisplayOptions,
        colorScheme: 'pastel',
      },
    });
    new Chart(canvas2, config);
  }

  // Monochrome colors
  const canvas3 = document.getElementById('colorChart3') as HTMLCanvasElement;
  if (canvas3) {
    const config = createTreemapChartConfig({
      input: sampleInput,
      display: {
        ...defaultDisplayOptions,
        colorScheme: 'monochrome',
      },
    });
    new Chart(canvas3, config);
  }
}

// ============================================================================
// Initialize All Charts
// ============================================================================

function initAllCharts(): void {
  initBasicChart();
  initInteractiveChart();
  initProfitCharts();
  initLossCharts();
  initMonthlyCharts();
  initColorCharts();
}

// Make updateChart available globally
(window as any).updateChart = updateChart;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initAllCharts();
});
