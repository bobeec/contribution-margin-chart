# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.1] - 2025-12-24

### Added

#### Documentation (English/Japanese Bilingual)

- **README.md completely rewritten**: Bilingual documentation (English/Japanese)
  - Clear separation with language anchors (#english, #日本語)
  - Complete API reference in both languages
  - Loss display mode documentation with examples
  - Chart layout diagram

- **Demo page bilingual redesign**: All content in English and Japanese
  - Each section has EN/JA side-by-side explanations
  - Code examples with bilingual comments
  - 8 comprehensive sections covering all features

#### Loss Display Mode Selection

- **Interactive loss mode selection**: Users can now switch between loss display modes
  - `negative-bar`: Loss extends downward from the fixed costs area
  - `separate`: Loss shown as a separate block (cleaner for reports)
  - New demo section (#5) dedicated to comparing both modes
  - Dropdown selector in interactive demo

### Changed

- Demo page structure improved for better readability
- All code examples now include bilingual comments
- Color scheme section expanded with visual comparison

## [0.3.0] - 2025-12-23

### Changed

#### @contribution-margin/chartjs v0.3.0

- **BEP Line disabled by default**: Treemap形式ではBEP縦線をデフォルトで非表示に変更
  - `showBEPLine: false` がデフォルト値に
  - 必要な場合は `showBEPLine: true` で明示的に有効化可能

- **Demo page completely redesigned**: デモページを大幅に拡充
  - 基本的な使い方のサンプル
  - インタラクティブなデモ（値の動的変更）
  - 黒字パターンのサンプル（高収益・標準）
  - 赤字パターンのサンプル（軽度・重度）
  - 複数期間比較のサンプル
  - カラースキームのサンプル（デフォルト・パステル・モノクローム）
  - APIリファレンスとコード例

### Removed

- **Trademark notice simplified**: STRAC®商標注記を簡略化
  - 「本ライブラリは一般的なCVP分析の実装です」のみを表示
  - 第三者商標への言及を削除

## [0.2.0] - 2025-12-23

### Added

#### @contribution-margin/core v0.2.0

- **TreemapLayoutEngine**: New layout engine for treemap-style CVP visualization
  - Generates area-based blocks representing sales structure
  - Supports nested layout: Sales (left) → Variable Costs, Contribution Margin, Fixed Costs, Profit (right)
  - Normalized coordinates (0-1) for flexible rendering
  - BEP line annotation support

- **TreemapBlock type**: New data structure for treemap visualization
  - Position (x, y), dimensions (width, height)
  - Color, text color, border styling
  - Value and percentage information

#### @contribution-margin/chartjs v0.2.0

- **ContributionMarginTreemapPlugin**: Chart.js plugin for treemap CVP charts
  - Renders area-based visualization of profit structure
  - Auto-hides Chart.js default axes for treemap mode
  - Supports BEP line annotations

- **TreemapRenderer**: Canvas renderer for treemap blocks
  - Dynamic font sizing based on block dimensions
  - Automatic text color contrast adjustment
  - Value and percentage label rendering
  - BEP line rendering with labels

- **createTreemapChartConfig**: Factory function for treemap chart configuration
  - Simple API matching existing CVP chart creation

### Changed

- Demo application updated to use Treemap layout by default
- Updated index.html with Treemap layout information

## [0.1.0] - 2025-12-23

### Added

#### @contribution-margin/core v0.1.0

- **CVPCalculator**: Core calculation engine for CVP (Cost-Volume-Profit) analysis
  - Contribution margin calculation
  - Break-even point (BEP) calculation
  - Safety margin calculation
  - Operating profit calculation
  - Various financial ratios (contribution margin ratio, operating profit ratio, variable cost ratio)
  - Multi-period calculation support
  - Static utility methods (`calculateRequiredSales`, `calculateProfitAtSales`)

- **CVPValidator**: Input validation with comprehensive error/warning system
  - Required field validation
  - Numeric value validation (non-negative, positive)
  - Business logic validation (e.g., variable costs not exceeding sales)
  - Warning detection for edge cases

- **LayoutEngine**: Chart layout generation
  - Segment generation for horizontal stacked bar charts
  - Annotation positioning for break-even point and profit markers
  - Multiple loss display modes (`negative-bar`, `striped`, `overlay`)
  - Configurable metrics display

- **ValueFormatter**: Locale-aware value formatting
  - Multiple unit support (none, thousand, million, billion, auto)
  - Currency formatting (JPY, USD, EUR, GBP)
  - Locale-based number formatting
  - Percentage and ratio formatting

- **Color Schemes**: Built-in color palettes
  - `default`: Professional business colors
  - `pastel`: Soft, accessible colors
  - `vivid`: High-contrast vibrant colors
  - `monochrome`: Grayscale palette
  - `colorblind`: Accessible palette for color vision deficiency

- **TypeScript**: Full TypeScript support with comprehensive type definitions

#### @contribution-margin/chartjs v0.1.0

- **Chart.js Plugin**: Integration with Chart.js v3/v4
  - `CVPChartPlugin`: Plugin for rendering CVP charts
  - `createCVPChart`: Factory function for creating charts
  - `updateCVPChart`: Function for updating existing charts

- **Features**:
  - Horizontal stacked bar chart rendering
  - Break-even point line with customizable style
  - Loss display modes (negative-bar as default)
  - Segment labels with automatic text color adjustment
  - Annotation support (top, bottom, side positions)
  - Responsive design
  - Interactive tooltips

- **Presets**: Built-in chart presets
  - Japanese Standard preset with localized labels
  - English Standard preset

### Documentation

- Comprehensive README with usage examples
- API documentation for all public interfaces
- Example application with Chart.js integration

---

## Release Notes

### v0.1.0 - Initial Release

This is the first public release of the Contribution Margin Chart library.

**Key Features:**
- Chart library agnostic core (`@contribution-margin/core`)
- Chart.js plugin (`@contribution-margin/chartjs`)
- Full TypeScript support
- Internationalization ready (Japanese, English)
- Comprehensive validation and error handling
- 107 unit tests with Vitest

**Target Use Cases:**
- Management accounting dashboards
- Financial reporting tools
- Business intelligence applications
- Educational materials for CVP analysis

**Note:** This library provides general CVP (Cost-Volume-Profit) analysis visualization and is not affiliated with or related to any trademarked methodologies.

[Unreleased]: https://github.com/bobeec/contribution-margin-chart/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/bobeec/contribution-margin-chart/releases/tag/v0.3.1
[0.3.0]: https://github.com/bobeec/contribution-margin-chart/releases/tag/v0.3.0
[0.2.0]: https://github.com/bobeec/contribution-margin-chart/releases/tag/v0.2.0
[0.1.0]: https://github.com/bobeec/contribution-margin-chart/releases/tag/v0.1.0
