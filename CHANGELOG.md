# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2025-12-24

### Added

#### Correct Loss Display (襍､蟄苓｡ｨ遉ｺ縺ｮ豁｣遒ｺ縺ｪ螳溯｣・

- **Loss extends below chart area**: When in deficit (costs > sales), the loss portion now correctly extends below the zero line
  - Uses `heightExtension` scaling to fit both normal area and loss area within the chart
  - Visual representation: Loss "protrudes" below the sales area, like a negative bar chart
  - Both `negative-bar` and `separate` modes now work correctly

- **襍､蟄励′荳九↓縺ｯ縺ｿ蜃ｺ繧玖｡ｨ遉ｺ**: 邱上さ繧ｹ繝医′螢ｲ荳翫ｒ雜・∴繧句ｴ蜷医∵錐螟ｱ驛ｨ蛻・′繧ｼ繝ｭ繝ｩ繧､繝ｳ繧医ｊ荳九↓豁｣縺励￥陦ｨ遉ｺ縺輔ｌ繧九ｈ縺・↓縺ｪ繧翫∪縺励◆
  - `heightExtension`繧ｹ繧ｱ繝ｼ繝ｪ繝ｳ繧ｰ縺ｧ騾壼ｸｸ繧ｨ繝ｪ繧｢縺ｨ謳榊､ｱ繧ｨ繝ｪ繧｢繧剃ｸ｡譁ｹ繝√Ε繝ｼ繝亥・縺ｫ蜿弱ａ繧・
  - 隕冶ｦ夂噪陦ｨ迴ｾ・壽｣偵げ繝ｩ繝輔′繧ｼ繝ｭ繝ｩ繧､繝ｳ繧剃ｸ句屓繧九ｈ縺・↓縲∵錐螟ｱ縺御ｸ九↓縺ｯ縺ｿ蜃ｺ繧・
  - `negative-bar`縺ｨ`separate`荳｡繝｢繝ｼ繝峨′豁｣縺励￥蜍穂ｽ・

#### Slick-style Documentation (Slick鬚ｨ繝峨く繝･繝｡繝ｳ繝・

- **README completely rewritten**: Slick.js-inspired documentation style
  - Clear "Getting Started" section with 3 steps
  - **Option Reference Table**: All options with types, defaults, and descriptions
  - **Color Schemes Guide**: 5 built-in schemes with use cases
  - **Custom Colors**: How to override individual colors
  - **Tips & Tricks**: Responsive charts, multiple charts, dark mode, export
  - Bilingual (English/Japanese) with clear separation

### Changed

- TreemapRenderer: Uses `heightExtension` from layout metadata for proper scaling
- TreemapLayoutEngine: Correct `heightExtension` calculation for loss scenarios
- Demo page updated to v0.4.0

## [0.3.2] - 2025-12-24

### Fixed

#### Loss Display (襍､蟄苓｡ｨ遉ｺ縺ｮ菫ｮ豁｣)

- **Loss extends below chart area**: When in deficit (襍､蟄・, the loss portion now correctly extends below the chart
  - In CVP analysis, when costs exceed sales, the right side (cost side) should visually extend below the sales (left side)
  - `negative-bar` mode: Loss block starts at y=1.0 (bottom of sales) and extends downward
  - Visual pattern (diagonal lines) added to emphasize the protruding loss area
  - This accurately represents that "total costs are larger than sales"

- **CVP蛻・梵縺ｧ縺ｮ豁｣遒ｺ縺ｪ襍､蟄苓｡ｨ迴ｾ**: 螢ｲ荳企ｫ假ｼ懃ｷ上さ繧ｹ繝医・蝣ｴ蜷医∝承蛛ｴ縺ｮ繧ｳ繧ｹ繝医お繝ｪ繧｢縺悟｣ｲ荳企ｫ倥ｒ雜・∴縺ｦ荳九↓縲後・縺ｿ蜃ｺ繧九崎｡ｨ迴ｾ繧貞ｮ溯｣・
  - 襍､蟄励・縲悟ｷｦ縺ｮ螢ｲ荳翫↓蟇ｾ縺励※蜿ｳ縺ｮ繧ｳ繧ｹ繝医′螟ｧ縺阪＞ = 荳九↓縺ｯ縺ｿ蜃ｺ繧九咲憾諷・
  - `negative-bar`繝｢繝ｼ繝・ 謳榊､ｱ繝悶Ο繝・け縺後げ繝ｩ繝穂ｸ狗ｫｯ縺九ｉ遯√″蜃ｺ繧・
  - 譁懃ｷ壹ヱ繧ｿ繝ｼ繝ｳ縺ｧ縲後・縺ｿ蜃ｺ縺励阪ｒ隕冶ｦ夂噪縺ｫ蠑ｷ隱ｿ

### Changed

- TreemapRenderer: Improved loss block rendering with height extension support
- TreemapLayoutEngine: Better calculation of loss block positioning (y >= 1.0 for loss)
- Demo page updated to v0.3.2 with improved loss visualization

## [0.3.1] - 2025-12-24

### Added

#### Documentation (English/Japanese Bilingual)

- **README.md completely rewritten**: Bilingual documentation (English/Japanese)
  - Clear separation with language anchors (#english, #譌･譛ｬ隱・
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

#### @bobeec/contribution-margin-chart v0.3.0

- **BEP Line disabled by default**: Treemap蠖｢蠑上〒縺ｯBEP邵ｦ邱壹ｒ繝・ヵ繧ｩ繝ｫ繝医〒髱櫁｡ｨ遉ｺ縺ｫ螟画峩
  - `showBEPLine: false` 縺後ョ繝輔か繝ｫ繝亥､縺ｫ
  - 蠢・ｦ√↑蝣ｴ蜷医・ `showBEPLine: true` 縺ｧ譏守､ｺ逧・↓譛牙柑蛹門庄閭ｽ

- **Demo page completely redesigned**: 繝・Δ繝壹・繧ｸ繧貞､ｧ蟷・↓諡｡蜈・
  - 蝓ｺ譛ｬ逧・↑菴ｿ縺・婿縺ｮ繧ｵ繝ｳ繝励Ν
  - 繧､繝ｳ繧ｿ繝ｩ繧ｯ繝・ぅ繝悶↑繝・Δ・亥､縺ｮ蜍慕噪螟画峩・・
  - 鮟貞ｭ励ヱ繧ｿ繝ｼ繝ｳ縺ｮ繧ｵ繝ｳ繝励Ν・磯ｫ伜庶逶翫・讓呎ｺ厄ｼ・
  - 襍､蟄励ヱ繧ｿ繝ｼ繝ｳ縺ｮ繧ｵ繝ｳ繝励Ν・郁ｻｽ蠎ｦ繝ｻ驥榊ｺｦ・・
  - 隍・焚譛滄俣豈碑ｼ・・繧ｵ繝ｳ繝励Ν
  - 繧ｫ繝ｩ繝ｼ繧ｹ繧ｭ繝ｼ繝縺ｮ繧ｵ繝ｳ繝励Ν・医ョ繝輔か繝ｫ繝医・繝代せ繝・Ν繝ｻ繝｢繝弱け繝ｭ繝ｼ繝・・
  - API繝ｪ繝輔ぃ繝ｬ繝ｳ繧ｹ縺ｨ繧ｳ繝ｼ繝我ｾ・

### Removed

- **Trademark notice simplified**: STRACﾂｮ蝠・ｨ呎ｳｨ險倥ｒ邁｡逡･蛹・
  - 縲梧悽繝ｩ繧､繝悶Λ繝ｪ縺ｯ荳闊ｬ逧・↑CVP蛻・梵縺ｮ螳溯｣・〒縺吶阪・縺ｿ繧定｡ｨ遉ｺ
  - 隨ｬ荳芽・膚讓吶∈縺ｮ險蜿翫ｒ蜑企勁

## [0.2.0] - 2025-12-23

### Added

#### @bobeec/contribution-margin-core v0.2.0

- **TreemapLayoutEngine**: New layout engine for treemap-style CVP visualization
  - Generates area-based blocks representing sales structure
  - Supports nested layout: Sales (left) 竊・Variable Costs, Contribution Margin, Fixed Costs, Profit (right)
  - Normalized coordinates (0-1) for flexible rendering
  - BEP line annotation support

- **TreemapBlock type**: New data structure for treemap visualization
  - Position (x, y), dimensions (width, height)
  - Color, text color, border styling
  - Value and percentage information

#### @bobeec/contribution-margin-chart v0.2.0

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

#### @bobeec/contribution-margin-core v0.1.0

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

#### @bobeec/contribution-margin-chart v0.1.0

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
- Chart library agnostic core (`@bobeec/contribution-margin-core`)
- Chart.js plugin (`@bobeec/contribution-margin-chart`)
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

[Unreleased]: https://github.com/bobeec/contribution-margin-chart/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/bobeec/contribution-margin-chart/releases/tag/v0.4.0
[0.3.2]: https://github.com/bobeec/contribution-margin-chart/releases/tag/v0.3.2
[0.3.1]: https://github.com/bobeec/contribution-margin-chart/releases/tag/v0.3.1
[0.3.0]: https://github.com/bobeec/contribution-margin-chart/releases/tag/v0.3.0
[0.2.0]: https://github.com/bobeec/contribution-margin-chart/releases/tag/v0.2.0
[0.1.0]: https://github.com/bobeec/contribution-margin-chart/releases/tag/v0.1.0

