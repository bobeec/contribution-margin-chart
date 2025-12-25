# @bobeec/contribution-margin-core

Core calculation and layout engine for CVP (Cost-Volume-Profit) analysis charts.

## Installation

```bash
npm install @bobeec/contribution-margin-core
```

## Usage

### Basic Calculation

```typescript
import { CVPCalculator, calculateCVP } from '@bobeec/contribution-margin-core';

// Using convenience function
const result = calculateCVP({
  sales: 10_000_000,
  variableCosts: 6_200_000,
  fixedCosts: 3_100_000,
});

console.log(result.calculated.contributionMargin);    // 3,800,000
console.log(result.calculated.breakEvenPoint);        // 8,157,894.74
console.log(result.calculated.operatingProfit);       // 700,000

// Using class instance
const calculator = new CVPCalculator();
const calculated = calculator.calculate(input);
```

### Validation

```typescript
import { CVPValidator, validateCVP } from '@bobeec/contribution-margin-core';

const validation = validateCVP({
  sales: 10_000_000,
  variableCosts: 12_000_000, // Warning: exceeds sales
  fixedCosts: 3_000_000,
});

if (validation.warnings.length > 0) {
  console.warn('Warnings:', validation.warnings);
}
```

### Layout Generation

```typescript
import { LayoutEngine, generateLayout } from '@bobeec/contribution-margin-core';

const layout = generateLayout(input, {
  showBEPLine: true,
  lossDisplayMode: 'negative-bar',
  colorScheme: 'default',
});

console.log(layout.segments);     // Chart segments
console.log(layout.annotations);  // BEP lines, etc.
```

### Value Formatting

```typescript
import { ValueFormatter, formatValue } from '@bobeec/contribution-margin-core';

const formatter = new ValueFormatter({
  unitMode: 'thousand',
  locale: 'ja-JP',
  currencySymbol: '¥',
});

console.log(formatter.format(10_000_000));       // "¥10,000十E�E"
console.log(formatter.formatPercentage(0.38));   // "38.0%"
```

## API Reference

See the [main documentation](../../README.md) for full API reference.

## License

MIT

