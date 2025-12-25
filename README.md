# Contribution Margin Chart

<div align="center">

[![npm @bobeec/contribution-margin-core](https://img.shields.io/npm/v/@bobeec/contribution-margin-core.svg)](https://www.npmjs.com/package/@bobeec/contribution-margin-core)
[![npm @bobeec/contribution-margin-chart](https://img.shields.io/npm/v/@bobeec/contribution-margin-chart.svg)](https://www.npmjs.com/package/@bobeec/contribution-margin-chart)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

**CVP Analysis Chart Library for JavaScript / Chart.js**

**CVP（損益分岐点）グラフ作成ライブラリ**

</div>

---

## インストール

```bash
npm install @bobeec/contribution-margin-chart chart.js
```

## 使用方法

### 1. HTML を追加

```html
<canvas id="cvp-chart" width="800" height="400"></canvas>
```

### 2. 初期化

```javascript
import { Chart } from 'chart.js';
import {
  ContributionMarginTreemapPlugin,
  createTreemapChartConfig,
} from '@bobeec/contribution-margin-chart';

Chart.register(ContributionMarginTreemapPlugin);

const config = createTreemapChartConfig({
  input: {
    sales: 10_000_000,
    variableCosts: 4_000_000,
    fixedCosts: 3_000_000,
  },
});

new Chart(document.getElementById('cvp-chart'), config);
```

**これで準備完了です。**

---

## 設定

### オプション一覧

| オプション | 型 | デフォルト | 説明 |
|-----------|------|----------|------|
| `showValues` | boolean | `true` | 金額を表示 |
| `showLabels` | boolean | `true` | ラベルを表示（売上高、変動費など） |
| `showPercentages` | boolean | `false` | 割合を表示 |
| `showBEPLine` | boolean | `false` | 損益分岐点ラインを表示 |
| `unitMode` | string | `'thousand'` | 単位: `'raw'` \| `'thousand'` \| `'million'` \| `'billion'` |
| `locale` | string | `'ja-JP'` | 数値フォーマットに使うロケール |
| `currencySymbol` | string | `'¥'` | 通貨記号 |
| `colorScheme` | string | `'default'` | カラースキーム: `'default'` \| `'pastel'` \| `'vivid'` \| `'monochrome'` \| `'colorblind'` |
| `lossDisplayMode` | string | `'negative-bar'` | 赤字表示: `'negative-bar'` \| `'separate'` |

### 設定例（フルオプション）

```javascript
const config = createTreemapChartConfig({
  input: {
    label: '2025年第4四半期',
    sales: 10_000_000,
    variableCosts: 4_000_000,
    fixedCosts: 3_000_000,
  },
  title: 'CVP 分析',
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

5種類の組み込みカラースキームがあります。

| スキーム | 説明 | 用途 |
|---------|------|------|
| `default` | プロフェッショナルな青/オレンジ/緑 | ビジネスレポート |
| `pastel` | 柔らかいパステルカラー | プレゼンテーション |
| `vivid` | 高コントラストで鮮やか | マーケティング資料 |
| `monochrome` | グレースケール | 印刷物 |
| `colorblind` | 色覚多様性に配慮 | ユニバーサルデザイン |

### スキーム例

```javascript
display: { colorScheme: 'pastel' }
display: { colorScheme: 'colorblind' }
```

### カスタムカラー

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

---

## 赤字表示モード

- `negative-bar`（デフォルト）: 棒グラフがゼロラインを下回る形で損失を表示。
- `separate`: 損失を少し離した別ブロックとして表示。

```javascript
display: { lossDisplayMode: 'negative-bar' }
display: { lossDisplayMode: 'separate' }
```

---

## 計算ユーティリティ

`CVPCalculator` で主要指標を計算できます。

```javascript
import { CVPCalculator } from '@bobeec/contribution-margin-chart';

const calc = new CVPCalculator();
const result = calc.calculateResult({
  sales: 10_000_000,
  variableCosts: 4_000_000,
  fixedCosts: 3_000_000,
});

console.log(result.calculated);
console.log(result.isProfitable); // true
```

主な計算項目: 限界利益、限界利益率、損益分岐点、営業利益、安全余裕度、変動費率、固定費率。

---

## 値のフォーマット

`ValueFormatter` で単位や通貨を整形できます。

```javascript
import { ValueFormatter } from '@bobeec/contribution-margin-chart';

const fmt = new ValueFormatter({
  unitMode: 'thousand',
  locale: 'ja-JP',
  currencySymbol: '¥',
});

fmt.format(10_000_000);      // "¥10,000,000"
fmt.formatPercentage(0.52);  // "52.0%"
```

| 単位モード | 除数 | 例 (10,000,000) |
|-----------|------|-----------------|
| `raw` | 1 | ¥10,000,000 |
| `thousand` | 1,000 | ¥10,000 |
| `million` | 1,000,000 | ¥10 |
| `billion` | 1,000,000,000 | ¥0.01 |

---

## バリデーション

`CVPValidator` で入力を検証し、エラーや警告を取得できます。

```javascript
import { CVPValidator } from '@bobeec/contribution-margin-chart';

const validator = new CVPValidator();
const result = validator.validate({
  sales: 10_000_000,
  variableCosts: 12_000_000,
  fixedCosts: 3_000_000,
});

if (!result.isValid) console.error(result.errors);
if (result.warnings.length > 0) console.warn(result.warnings);
```

---

## 動的更新

```javascript
function updateChart(chart, newData) {
  const options = chart.options.plugins?.contributionMarginTreemap;
  if (options) options.input = newData;
  chart.$cvpTreemap = undefined; // キャッシュをクリア
  chart.update();
}

updateChart(myChart, {
  sales: 12_000_000,
  variableCosts: 5_000_000,
  fixedCosts: 3_500_000,
});
```

---

## Tips

- レスポンシブ: コンテナの CSS で幅・高さを指定。
- 複数チャート: 月次など複数入力をループで生成。
- ダークモード: カスタムカラーで背景に合わせる。
- 画像出力: `canvas.toDataURL('image/png')` で PNG を取得。

---

## Packages

| Package | Description |
|---------|-------------|
| `@bobeec/contribution-margin-core` | Core calculation engine (framework agnostic) |
| `@bobeec/contribution-margin-chart` | Chart.js plugin |

---

## License

MIT License

---

<div align="center">

**Made with ❤ for management accountants**

**管理会計に携わる皆さまのために ❤**

[GitHub](https://github.com/bobeec/contribution-margin-chart) | [npm](https://www.npmjs.com/package/@bobeec/contribution-margin-chart)

</div>

