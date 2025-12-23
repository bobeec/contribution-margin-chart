# Contribution Margin Chart

<div align="center">

[![npm version](https://img.shields.io/npm/v/@contribution-margin/core.svg)](https://www.npmjs.com/package/@contribution-margin/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

**JavaScript library for CVP (Cost-Volume-Profit) analysis visualization**

[Features](#features) • [Installation](#installation) • [Quick Start](#quick-start) • [API Reference](#api-reference) • [Examples](#examples)

</div>

---

## ⚠️ Important Notice Regarding Trademarks

This library is an open-source implementation of general **CVP analysis (Cost-Volume-Profit Analysis)** and **break-even point visualization** techniques commonly used in management accounting.

- **STRAC®** is a registered trademark of Management College Co., Ltd. This library is not affiliated with or endorsed by that company.
- This library is based on standard accounting practices and is referred to using general terminology such as "CVP Analysis Chart", "Contribution Margin Chart", and "Break-Even Point Chart".

---

## Features

- 📊 **Horizontal Stacked Bar Chart** - Visualize profit structure at a glance
- 🔢 **Automatic Calculation** - Contribution margin ratio, BEP, safety margin, and more
- ⚠️ **Built-in Validation** - Warnings for anomalies (negative margin, variable costs exceeding sales)
- 🎨 **Customizable Annotations** - BEP lines, contribution margin ellipses, arrows
- 🔌 **Chart Library Agnostic Core** - Use with Chart.js, ECharts, D3 (more adapters coming)
- 📦 **TypeScript First** - Full type definitions included
- 🌏 **i18n Support** - Japanese and English labels, locale-aware formatting
- ♿ **Accessibility** - Color schemes for colorblind users

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| `@contribution-margin/core` | Core calculation and layout engine | ![npm](https://img.shields.io/npm/v/@contribution-margin/core.svg) |
| `@contribution-margin/chartjs` | Chart.js plugin | ![npm](https://img.shields.io/npm/v/@contribution-margin/chartjs.svg) |

## Installation

```bash
# Core package only
npm install @contribution-margin/core

# With Chart.js plugin
npm install @contribution-margin/chartjs chart.js
```

Using pnpm:
```bash
pnpm add @contribution-margin/core @contribution-margin/chartjs chart.js
```

Using yarn:
```bash
yarn add @contribution-margin/core @contribution-margin/chartjs chart.js
```

## Quick Start

### Basic Calculation

```typescript
import { calculateCVP } from '@contribution-margin/core';

const result = calculateCVP({
  sales: 10_000_000,      // 売上高: 10,000千円
  variableCosts: 6_200_000, // 変動費: 6,200千円
  fixedCosts: 3_100_000,    // 固定費: 3,100千円
});

console.log(result.calculated.contributionMargin);    // 3,800,000 (限界利益)
console.log(result.calculated.contributionMarginRatio); // 0.38 (38%)
console.log(result.calculated.breakEvenPoint);        // 8,157,894.74 (損益分岐点)
console.log(result.calculated.operatingProfit);       // 700,000 (経営利益)
```

### Chart.js Integration

```typescript
import { Chart } from 'chart.js';
import { ContributionMarginPlugin, createCVPChartConfig } from '@contribution-margin/chartjs';

// Register the plugin
Chart.register(ContributionMarginPlugin);

// Create chart configuration
const config = createCVPChartConfig({
  input: {
    label: '2025-Q4',
    sales: 10_000_000,
    variableCosts: 6_200_000,
    fixedCosts: 3_100_000,
  },
  display: {
    showBEPLine: true,
    showValues: true,
    lossDisplayMode: 'negative-bar',
    unitMode: 'thousand',
    locale: 'ja-JP',
  },
});

// Create the chart
const chart = new Chart(ctx, config);
```

### Multi-Period Comparison

```typescript
import { createCVPChartConfig } from '@contribution-margin/chartjs';

const config = createCVPChartConfig({
  input: [
    { label: '2025-10', sales: 10_000_000, variableCosts: 6_200_000, fixedCosts: 3_100_000 },
    { label: '2025-11', sales: 9_500_000, variableCosts: 5_800_000, fixedCosts: 3_300_000 },
    { label: '2025-12', sales: 8_000_000, variableCosts: 5_600_000, fixedCosts: 3_400_000 },
    { label: '2026-01', sales: 11_200_000, variableCosts: 6_700_000, fixedCosts: 3_200_000 },
  ],
  title: 'Multi-Period CVP Analysis',
});
```

## Calculated Metrics

| Metric | Japanese | Formula |
|--------|----------|---------|
| Contribution Margin | 限界利益 | Sales - Variable Costs |
| Contribution Margin Ratio | 限界利益率 | CM ÷ Sales |
| Operating Profit | 経営利益 | CM - Fixed Costs |
| Break-Even Point | 損益分岐点 | Fixed Costs ÷ CM Ratio |
| Safety Margin | 安全余裕額 | Sales - BEP |
| Safety Margin Ratio | 安全余裕率 | Safety Margin ÷ Sales |
| Variable Cost Ratio | 変動費率 | Variable Costs ÷ Sales |
| Fixed Cost Ratio | 固定費率 | Fixed Costs ÷ Sales |
| Labor Distribution Ratio | 労働分配率 | Labor Costs ÷ CM |

## Display Options

### Loss Display Modes

| Mode | Description |
|------|-------------|
| `negative-bar` (default) | Shows loss as a red bar extending to the right |
| `downward` | Shows loss extending downward from the bar |
| `separate` | Shows loss as a separate block |

### Color Schemes

```typescript
// Built-in schemes
colorScheme: 'default' | 'pastel' | 'vivid' | 'monochrome' | 'colorblind'

// Custom colors
customColors: {
  sales: '#4A90E2',       // Blue
  variable: '#F5A623',    // Orange
  contribution: '#7ED321', // Green
  fixed: '#9B9B9B',       // Gray
  profit: '#417505',      // Dark Green
  loss: '#D0021B',        // Red
}
```

### Unit Modes

| Mode | Japanese | Example |
|------|----------|---------|
| `raw` | 円 | ¥10,000,000 |
| `thousand` (default) | 千円 | ¥10,000千円 |
| `million` | 百万円 | ¥10百万円 |
| `billion` | 億円 | ¥1億円 |

## Validation & Warnings

The library automatically validates input and provides warnings:

```typescript
import { validateCVP } from '@contribution-margin/core';

const result = validateCVP({
  sales: 10_000_000,
  variableCosts: 12_000_000, // Exceeds sales!
  fixedCosts: 3_000_000,
});

// result.warnings includes:
// - VARIABLE_EXCEEDS_SALES: "変動費が売上高以上です"
// - NEGATIVE_CONTRIBUTION_MARGIN: "限界利益が負です"
```

## API Reference

### Core Classes

#### `CVPCalculator`
```typescript
const calculator = new CVPCalculator();
const result = calculator.calculate(input);       // CVPCalculatedValues
const fullResult = calculator.calculateResult(input); // CVPResult
```

#### `CVPValidator`
```typescript
const validator = new CVPValidator();
const result = validator.validate(input); // ValidationResult
const isValid = validator.isValid(input); // boolean
```

#### `LayoutEngine`
```typescript
const engine = new LayoutEngine(displayOptions);
const layout = engine.generateLayout(input, calculated); // LayoutOutput
```

#### `ValueFormatter`
```typescript
const formatter = new ValueFormatter({ unitMode: 'thousand', locale: 'ja-JP' });
formatter.format(10_000_000);        // "¥10,000千円"
formatter.formatPercentage(0.38);    // "38.0%"
```

### Convenience Functions

```typescript
// Quick calculation
const result = calculateCVP(input);

// Quick validation
const validation = validateCVP(input);

// Quick layout generation
const layout = generateLayout(input, options);

// Quick formatting
const formatted = formatValue(10_000_000);
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run example app
pnpm dev:example
```

## Roadmap

- [x] Phase 0: Specification & Setup
- [x] Phase 1: MVP (Core + Chart.js)
- [ ] Phase 2: Annotations (ellipses, arrows)
- [ ] Phase 3: Interactive features (simulation)
- [ ] Phase 4: ECharts/D3 adapters

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

## License

MIT © [Contribution Margin Chart Contributors](LICENSE)

---

<div align="center">

**Made with ❤️ for management accountants and consultants**

</div>
