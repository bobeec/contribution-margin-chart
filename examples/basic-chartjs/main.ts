/**
 * CVP Analysis Chart Demo - v0.3.1
 * Comprehensive demonstration of the @bobeec/contribution-margin-chart library
 * Bilingual (English/Japanese) demo with all features
 * 
 * @bobeec/contribution-margin-chart ライブラリの包括的デモ
 * 英語・日本語併記、全機能デモ
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
  type DisplayOptions,
} from '@bobeec/contribution-margin-chart';

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

// Formatter for displaying values (Japanese Yen in thousands)
const formatter = new ValueFormatter({
  unitMode: 'thousand',
  locale: 'ja-JP',
  currencySymbol: '¥',
});

// Default display options
const defaultDisplayOptions: DisplayOptions = {
  showBEPLine: false,
  showValues: true,
  showLabels: true,
  showPercentages: false,
  unitMode: 'thousand',
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
      label: 'Basic | 基本例',
      sales: 10_000_000,
      variableCosts: 4_000_000,
      fixedCosts: 3_000_000,
    },
    title: 'Basic CVP Chart | 基本的なCVPグラフ',
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
  const lossMode = getLossMode();
  
  const config = createTreemapChartConfig({
    input,
    title: 'Interactive Demo | インタラクティブデモ',
    display: {
      ...defaultDisplayOptions,
      lossDisplayMode: lossMode,
    },
  });

  interactiveChart = new Chart(canvas, config);
  updateMetricsPanel(input);
}
     * Comprehensive demonstration of the @bobeec/contribution-margin-chart library
     * @bobeec/contribution-margin-chart ライブラリの包括的デモ
  const salesInput = document.getElementById('sales') as HTMLInputElement;
  const variableInput = document.getElementById('variableCosts') as HTMLInputElement;
  const fixedInput = document.getElementById('fixedCosts') as HTMLInputElement;

  return {
    label: 'Interactive | インタラクティブ',
    sales: (parseFloat(salesInput?.value || '12500') || 0) * 1000,
    variableCosts: (parseFloat(variableInput?.value || '6000') || 0) * 1000,
    fixedCosts: (parseFloat(fixedInput?.value || '3700') || 0) * 1000,
  };
}

    import {
      ContributionMarginPlugin,
      createCVPChart,
      createCVPChartConfig,
      createTreemapChart,
      createTreemapChartConfig,
    } from '@bobeec/contribution-margin-chart';

  const input = getInputData();
  const lossMode = getLossMode();

  // Update plugin options
  const pluginOptions = (interactiveChart.options.plugins as any)?.contributionMarginTreemap;
  if (pluginOptions) {
    pluginOptions.input = input;
    pluginOptions.display = {
      ...defaultDisplayOptions,
      lossDisplayMode: lossMode,
    };
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
      <div class="label">Contribution Margin | 限界利益</div>
      <div class="value">${formatter.format(calculated.contributionMargin)}</div>
      <div class="sub">${formatter.formatPercentage(calculated.contributionMarginRatio)}</div>
    </div>
    <div class="metric-card">
      <div class="label">Break-Even Point | 損益分岐点</div>
      <div class="value">${calculated.breakEvenPoint ? formatter.format(calculated.breakEvenPoint) : '-'}</div>
      <div class="sub">${calculated.breakEvenRatio ? formatter.formatPercentage(calculated.breakEvenRatio) + ' of sales' : '-'}</div>
    </div>
    <div class="metric-card ${isProfitable ? 'profit' : 'loss'}">
      <div class="label">${isProfitable ? 'Profit | 経営利益' : 'Loss | 損失'}</div>
      <div class="value">${formatter.format(calculated.operatingProfit)}</div>
      <div class="sub">${formatter.formatPercentage(calculated.operatingProfitRatio)}</div>
    </div>
    <div class="metric-card">
      <div class="label">Safety Margin | 安全余裕額</div>
      <div class="value">${calculated.safetyMargin ? formatter.format(calculated.safetyMargin) : '-'}</div>
      <div class="sub">${calculated.safetyMarginRatio ? formatter.formatPercentage(calculated.safetyMarginRatio) : '-'}</div>
    </div>
    <div class="metric-card">
      <div class="label">Variable Cost Ratio | 変動費率</div>
      <div class="value">${formatter.formatPercentage(calculated.variableCostRatio)}</div>
    </div>
    <div class="metric-card">
      <div class="label">Fixed Cost Ratio | 固定費率</div>
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
        label: 'High Profit | 高収益',
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
        label: 'Standard | 標準',
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
        label: 'Minor Loss | 軽度赤字',
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
        label: 'Major Loss | 重度赤字',
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
// 5. Loss Display Mode Charts
// ============================================================================

function initLossModeCharts(): void {
  const lossInput = {
    label: 'Loss Mode Demo',
    sales: 10_000_000,
    variableCosts: 5_000_000,
    fixedCosts: 6_500_000, // Creates -1.5M loss
  };

  // Mode 1: negative-bar (extends downward)
  const canvas1 = document.getElementById('lossModeChart1') as HTMLCanvasElement;
  if (canvas1) {
    const config = createTreemapChartConfig({
      input: { ...lossInput, label: 'negative-bar' },
      display: {
        ...defaultDisplayOptions,
        lossDisplayMode: 'negative-bar',
      },
    });
    new Chart(canvas1, config);
  }

  // Mode 2: separate (separate block)
  const canvas2 = document.getElementById('lossModeChart2') as HTMLCanvasElement;
  if (canvas2) {
    const config = createTreemapChartConfig({
      input: { ...lossInput, label: 'separate' },
      display: {
        ...defaultDisplayOptions,
        lossDisplayMode: 'separate',
      },
    });
    new Chart(canvas2, config);
  }
}

// ============================================================================
// 6. Monthly Comparison Charts
// ============================================================================

function initMonthlyCharts(): void {
  const monthlyData = [
    { id: 'monthChart1', label: 'Oct | 10月', sales: 10_000_000, variableCosts: 5_000_000, fixedCosts: 3_000_000 },
    { id: 'monthChart2', label: 'Nov | 11月', sales: 9_000_000, variableCosts: 4_500_000, fixedCosts: 3_000_000 },
    { id: 'monthChart3', label: 'Dec | 12月', sales: 12_000_000, variableCosts: 6_000_000, fixedCosts: 3_000_000 },
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
// 7. Color Scheme Charts
// ============================================================================

function initColorCharts(): void {
  const sampleInput = {
    label: 'Sample | サンプル',
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
  initLossModeCharts();
  initMonthlyCharts();
  initColorCharts();
}

// Make updateChart available globally
(window as any).updateChart = updateChart;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initAllCharts();
});
