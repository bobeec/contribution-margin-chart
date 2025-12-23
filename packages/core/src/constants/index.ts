/**
 * @contribution-margin/core - Constants
 * Default values and predefined configurations
 */

import type { ColorPalette, ColorScheme, DisplayOptions, MetricsConfig } from '../types';

// ============================================================================
// Default Color Palettes
// ============================================================================

/**
 * Default color palette (recommended for CVP charts)
 * デフォルトカラーパレット（CVPグラフ推奨）
 */
export const DEFAULT_COLORS: Required<ColorPalette> = {
  sales: '#4A90E2', // Blue - 青系
  variable: '#F5A623', // Orange - オレンジ系
  contribution: '#7ED321', // Green - 緑系
  fixed: '#9B9B9B', // Gray - 灰系
  profit: '#417505', // Dark Green - 濃緑
  loss: '#D0021B', // Red - 赤
};

/**
 * Pastel color palette
 * パステルカラーパレット
 */
export const PASTEL_COLORS: Required<ColorPalette> = {
  sales: '#A8D5E5',
  variable: '#FFD5A5',
  contribution: '#C5E8B7',
  fixed: '#D5D5D5',
  profit: '#B5D99A',
  loss: '#F5B5B5',
};

/**
 * Vivid color palette
 * ビビッドカラーパレット
 */
export const VIVID_COLORS: Required<ColorPalette> = {
  sales: '#2196F3',
  variable: '#FF9800',
  contribution: '#4CAF50',
  fixed: '#607D8B',
  profit: '#2E7D32',
  loss: '#F44336',
};

/**
 * Monochrome color palette
 * モノクロカラーパレット
 */
export const MONOCHROME_COLORS: Required<ColorPalette> = {
  sales: '#333333',
  variable: '#666666',
  contribution: '#444444',
  fixed: '#888888',
  profit: '#222222',
  loss: '#AA0000',
};

/**
 * Colorblind-friendly palette
 * 色覚多様性対応パレット
 */
export const COLORBLIND_COLORS: Required<ColorPalette> = {
  sales: '#0077BB',
  variable: '#EE7733',
  contribution: '#009988',
  fixed: '#BBBBBB',
  profit: '#33BBEE',
  loss: '#CC3311',
};

/**
 * All predefined color schemes
 * 定義済みカラースキーム一覧
 */
export const COLOR_SCHEMES: Record<string, ColorScheme> = {
  default: { name: 'default', colors: DEFAULT_COLORS },
  pastel: { name: 'pastel', colors: PASTEL_COLORS },
  vivid: { name: 'vivid', colors: VIVID_COLORS },
  monochrome: { name: 'monochrome', colors: MONOCHROME_COLORS },
  colorblind: { name: 'colorblind', colors: COLORBLIND_COLORS },
};

// ============================================================================
// Default Display Options
// ============================================================================

/**
 * Default display options
 * デフォルト表示オプション
 */
export const DEFAULT_DISPLAY_OPTIONS: Required<
  Omit<DisplayOptions, 'colorScheme' | 'customColors' | 'bepOptions'>
> & {
  colorScheme: 'default';
  customColors: Required<ColorPalette>;
  bepOptions: Required<NonNullable<DisplayOptions['bepOptions']>>;
} = {
  // Value display
  showValues: true,
  showPercentages: false,
  showLabels: true,

  // Unit & formatting
  unitMode: 'thousand', // 千円表示（日本向けデフォルト）
  currencySymbol: '¥',
  locale: 'ja-JP',
  decimalPlaces: 0,

  // Colors
  colorScheme: 'default',
  customColors: DEFAULT_COLORS,

  // Layout
  orientation: 'horizontal',
  lossDisplayMode: 'negative-bar', // MVPデフォルト
  barThickness: 40,
  barSpacing: 20,

  // Annotations
  showBEPLine: true,
  bepOptions: {
    showLine: true,
    showLabel: true,
    showZone: false,
    lineStyle: {
      strokeWidth: 2,
      dashArray: '5,5', // 点線スタイル（主流）
      color: '#666666',
    },
    labelPosition: 'top',
    labelContent: 'value',
  },
  showContributionEllipse: false,
  showArrows: false,
  annotationStyle: 'minimal',

  // Interaction
  enableTooltip: true,
  enableClick: true,
  enableHover: true,
  enableAnimation: true,
  animationDuration: 300,
};

// ============================================================================
// Default Metrics Config
// ============================================================================

/**
 * Default metrics configuration
 * デフォルト指標設定
 */
export const DEFAULT_METRICS_CONFIG: MetricsConfig = {
  display: {
    contributionMarginRatio: true,
    breakEvenPoint: true,
    operatingProfitRatio: true,
    laborDistributionRatio: false,
    safetyMargin: false,
    safetyMarginRatio: false,
  },
  position: 'top',
  format: 'compact',
};

// ============================================================================
// Labels (Japanese / English)
// ============================================================================

/**
 * Japanese labels for CVP segments
 * 日本語ラベル
 */
export const LABELS_JA: Record<string, string> = {
  sales: '売上高',
  variable: '変動費',
  contribution: '限界利益',
  fixed: '固定費',
  profit: '経営利益',
  loss: '損失',
  breakEvenPoint: '損益分岐点',
  contributionMarginRatio: '限界利益率',
  operatingProfitRatio: '営業利益率',
  variableCostRatio: '変動費率',
  fixedCostRatio: '固定費率',
  safetyMargin: '安全余裕額',
  safetyMarginRatio: '安全余裕率',
  laborDistributionRatio: '労働分配率',
  // Breakdown labels
  materials: '材料費',
  outsourcing: '外注費',
  commissions: '販売手数料',
  labor: '人件費',
  rent: '地代家賃',
  depreciation: '減価償却費',
  other: 'その他',
};

/**
 * English labels for CVP segments
 * 英語ラベル
 */
export const LABELS_EN: Record<string, string> = {
  sales: 'Sales',
  variable: 'Variable Costs',
  contribution: 'Contribution Margin',
  fixed: 'Fixed Costs',
  profit: 'Operating Profit',
  loss: 'Loss',
  breakEvenPoint: 'Break-Even Point',
  contributionMarginRatio: 'CM Ratio',
  operatingProfitRatio: 'OP Ratio',
  variableCostRatio: 'VC Ratio',
  fixedCostRatio: 'FC Ratio',
  safetyMargin: 'Safety Margin',
  safetyMarginRatio: 'Safety Margin Ratio',
  laborDistributionRatio: 'Labor Distribution',
  // Breakdown labels
  materials: 'Materials',
  outsourcing: 'Outsourcing',
  commissions: 'Commissions',
  labor: 'Labor',
  rent: 'Rent',
  depreciation: 'Depreciation',
  other: 'Other',
};

/**
 * Get labels by locale
 * ロケールに応じたラベル取得
 */
export function getLabels(locale: string = 'ja-JP'): Record<string, string> {
  if (locale.startsWith('ja')) {
    return LABELS_JA;
  }
  return LABELS_EN;
}

// ============================================================================
// Unit Suffixes
// ============================================================================

/**
 * Unit suffixes by mode and locale
 * 単位サフィックス
 */
export const UNIT_SUFFIXES: Record<string, Record<string, string>> = {
  ja: {
    raw: '',
    thousand: '千円',
    million: '百万円',
    billion: '億円',
  },
  en: {
    raw: '',
    thousand: 'K',
    million: 'M',
    billion: 'B',
  },
};

/**
 * Unit divisors for each mode
 * 単位除数
 */
export const UNIT_DIVISORS: Record<string, number> = {
  raw: 1,
  thousand: 1000,
  million: 1_000_000,
  billion: 1_000_000_000,
};

// ============================================================================
// Validation Thresholds
// ============================================================================

/**
 * Validation thresholds
 * バリデーション閾値
 */
export const VALIDATION_THRESHOLDS = {
  /** Maximum safe integer for calculations */
  MAX_VALUE: Number.MAX_SAFE_INTEGER,
  /** Minimum value to avoid division by zero */
  MIN_POSITIVE: 0.0001,
  /** Abnormal ratio threshold (e.g., variable cost ratio > 150%) */
  ABNORMAL_RATIO_THRESHOLD: 1.5,
  /** Large loss threshold (loss > 50% of sales) */
  LARGE_LOSS_THRESHOLD: 0.5,
  /** Floating point precision for comparisons */
  PRECISION_EPSILON: 1e-10,
};

// ============================================================================
// Sample Data
// ============================================================================

/**
 * Sample data for testing and demos
 * テスト・デモ用サンプルデータ
 */
export const SAMPLE_DATA = {
  /** Basic profit scenario (黒字シナリオ) */
  basic: {
    label: '2025-10',
    sales: 10_000_000,
    variableCosts: 6_200_000,
    fixedCosts: 3_100_000,
    currency: 'JPY',
    fiscalYear: 2025,
    period: 'Oct',
  },
  /** Loss scenario (赤字シナリオ) */
  loss: {
    label: '2025-12',
    sales: 8_000_000,
    variableCosts: 5_600_000,
    fixedCosts: 3_400_000,
    currency: 'JPY',
  },
  /** Multi-period data (複数期間データ) */
  multiPeriod: [
    {
      label: '2025-10',
      sales: 10_000_000,
      variableCosts: 6_200_000,
      fixedCosts: 3_100_000,
      fixedCostsBreakdown: { labor: 1_800_000, rent: 800_000, depreciation: 300_000, other: 200_000 },
    },
    {
      label: '2025-11',
      sales: 9_500_000,
      variableCosts: 5_800_000,
      fixedCosts: 3_300_000,
      fixedCostsBreakdown: { labor: 1_900_000, rent: 800_000, depreciation: 300_000, other: 300_000 },
    },
    {
      label: '2025-12',
      sales: 8_000_000,
      variableCosts: 5_600_000,
      fixedCosts: 3_400_000,
      fixedCostsBreakdown: { labor: 2_000_000, rent: 800_000, depreciation: 300_000, other: 300_000 },
    },
    {
      label: '2026-01',
      sales: 11_200_000,
      variableCosts: 6_700_000,
      fixedCosts: 3_200_000,
      fixedCostsBreakdown: { labor: 1_850_000, rent: 800_000, depreciation: 300_000, other: 250_000 },
    },
  ],
};

/**
 * Edge case test data
 * エッジケーステストデータ
 */
export const EDGE_CASE_DATA = {
  /** Variable costs exceed sales (変動費が売上超過) */
  variableExceedsSales: {
    label: 'Test-VC>Sales',
    sales: 10_000_000,
    variableCosts: 12_000_000,
    fixedCosts: 3_000_000,
  },
  /** Zero fixed costs (固定費ゼロ) */
  zeroFixedCosts: {
    label: 'Test-FC=0',
    sales: 10_000_000,
    variableCosts: 6_000_000,
    fixedCosts: 0,
  },
  /** Large loss (大赤字) */
  largeLoss: {
    label: 'Test-LargeLoss',
    sales: 5_000_000,
    variableCosts: 3_500_000,
    fixedCosts: 5_000_000,
  },
  /** Minimal profit (極小利益) */
  minimalProfit: {
    label: 'Test-MinProfit',
    sales: 10_000_000,
    variableCosts: 6_000_000,
    fixedCosts: 3_999_000,
  },
  /** Zero sales (売上ゼロ) */
  zeroSales: {
    label: 'Test-ZeroSales',
    sales: 0,
    variableCosts: 0,
    fixedCosts: 1_000_000,
  },
};
