# Contribution Margin Chart

<div align="center">

[![npm version](https://img.shields.io/npm/v/@contribution-margin/core.svg)](https://www.npmjs.com/package/@contribution-margin/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

**CVP Analysis Chart Library for JavaScript / Chart.js**

**CVP分析（損益分岐点分析）グラフ作成ライブラリ**

[Demo](https://bobeec.github.io/contribution-margin-chart/) | [English](#english) | [日本語](#日本語)

</div>

---

# English

## Getting Started

### 1. Install

```bash
npm install @contribution-margin/chartjs chart.js
```

### 2. Add markup

```html
<canvas id="cvp-chart" width="800" height="400"></canvas>
```

### 3. Initialize

```javascript
import { Chart } from 'chart.js';
import {
  ContributionMarginTreemapPlugin,
  createTreemapChartConfig,
} from '@contribution-margin/chartjs';

// Register plugin
Chart.register(ContributionMarginTreemapPlugin);

// Create chart
const config = createTreemapChartConfig({
  input: {
    sales: 10_000_000,
    variableCosts: 4_000_000,
    fixedCosts: 3_000_000,
  },
});

new Chart(document.getElementById('cvp-chart'), config);
```

**That's it!** You're all set to create CVP analysis charts.

---

## Settings

### Option Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showValues` | boolean | `true` | Display monetary values on blocks |
| `showLabels` | boolean | `true` | Display labels (Sales, Variable Costs, etc.) |
| `showPercentages` | boolean | `false` | Display percentages |
| `showBEPLine` | boolean | `false` | Show break-even point line |
| `unitMode` | string | `'thousand'` | Unit: `'raw'` \| `'thousand'` \| `'million'` \| `'billion'` |
| `locale` | string | `'ja-JP'` | Locale for number formatting |
| `currencySymbol` | string | `'¥'` | Currency symbol |
| `colorScheme` | string | `'default'` | Color scheme: `'default'` \| `'pastel'` \| `'vivid'` \| `'monochrome'` \| `'colorblind'` |
| `lossDisplayMode` | string | `'negative-bar'` | Loss display: `'negative-bar'` \| `'separate'` |

### Example: Full Options

```javascript
const config = createTreemapChartConfig({
  input: {
    label: 'Q4 2025',
    sales: 10_000_000,
    variableCosts: 4_000_000,
    fixedCosts: 3_000_000,
  },
  title: 'CVP Analysis',
  display: {
    showValues: true,
    showLabels: true,
    showPercentages: true,
    unitMode: 'thousand',
    locale: 'en-US',
    currencySymbol: '$',
    colorScheme: 'default',
    lossDisplayMode: 'negative-bar',
  },
});
```

---

## Color Schemes

Five built-in color schemes are available:

| Scheme | Description | Use Case |
|--------|-------------|----------|
| `default` | Professional blue/orange/green | Business reports |
| `pastel` | Soft, light colors | Presentations |
| `vivid` | High-contrast bright colors | Marketing materials |
| `monochrome` | Grayscale | Print documents |
| `colorblind` | Accessibility-optimized | Universal design |

```javascript
// Use pastel colors
display: { colorScheme: 'pastel' }

// Use colorblind-friendly palette
display: { colorScheme: 'colorblind' }
```

### Custom Colors

You can override individual colors:

```javascript
display: {
  customColors: {
    sales: '#2E86AB',       // Blue
    variable: '#E94F37',    // Red
    contribution: '#44AF69', // Green
    fixed: '#6B717E',       // Gray
    profit: '#138A36',      // Dark Green
    loss: '#D62828',        // Dark Red
  },
}
```

---

## Loss Display Modes

When operating at a loss, choose how to visualize it:

### `negative-bar` (Default)

Loss extends below the chart area, like a negative bar chart.

```
┌─────────┬──────────────────┐
│         │   Variable Costs │
│  Sales  ├─────────┬────────┤
│         │   CM    │ Fixed  │
└─────────┴─────────┼────────┤
                    │  Loss  │ ← Extends below
                    └────────┘
```

```javascript
display: { lossDisplayMode: 'negative-bar' }
```

### `separate`

Loss shown as a separate block with a gap.

```javascript
display: { lossDisplayMode: 'separate' }
```

---

## Calculate Metrics

Use `CVPCalculator` to compute all CVP metrics:

```javascript
import { CVPCalculator } from '@contribution-margin/chartjs';

const calc = new CVPCalculator();
const result = calc.calculateResult({
  sales: 10_000_000,
  variableCosts: 4_000_000,
  fixedCosts: 3_000_000,
});

console.log(result.calculated);
// {
//   contributionMargin: 6_000_000,
//   contributionMarginRatio: 0.6,
//   breakEvenPoint: 5_000_000,
//   operatingProfit: 3_000_000,
//   safetyMargin: 5_000_000,
//   safetyMarginRatio: 0.5,
//   ...
// }

console.log(result.isProfitable); // true
```

### Calculated Metrics Reference

| Metric | Description | Formula |
|--------|-------------|---------|
| `contributionMargin` | Contribution Margin | Sales - Variable Costs |
| `contributionMarginRatio` | CM Ratio | CM ÷ Sales |
| `operatingProfit` | Operating Profit | CM - Fixed Costs |
| `breakEvenPoint` | Break-Even Point | Fixed Costs ÷ CM Ratio |
| `safetyMargin` | Safety Margin | Sales - BEP |
| `safetyMarginRatio` | Safety Margin Ratio | Safety Margin ÷ Sales |
| `variableCostRatio` | Variable Cost Ratio | Variable Costs ÷ Sales |
| `fixedCostRatio` | Fixed Cost Ratio | Fixed Costs ÷ Sales |

---

## Format Values

Use `ValueFormatter` for display:

```javascript
import { ValueFormatter } from '@contribution-margin/chartjs';

const fmt = new ValueFormatter({
  unitMode: 'thousand',
  locale: 'en-US',
  currencySymbol: '$',
});

fmt.format(10_000_000);      // "$10,000K"
fmt.formatPercentage(0.52);  // "52.0%"
```

### Unit Modes

| Mode | Divisor | Example (10,000,000) |
|------|---------|---------------------|
| `raw` | 1 | ¥10,000,000 |
| `thousand` | 1,000 | ¥10,000千円 |
| `million` | 1,000,000 | ¥10百万円 |
| `billion` | 1,000,000,000 | ¥0.01億円 |

---

## Validation

Validate input data before charting:

```javascript
import { CVPValidator } from '@contribution-margin/chartjs';

const validator = new CVPValidator();
const result = validator.validate({
  sales: 10_000_000,
  variableCosts: 12_000_000, // Exceeds sales!
  fixedCosts: 3_000_000,
});

if (!result.isValid) {
  console.error(result.errors);
}

if (result.warnings.length > 0) {
  console.warn(result.warnings);
  // Warning: VARIABLE_EXCEEDS_SALES
}
```

---

## Dynamic Updates

Update the chart dynamically:

```javascript
function updateChart(chart, newData) {
  const options = chart.options.plugins?.contributionMarginTreemap;
  if (options) {
    options.input = newData;
  }
  chart.$cvpTreemap = undefined; // Clear cache
  chart.update();
}

// Example
updateChart(myChart, {
  sales: 12_000_000,
  variableCosts: 5_000_000,
  fixedCosts: 3_500_000,
});
```

---

## Tips & Tricks

### Tip 1: Responsive Charts

Charts are responsive by default. Control sizing with CSS:

```css
.chart-container {
  width: 100%;
  max-width: 800px;
  height: 400px;
}
```

### Tip 2: Multiple Charts

Create multiple charts for period comparison:

```javascript
const months = ['Oct', 'Nov', 'Dec'];
const data = [
  { sales: 10_000_000, variableCosts: 5_000_000, fixedCosts: 3_000_000 },
  { sales: 9_000_000, variableCosts: 4_500_000, fixedCosts: 3_000_000 },
  { sales: 12_000_000, variableCosts: 6_000_000, fixedCosts: 3_000_000 },
];

months.forEach((month, i) => {
  const config = createTreemapChartConfig({
    input: { label: month, ...data[i] },
  });
  new Chart(document.getElementById(`chart-${month}`), config);
});
```

### Tip 3: Dark Mode

Use custom colors for dark backgrounds:

```javascript
display: {
  customColors: {
    sales: '#5DADE2',
    variable: '#F8C471',
    contribution: '#82E0AA',
    fixed: '#AEB6BF',
    profit: '#58D68D',
    loss: '#EC7063',
  },
}
```

### Tip 4: Export as Image

Export the chart as PNG:

```javascript
const canvas = document.getElementById('cvp-chart');
const imageUrl = canvas.toDataURL('image/png');
```

---

# 日本語

## 使い始める

### 1. インストール

```bash
npm install @contribution-margin/chartjs chart.js
```

### 2. HTMLを追加

```html
<canvas id="cvp-chart" width="800" height="400"></canvas>
```

### 3. 初期化

```javascript
import { Chart } from 'chart.js';
import {
  ContributionMarginTreemapPlugin,
  createTreemapChartConfig,
} from '@contribution-margin/chartjs';

// プラグインを登録
Chart.register(ContributionMarginTreemapPlugin);

// チャートを作成
const config = createTreemapChartConfig({
  input: {
    sales: 10_000_000,        // 売上高
    variableCosts: 4_000_000, // 変動費
    fixedCosts: 3_000_000,    // 固定費
  },
});

new Chart(document.getElementById('cvp-chart'), config);
```

**これだけ！** CVP分析グラフの作成準備が整いました。

---

## 設定

### オプション一覧

| オプション | 型 | デフォルト | 説明 |
|-----------|------|----------|------|
| `showValues` | boolean | `true` | 金額を表示 |
| `showLabels` | boolean | `true` | ラベルを表示（売上高、変動費など） |
| `showPercentages` | boolean | `false` | パーセンテージを表示 |
| `showBEPLine` | boolean | `false` | 損益分岐点ラインを表示 |
| `unitMode` | string | `'thousand'` | 単位: `'raw'` \| `'thousand'` \| `'million'` \| `'billion'` |
| `locale` | string | `'ja-JP'` | ロケール（数値フォーマット用） |
| `currencySymbol` | string | `'¥'` | 通貨記号 |
| `colorScheme` | string | `'default'` | カラースキーム: `'default'` \| `'pastel'` \| `'vivid'` \| `'monochrome'` \| `'colorblind'` |
| `lossDisplayMode` | string | `'negative-bar'` | 赤字表示: `'negative-bar'` \| `'separate'` |

### 設定例：全オプション

```javascript
const config = createTreemapChartConfig({
  input: {
    label: '2025年第4四半期',
    sales: 10_000_000,
    variableCosts: 4_000_000,
    fixedCosts: 3_000_000,
  },
  title: 'CVP分析',
  display: {
    showValues: true,
    showLabels: true,
    showPercentages: true,
    unitMode: 'thousand',
    locale: 'ja-JP',
    currencySymbol: '¥',
    colorScheme: 'default',
    lossDisplayMode: 'negative-bar',
  },
});
```

---

## カラースキーム

5種類の組み込みカラースキームがあります：

| スキーム | 説明 | 用途 |
|---------|------|------|
| `default` | プロフェッショナルな青/オレンジ/緑 | ビジネスレポート |
| `pastel` | 柔らかいパステルカラー | プレゼンテーション |
| `vivid` | 高コントラストな鮮やかな色 | マーケティング資料 |
| `monochrome` | グレースケール | 印刷物 |
| `colorblind` | 色覚多様性対応 | ユニバーサルデザイン |

```javascript
// パステルカラーを使用
display: { colorScheme: 'pastel' }

// 色覚多様性対応パレットを使用
display: { colorScheme: 'colorblind' }
```

### カスタムカラー

個別の色を上書きできます：

```javascript
display: {
  customColors: {
    sales: '#2E86AB',       // 売上高（青）
    variable: '#E94F37',    // 変動費（赤）
    contribution: '#44AF69', // 限界利益（緑）
    fixed: '#6B717E',       // 固定費（グレー）
    profit: '#138A36',      // 利益（濃緑）
    loss: '#D62828',        // 損失（濃赤）
  },
}
```

---

## 赤字表示モード

赤字（経営損失）の場合、表示方法を選択できます：

### `negative-bar`（デフォルト）

損失がグラフの下にはみ出します（棒グラフがゼロラインを下回るイメージ）。

```
┌─────────┬──────────────────┐
│         │      変動費      │
│  売上高  ├─────────┬────────┤
│         │ 限界利益 │ 固定費 │
└─────────┴─────────┼────────┤
                    │  損失  │ ← 下にはみ出る
                    └────────┘
```

```javascript
display: { lossDisplayMode: 'negative-bar' }
```

### `separate`

損失を隙間を空けた別ブロックとして表示します。

```javascript
display: { lossDisplayMode: 'separate' }
```

---

## 指標を計算する

`CVPCalculator`を使ってCVP指標を計算：

```javascript
import { CVPCalculator } from '@contribution-margin/chartjs';

const calc = new CVPCalculator();
const result = calc.calculateResult({
  sales: 10_000_000,
  variableCosts: 4_000_000,
  fixedCosts: 3_000_000,
});

console.log(result.calculated);
// {
//   contributionMargin: 6_000_000,     // 限界利益
//   contributionMarginRatio: 0.6,      // 限界利益率
//   breakEvenPoint: 5_000_000,         // 損益分岐点
//   operatingProfit: 3_000_000,        // 経営利益
//   safetyMargin: 5_000_000,           // 安全余裕額
//   safetyMarginRatio: 0.5,            // 安全余裕率
//   ...
// }

console.log(result.isProfitable); // true（黒字）
```

### 計算される指標一覧

| プロパティ | 日本語 | 計算式 |
|-----------|--------|--------|
| `contributionMargin` | 限界利益 | 売上高 - 変動費 |
| `contributionMarginRatio` | 限界利益率 | 限界利益 ÷ 売上高 |
| `operatingProfit` | 経営利益 | 限界利益 - 固定費 |
| `breakEvenPoint` | 損益分岐点 | 固定費 ÷ 限界利益率 |
| `safetyMargin` | 安全余裕額 | 売上高 - 損益分岐点 |
| `safetyMarginRatio` | 安全余裕率 | 安全余裕額 ÷ 売上高 |
| `variableCostRatio` | 変動費率 | 変動費 ÷ 売上高 |
| `fixedCostRatio` | 固定費率 | 固定費 ÷ 売上高 |

---

## 値のフォーマット

`ValueFormatter`で値を整形：

```javascript
import { ValueFormatter } from '@contribution-margin/chartjs';

const fmt = new ValueFormatter({
  unitMode: 'thousand',
  locale: 'ja-JP',
  currencySymbol: '¥',
});

fmt.format(10_000_000);      // "¥10,000千円"
fmt.formatPercentage(0.52);  // "52.0%"
```

### 単位モード

| モード | 除数 | 例（10,000,000） |
|--------|------|-----------------|
| `raw` | 1 | ¥10,000,000 |
| `thousand` | 1,000 | ¥10,000千円 |
| `million` | 1,000,000 | ¥10百万円 |
| `billion` | 1,000,000,000 | ¥0.01億円 |

---

## バリデーション

グラフ作成前にデータを検証：

```javascript
import { CVPValidator } from '@contribution-margin/chartjs';

const validator = new CVPValidator();
const result = validator.validate({
  sales: 10_000_000,
  variableCosts: 12_000_000, // 売上高を超えている！
  fixedCosts: 3_000_000,
});

if (!result.isValid) {
  console.error(result.errors);
}

if (result.warnings.length > 0) {
  console.warn(result.warnings);
  // 警告: VARIABLE_EXCEEDS_SALES（変動費が売上高以上）
}
```

---

## 動的更新

チャートを動的に更新：

```javascript
function updateChart(chart, newData) {
  const options = chart.options.plugins?.contributionMarginTreemap;
  if (options) {
    options.input = newData;
  }
  chart.$cvpTreemap = undefined; // キャッシュをクリア
  chart.update();
}

// 使用例
updateChart(myChart, {
  sales: 12_000_000,
  variableCosts: 5_000_000,
  fixedCosts: 3_500_000,
});
```

---

## Tips

### Tip 1: レスポンシブ対応

チャートはデフォルトでレスポンシブです。CSSでサイズを制御：

```css
.chart-container {
  width: 100%;
  max-width: 800px;
  height: 400px;
}
```

### Tip 2: 複数チャート（期間比較）

月次比較などで複数チャートを作成：

```javascript
const months = ['10月', '11月', '12月'];
const data = [
  { sales: 10_000_000, variableCosts: 5_000_000, fixedCosts: 3_000_000 },
  { sales: 9_000_000, variableCosts: 4_500_000, fixedCosts: 3_000_000 },
  { sales: 12_000_000, variableCosts: 6_000_000, fixedCosts: 3_000_000 },
];

months.forEach((month, i) => {
  const config = createTreemapChartConfig({
    input: { label: month, ...data[i] },
  });
  new Chart(document.getElementById(`chart-${i}`), config);
});
```

### Tip 3: ダークモード

暗い背景用のカスタムカラー：

```javascript
display: {
  customColors: {
    sales: '#5DADE2',
    variable: '#F8C471',
    contribution: '#82E0AA',
    fixed: '#AEB6BF',
    profit: '#58D68D',
    loss: '#EC7063',
  },
}
```

### Tip 4: 画像として出力

チャートをPNGで出力：

```javascript
const canvas = document.getElementById('cvp-chart');
const imageUrl = canvas.toDataURL('image/png');
```

---

## Packages

| Package | Description |
|---------|-------------|
| `@contribution-margin/core` | Core calculation engine (framework agnostic) |
| `@contribution-margin/chartjs` | Chart.js plugin |

---

## License

MIT License

---

<div align="center">

**Made with ❤️ for management accountants**

**管理会計に携わる皆さまのために ❤️**

[GitHub](https://github.com/bobeec/contribution-margin-chart) | [npm](https://www.npmjs.com/package/@contribution-margin/chartjs)

</div>
