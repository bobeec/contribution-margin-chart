/**
 * @contribution-margin/core - Type Definitions
 * CVP (Cost-Volume-Profit) Analysis Chart Library
 *
 * ⚠️ Trademark Notice:
 * This library implements general CVP analysis (Cost-Volume-Profit Analysis)
 * and is not affiliated with any specific trademarked accounting methodology.
 */

// ============================================================================
// Input Types
// ============================================================================

/**
 * Minimal required input data for CVP calculation
 * 最小構成の入力データ
 */
export interface CVPMinimalInput {
  /** 売上高 (Sales Revenue) - Must be positive */
  sales: number;
  /** 変動費 (Variable Costs) - Total variable costs */
  variableCosts: number;
  /** 固定費 (Fixed Costs) - Total fixed costs */
  fixedCosts: number;
}

/**
 * Variable costs breakdown (optional detailed breakdown)
 * 変動費の内訳（オプション）
 */
export interface VariableCostsBreakdown {
  /** 材料費 (Materials cost) */
  materials?: number;
  /** 外注費 (Outsourcing cost) */
  outsourcing?: number;
  /** 販売手数料 (Sales commissions) */
  commissions?: number;
  /** その他変動費 (Other variable costs) */
  other?: number;
}

/**
 * Fixed costs breakdown (optional detailed breakdown)
 * 固定費の内訳（オプション）
 */
export interface FixedCostsBreakdown {
  /** 労務費・人件費 (Labor costs) */
  labor?: number;
  /** 地代家賃 (Rent) */
  rent?: number;
  /** 減価償却費 (Depreciation) */
  depreciation?: number;
  /** その他固定費 (Other fixed costs) */
  other?: number;
}

/**
 * Complete input data with optional breakdowns and metadata
 * 完全な入力データ（内訳・メタデータ含む）
 */
export interface CVPInput extends CVPMinimalInput {
  /** Period label (e.g., "2025-Q4", "Jan 2025") */
  label?: string;
  /** Unique identifier for this data point */
  id?: string;

  /** Variable costs breakdown (display only in MVP) */
  variableCostsBreakdown?: VariableCostsBreakdown;
  /** Fixed costs breakdown (display only in MVP) */
  fixedCostsBreakdown?: FixedCostsBreakdown;

  /** Currency code (e.g., "JPY", "USD") */
  currency?: string;
  /** Fiscal year */
  fiscalYear?: number;
  /** Period identifier (e.g., "Q1", "Jan") */
  period?: string;
}

/**
 * Array of CVP inputs for multi-period comparison
 * 複数期間比較用の入力配列
 */
export type CVPInputArray = CVPInput[];

// ============================================================================
// Calculated Values Types
// ============================================================================

/**
 * Calculated CVP metrics
 * CVP計算結果
 */
export interface CVPCalculatedValues {
  // Basic metrics (基本指標)
  /** 限界利益 (Contribution Margin) = Sales - Variable Costs */
  contributionMargin: number;
  /** 限界利益率 (Contribution Margin Ratio) = CM / Sales */
  contributionMarginRatio: number;
  /** 営業利益 (Operating Profit) = CM - Fixed Costs */
  operatingProfit: number;
  /** 営業利益率 (Operating Profit Ratio) = OP / Sales */
  operatingProfitRatio: number;

  // Break-even point metrics (損益分岐点関連)
  /** 損益分岐点売上高 (Break-Even Point) = Fixed Costs / CM Ratio */
  breakEvenPoint: number | null;
  /** BEP比率 (BEP Ratio) = BEP / Sales */
  breakEvenRatio: number | null;
  /** 安全余裕額 (Safety Margin) = Sales - BEP */
  safetyMargin: number | null;
  /** 安全余裕率 (Safety Margin Ratio) = Safety Margin / Sales */
  safetyMarginRatio: number | null;

  // Cost ratios (原価率)
  /** 変動費率 (Variable Cost Ratio) = VC / Sales */
  variableCostRatio: number;
  /** 固定費率 (Fixed Cost Ratio) = FC / Sales */
  fixedCostRatio: number;

  // Labor metrics (optional - requires labor breakdown)
  /** 労働分配率 (Labor Distribution Ratio) = Labor / CM */
  laborDistributionRatio?: number | null;
}

/**
 * Full CVP result including input and calculated values
 * 入力値と計算結果を含む完全なCVP結果
 */
export interface CVPResult {
  input: CVPInput;
  calculated: CVPCalculatedValues;
  isProfit: boolean;
  isProfitable: boolean;
}

// ============================================================================
// Segment Types (for chart rendering)
// ============================================================================

/**
 * Segment type identifiers
 * セグメント種別
 */
export type SegmentType = 'sales' | 'variable' | 'contribution' | 'fixed' | 'profit' | 'loss';

/**
 * Text position for labels
 * ラベル配置位置
 */
export type TextPosition = 'inside' | 'outside' | 'center' | 'top' | 'bottom';

/**
 * Segment definition for chart rendering
 * グラフ描画用セグメント定義
 */
export interface Segment {
  /** Unique segment identifier */
  id: string;
  /** Segment type */
  type: SegmentType;
  /** Display label (e.g., "売上高", "変動費") */
  label: string;
  /** Monetary value */
  value: number;
  /** Start position (cumulative value) */
  start: number;
  /** Width (absolute value for rendering) */
  width: number;
  /** Display color (hex or CSS color) */
  color: string;
  /** Label text position */
  textPosition: TextPosition;
  /** Whether this is a calculated value (vs. input value) */
  isCalculated: boolean;
  /** Percentage of total sales */
  percentage?: number;
  /** Additional rendering metadata */
  meta?: Record<string, unknown>;
}

// ============================================================================
// Annotation Types
// ============================================================================

/**
 * Annotation type identifiers
 * 注釈種別
 */
export type AnnotationType = 'ellipse' | 'arrow' | 'line' | 'label' | 'zone';

/**
 * Line orientation
 * 線の向き
 */
export type LineOrientation = 'horizontal' | 'vertical';

/**
 * Position coordinates
 * 座標位置
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Size dimensions
 * サイズ
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Annotation style properties
 * 注釈スタイル
 */
export interface AnnotationStyle {
  /** Stroke/border width */
  strokeWidth?: number;
  /** Stroke/border color */
  strokeColor?: string;
  /** Dash pattern (e.g., "5,5" for dashed line) */
  strokeDasharray?: string;
  /** Fill color */
  fillColor?: string;
  /** Fill opacity (0-1) */
  fillOpacity?: number;
  /** Font size in pixels */
  fontSize?: number;
  /** Font family */
  fontFamily?: string;
  /** Font color */
  fontColor?: string;
  /** Font weight */
  fontWeight?: 'normal' | 'bold' | number;
}

/**
 * Annotation definition
 * 注釈定義
 */
export interface Annotation {
  /** Annotation type */
  type: AnnotationType;
  /** Position coordinates */
  position: Position;
  /** Size (for ellipse, zone) */
  size?: Size;
  /** Target position (for arrow) */
  target?: Position;
  /** Line orientation */
  orientation?: LineOrientation;
  /** Display text */
  text?: string;
  /** Style properties */
  style?: AnnotationStyle;
  /** Additional metadata */
  meta?: Record<string, unknown>;
}

// ============================================================================
// Display Options Types
// ============================================================================

/**
 * Unit display mode
 * 単位表示モード
 */
export type UnitMode = 'raw' | 'thousand' | 'million' | 'billion';

/**
 * Loss display mode
 * 赤字表示モード
 */
export type LossDisplayMode = 'negative-bar' | 'downward' | 'separate';

/**
 * Chart orientation
 * グラフの向き
 */
export type ChartOrientation = 'horizontal' | 'vertical';

/**
 * Annotation detail level
 * 注釈の詳細度
 */
export type AnnotationDetailLevel = 'minimal' | 'detailed';

/**
 * Color palette for chart segments
 * グラフセグメントの色パレット
 */
export interface ColorPalette {
  /** Sales segment color (default: #4A90E2 blue) */
  sales?: string;
  /** Variable costs segment color (default: #F5A623 orange) */
  variable?: string;
  /** Contribution margin segment color (default: #7ED321 green) */
  contribution?: string;
  /** Fixed costs segment color (default: #9B9B9B gray) */
  fixed?: string;
  /** Profit segment color (default: #417505 dark green) */
  profit?: string;
  /** Loss segment color (default: #D0021B red) */
  loss?: string;
}

/**
 * Predefined color scheme names
 * 定義済みカラースキーム
 */
export type ColorSchemeName = 'default' | 'pastel' | 'vivid' | 'monochrome' | 'colorblind';

/**
 * Custom color scheme definition
 * カスタムカラースキーム
 */
export interface ColorScheme {
  name: string;
  colors: Required<ColorPalette>;
}

/**
 * BEP display configuration
 * BEP表示設定
 */
export interface BEPDisplayOptions {
  /** Show BEP vertical line */
  showLine?: boolean;
  /** Show BEP label */
  showLabel?: boolean;
  /** Show profit/loss zones */
  showZone?: boolean;
  /** Line style */
  lineStyle?: {
    strokeWidth?: number;
    dashArray?: string;
    color?: string;
  };
  /** Label position */
  labelPosition?: 'top' | 'bottom' | 'inline';
  /** Label content type */
  labelContent?: 'value' | 'ratio' | 'both';
}

/**
 * Display options for chart rendering
 * グラフ表示オプション
 */
export interface DisplayOptions {
  // Value display (値の表示)
  /** Show monetary values on segments */
  showValues?: boolean;
  /** Show percentage values */
  showPercentages?: boolean;
  /** Show segment labels */
  showLabels?: boolean;

  // Unit & formatting (単位・フォーマット)
  /** Unit display mode */
  unitMode?: UnitMode;
  /** Currency symbol (e.g., "¥", "$") */
  currencySymbol?: string;
  /** Locale for number formatting (e.g., "ja-JP", "en-US") */
  locale?: string;
  /** Decimal places for values */
  decimalPlaces?: number;

  // Colors (色設定)
  /** Predefined color scheme or custom scheme */
  colorScheme?: ColorSchemeName | ColorScheme;
  /** Custom color overrides */
  customColors?: ColorPalette;

  // Layout (レイアウト)
  /** Chart orientation */
  orientation?: ChartOrientation;
  /** Loss display mode (default: 'negative-bar') */
  lossDisplayMode?: LossDisplayMode;
  /** Bar height/thickness */
  barThickness?: number;
  /** Spacing between bars */
  barSpacing?: number;

  // Annotations (注釈)
  /** Show BEP line (default: true) */
  showBEPLine?: boolean;
  /** BEP display options */
  bepOptions?: BEPDisplayOptions;
  /** Show contribution margin ellipse annotation */
  showContributionEllipse?: boolean;
  /** Show arrow annotations */
  showArrows?: boolean;
  /** Annotation detail level */
  annotationStyle?: AnnotationDetailLevel;

  // Interaction (インタラクション)
  /** Enable tooltip on hover */
  enableTooltip?: boolean;
  /** Enable click events */
  enableClick?: boolean;
  /** Enable hover effects */
  enableHover?: boolean;
  /** Enable animation */
  enableAnimation?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Warning severity levels
 * 警告の重大度
 */
export type WarningSeverity = 'info' | 'warning' | 'error';

/**
 * Warning codes
 * 警告コード
 */
export type WarningCode =
  | 'NEGATIVE_PROFIT'
  | 'ZERO_SALES'
  | 'NEGATIVE_SALES'
  | 'VARIABLE_EXCEEDS_SALES'
  | 'ZERO_CONTRIBUTION_MARGIN'
  | 'NEGATIVE_CONTRIBUTION_MARGIN'
  | 'ABNORMAL_RATIO'
  | 'ZERO_FIXED_COSTS'
  | 'LARGE_LOSS'
  | 'FLOATING_POINT_PRECISION';

/**
 * Validation warning
 * バリデーション警告
 */
export interface Warning {
  /** Warning code */
  code: WarningCode;
  /** Human-readable message */
  message: string;
  /** Severity level */
  severity: WarningSeverity;
  /** Affected input field */
  affectedField: string;
  /** Suggested action to resolve */
  suggestedAction?: string;
}

/**
 * Validation error
 * バリデーションエラー
 */
export interface ValidationError {
  /** Error code */
  code: string;
  /** Human-readable message */
  message: string;
  /** Affected field */
  field: string;
}

/**
 * Validation result
 * バリデーション結果
 */
export interface ValidationResult {
  /** Whether input is valid for calculation */
  isValid: boolean;
  /** List of warnings (non-fatal issues) */
  warnings: Warning[];
  /** List of errors (fatal issues that prevent calculation) */
  errors: ValidationError[];
}

// ============================================================================
// Metrics Display Types
// ============================================================================

/**
 * Metrics display configuration
 * 指標表示設定
 */
export interface MetricsConfig {
  /** Which metrics to display */
  display: {
    contributionMarginRatio?: boolean;
    breakEvenPoint?: boolean;
    operatingProfitRatio?: boolean;
    laborDistributionRatio?: boolean;
    safetyMargin?: boolean;
    safetyMarginRatio?: boolean;
  };
  /** Position of metrics display */
  position?: 'top' | 'bottom' | 'side' | 'inline';
  /** Display format */
  format?: 'compact' | 'detailed';
}

// ============================================================================
// Preset Types
// ============================================================================

/**
 * Predefined CVP preset names
 * 定義済みCVPプリセット
 */
export type CVPPresetName = 'management-accounting' | 'consulting' | 'mq-accounting' | 'custom';

/**
 * CVP configuration preset
 * CVP設定プリセット
 */
export interface CVPPreset {
  /** Preset name */
  name: CVPPresetName;
  /** Display options */
  displayOptions: DisplayOptions;
  /** Metrics configuration */
  metricsConfig: MetricsConfig;
  /** Custom definitions */
  customDefinitions?: {
    /** Which costs to include in fixed costs */
    fixedCostsIncludes?: string[];
    /** Which metrics to display */
    metricsToDisplay?: string[];
  };
}

// ============================================================================
// Layout Output Types
// ============================================================================

/**
 * Layout engine output
 * レイアウトエンジン出力
 */
export interface LayoutOutput {
  /** Generated segments for rendering */
  segments: Segment[];
  /** Generated annotations */
  annotations: Annotation[];
  /** Total width (max value for x-axis) */
  totalWidth: number;
  /** Number of rows (for multi-period) */
  rowCount: number;
  /** Layout metadata */
  meta?: {
    hasLoss: boolean;
    hasBEP: boolean;
    maxValue: number;
  };
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Segment click event data
 * セグメントクリックイベントデータ
 */
export interface SegmentClickEvent {
  segment: Segment;
  originalEvent: MouseEvent;
  cvpResult: CVPResult;
}

/**
 * Segment hover event data
 * セグメントホバーイベントデータ
 */
export interface SegmentHoverEvent {
  segment: Segment | null;
  originalEvent: MouseEvent;
}

// ============================================================================
// Export Types
// ============================================================================

/**
 * Export format options
 * エクスポート形式
 */
export type ExportFormat = 'png' | 'svg' | 'pdf' | 'json' | 'csv';

/**
 * Export options
 * エクスポートオプション
 */
export interface ExportOptions {
  format: ExportFormat;
  width?: number;
  height?: number;
  scale?: number;
  backgroundColor?: string;
  filename?: string;
}
