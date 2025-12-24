# Contribution Margin Chart

<div align="center">

[![npm version](https://img.shields.io/npm/v/@contribution-margin/core.svg)](https://www.npmjs.com/package/@contribution-margin/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

**JavaScript library for CVP (Cost-Volume-Profit) analysis visualization**

**CVP分析（損益分岐点分析）を可視化するJavaScriptライブラリ**

[English](#english) | [日本語](#日本語)

</div>

---

# English

## Overview

A TypeScript library for creating CVP (Cost-Volume-Profit) analysis charts. Automatically calculates contribution margin, break-even point, and safety margin, then visualizes the profit structure using Chart.js.

## Features

| Feature | Description |
|---------|-------------|
| 📊 **Treemap Chart** | Visualize profit structure with area-based blocks |
| 🔢 **Auto Calculation** | Contribution margin, BEP, safety margin, and more |
| ⚠️ **Validation** | Warnings for anomalies (negative margin, etc.) |
| 🎨 **Color Schemes** | Default, pastel, monochrome, colorblind-friendly |
| 📉 **Loss Display Modes** | Choose how to display losses (extend down or separate block) |
| 📦 **TypeScript** | Full type definitions included |
| 🌏 **i18n** | Japanese and English labels |

## Installation

```bash
npm install @contribution-margin/chartjs chart.js
# or
pnpm add @contribution-margin/chartjs chart.js
# or
yarn add @contribution-margin/chartjs chart.js
```

## Quick Start

### Basic Usage

```typescript
import { Chart } from 'chart.js';
import {
  ContributionMarginTreemapPlugin,
  createTreemapChartConfig,
} from '@contribution-margin/chartjs';

// Register the plugin
Chart.register(ContributionMarginTreemapPlugin);

// Create chart configuration
const config = createTreemapChartConfig({
  input: {
    label: 'December 2025',
    sales: 10_000_000,        // Sales: ¥10,000,000
    variableCosts: 4_000_000, // Variable Costs: ¥4,000,000
    fixedCosts: 3_000_000,    // Fixed Costs: ¥3,000,000
  },
  title: 'CVP Analysis',
});

// Create the chart
new Chart(canvas, config);
```

### Calculate Metrics

```typescript
import { CVPCalculator, ValueFormatter } from '@contribution-margin/chartjs';

const calculator = new CVPCalculator();
const result = calculator.calculateResult({
  sales: 10_000_000,
  variableCosts: 4_000_000,
  fixedCosts: 3_000_000,
});

console.log(result.calculated.contributionMargin);    // 6,000,000 (Contribution Margin)
console.log(result.calculated.contributionMarginRatio); // 0.6 (60%)
console.log(result.calculated.breakEvenPoint);        // 5,000,000 (Break-Even Point)
console.log(result.calculated.operatingProfit);       // 3,000,000 (Operating Profit)
console.log(result.calculated.safetyMarginRatio);     // 0.5 (50%)
```

### Loss Display Modes

When operating at a loss, you can choose how to display it:

```typescript
// Mode 1: Loss extends downward (default)
const config1 = createTreemapChartConfig({
  input: { sales: 10_000_000, variableCosts: 5_000_000, fixedCosts: 6_000_000 },
  display: {
    lossDisplayMode: 'negative-bar', // Loss extends below the chart
  },
});

// Mode 2: Loss as separate block
const config2 = createTreemapChartConfig({
  input: { sales: 10_000_000, variableCosts: 5_000_000, fixedCosts: 6_000_000 },
  display: {
    lossDisplayMode: 'separate', // Loss shown as separate block on right
  },
});
```

### Display Options

```typescript
const config = createTreemapChartConfig({
  input: { /* ... */ },
  display: {
    showValues: true,           // Show monetary values
    showLabels: true,           // Show block labels
    showPercentages: false,     // Show percentages
    unitMode: 'thousand',       // 'raw' | 'thousand' | 'million' | 'billion'
    locale: 'en-US',            // Locale for formatting
    currencySymbol: '$',        // Currency symbol
    colorScheme: 'default',     // 'default' | 'pastel' | 'monochrome' | 'colorblind'
    lossDisplayMode: 'negative-bar', // 'negative-bar' | 'separate'
  },
});
```

## Calculated Metrics

| Metric | Formula |
|--------|---------|
| Contribution Margin | Sales - Variable Costs |
| Contribution Margin Ratio | CM ÷ Sales |
| Operating Profit | CM - Fixed Costs |
| Break-Even Point | Fixed Costs ÷ CM Ratio |
| Safety Margin | Sales - BEP |
| Safety Margin Ratio | Safety Margin ÷ Sales |

## Chart Layout

```
┌─────────────────────────────────────────────────────┐
│                      Sales                          │
│  ┌───────────────┬─────────────────────────────┐   │
│  │               │       Variable Costs        │   │
│  │               ├─────────────────────────────┤   │
│  │    Sales      │    Contribution Margin      │   │
│  │               │  ┌───────────┬───────────┐  │   │
│  │               │  │  Fixed    │  Profit   │  │   │
│  │               │  │  Costs    │  (Loss)   │  │   │
│  │               │  └───────────┴───────────┘  │   │
│  └───────────────┴─────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

# 日本語

## 概要

CVP分析（Cost-Volume-Profit Analysis：損益分岐点分析）のグラフを作成するTypeScriptライブラリです。限界利益、損益分岐点、安全余裕率などを自動計算し、Chart.jsを使って利益構造を可視化します。

## 特徴

| 機能 | 説明 |
|------|------|
| 📊 **Treemapチャート** | 面積ブロック図で利益構造を可視化 |
| 🔢 **自動計算** | 限界利益、損益分岐点、安全余裕率などを自動計算 |
| ⚠️ **バリデーション** | 異常値（負の限界利益など）を警告 |
| 🎨 **カラースキーム** | デフォルト、パステル、モノクローム、色覚対応 |
| 📉 **赤字表示モード** | 赤字の表示方法を選択可能（下に足が出る / 別ブロック） |
| 📦 **TypeScript** | 完全な型定義を同梱 |
| 🌏 **国際化対応** | 日本語・英語のラベル対応 |

## インストール

```bash
npm install @contribution-margin/chartjs chart.js
# または
pnpm add @contribution-margin/chartjs chart.js
# または
yarn add @contribution-margin/chartjs chart.js
```

## クイックスタート

### 基本的な使い方

```typescript
import { Chart } from 'chart.js';
import {
  ContributionMarginTreemapPlugin,
  createTreemapChartConfig,
} from '@contribution-margin/chartjs';

// プラグインを登録
Chart.register(ContributionMarginTreemapPlugin);

// チャート設定を作成
const config = createTreemapChartConfig({
  input: {
    label: '2025年12月',
    sales: 10_000_000,        // 売上高: 1,000万円
    variableCosts: 4_000_000, // 変動費: 400万円
    fixedCosts: 3_000_000,    // 固定費: 300万円
  },
  title: 'CVP分析グラフ',
});

// チャートを作成
new Chart(canvas, config);
```

### 指標を計算する

```typescript
import { CVPCalculator, ValueFormatter } from '@contribution-margin/chartjs';

const calculator = new CVPCalculator();
const result = calculator.calculateResult({
  sales: 10_000_000,
  variableCosts: 4_000_000,
  fixedCosts: 3_000_000,
});

console.log(result.calculated.contributionMargin);    // 6,000,000（限界利益）
console.log(result.calculated.contributionMarginRatio); // 0.6（60%）
console.log(result.calculated.breakEvenPoint);        // 5,000,000（損益分岐点）
console.log(result.calculated.operatingProfit);       // 3,000,000（経営利益）
console.log(result.calculated.safetyMarginRatio);     // 0.5（50%）
```

### 赤字表示モード

赤字（経営損失）の場合、表示方法を選択できます：

```typescript
// モード1: 下に足が出る（デフォルト）
const config1 = createTreemapChartConfig({
  input: { sales: 10_000_000, variableCosts: 5_000_000, fixedCosts: 6_000_000 },
  display: {
    lossDisplayMode: 'negative-bar', // グラフの下に赤字部分が突き出る
  },
});

// モード2: 別ブロックで分離
const config2 = createTreemapChartConfig({
  input: { sales: 10_000_000, variableCosts: 5_000_000, fixedCosts: 6_000_000 },
  display: {
    lossDisplayMode: 'separate', // 右側に赤字部分を別ブロックで表示
  },
});
```

### 表示オプション

```typescript
const config = createTreemapChartConfig({
  input: { /* ... */ },
  display: {
    showValues: true,           // 金額を表示
    showLabels: true,           // ラベルを表示
    showPercentages: false,     // パーセンテージを表示
    unitMode: 'thousand',       // 'raw' | 'thousand' | 'million' | 'billion'
    locale: 'ja-JP',            // ロケール
    currencySymbol: '¥',        // 通貨記号
    colorScheme: 'default',     // 'default' | 'pastel' | 'monochrome' | 'colorblind'
    lossDisplayMode: 'negative-bar', // 'negative-bar' | 'separate'
  },
});
```

## 計算される指標

| 指標 | 日本語 | 計算式 |
|------|--------|--------|
| Contribution Margin | 限界利益 | 売上高 - 変動費 |
| Contribution Margin Ratio | 限界利益率 | 限界利益 ÷ 売上高 |
| Operating Profit | 経営利益 | 限界利益 - 固定費 |
| Break-Even Point | 損益分岐点 | 固定費 ÷ 限界利益率 |
| Safety Margin | 安全余裕額 | 売上高 - 損益分岐点 |
| Safety Margin Ratio | 安全余裕率 | 安全余裕額 ÷ 売上高 |

## グラフのレイアウト

```
┌─────────────────────────────────────────────────────┐
│                      売上高                         │
│  ┌───────────────┬─────────────────────────────┐   │
│  │               │         変動費              │   │
│  │               ├─────────────────────────────┤   │
│  │    売上高     │        限界利益             │   │
│  │               │  ┌───────────┬───────────┐  │   │
│  │               │  │  固定費   │  利益     │  │   │
│  │               │  │           │ （損失）  │  │   │
│  │               │  └───────────┴───────────┘  │   │
│  └───────────────┴─────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Packages | パッケージ

| Package | Description | 説明 |
|---------|-------------|------|
| `@contribution-margin/core` | Core calculation engine | コア計算エンジン |
| `@contribution-margin/chartjs` | Chart.js plugin | Chart.jsプラグイン |

## API Reference | APIリファレンス

### CVPCalculator

```typescript
import { CVPCalculator } from '@contribution-margin/chartjs';

const calculator = new CVPCalculator();

// Calculate all metrics | すべての指標を計算
const result = calculator.calculateResult({
  sales: 10_000_000,
  variableCosts: 4_000_000,
  fixedCosts: 3_000_000,
});

// Access calculated values | 計算結果にアクセス
result.calculated.contributionMargin;    // 限界利益
result.calculated.contributionMarginRatio; // 限界利益率
result.calculated.breakEvenPoint;        // 損益分岐点
result.calculated.operatingProfit;       // 経営利益
result.calculated.safetyMargin;          // 安全余裕額
result.calculated.safetyMarginRatio;     // 安全余裕率
result.isProfitable;                     // 黒字かどうか
```

### ValueFormatter

```typescript
import { ValueFormatter } from '@contribution-margin/chartjs';

const formatter = new ValueFormatter({
  unitMode: 'thousand',  // 千円単位
  locale: 'ja-JP',
  currencySymbol: '¥',
});

formatter.format(10_000_000);       // "¥10,000千円"
formatter.formatPercentage(0.52);   // "52.0%"
```

### CVPValidator

```typescript
import { CVPValidator } from '@contribution-margin/chartjs';

const validator = new CVPValidator();
const result = validator.validate({
  sales: 10_000_000,
  variableCosts: 12_000_000, // Exceeds sales! | 売上高を超えている！
  fixedCosts: 3_000_000,
});

if (result.warnings.length > 0) {
  console.warn(result.warnings);
  // VARIABLE_EXCEEDS_SALES: "変動費が売上高以上です"
}
```

## Development | 開発

```bash
# Install dependencies | 依存関係をインストール
pnpm install

# Build all packages | 全パッケージをビルド
pnpm build

# Run tests | テストを実行
pnpm test

# Run example app | サンプルアプリを起動
cd examples/basic-chartjs && pnpm dev
```

## License | ライセンス

MIT License

---

<div align="center">

**Made with ❤️ for management accountants**

**管理会計に携わる皆さまのために ❤️**

[GitHub](https://github.com/bobeec/contribution-margin-chart) | [npm](https://www.npmjs.com/package/@contribution-margin/chartjs)

</div>
