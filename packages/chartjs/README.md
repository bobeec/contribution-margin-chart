# @bobeec/contribution-margin-chart

Chart.js plugin for CVP (Cost-Volume-Profit) analysis charts.

## Installation

```bash
npm install @bobeec/contribution-margin-chart chart.js
```

## Usage

### Register Plugin

```typescript
import { Chart } from 'chart.js';
import { ContributionMarginPlugin } from '@bobeec/contribution-margin-chart';

Chart.register(ContributionMarginPlugin);
```

### Create Chart

```typescript
import { createCVPChartConfig } from '@bobeec/contribution-margin-chart';

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

const chart = new Chart(ctx, config);
```

### Multi-Period Chart

```typescript
const config = createCVPChartConfig({
  input: [
    { label: '2025-10', sales: 10_000_000, variableCosts: 6_200_000, fixedCosts: 3_100_000 },
    { label: '2025-11', sales: 9_500_000, variableCosts: 5_800_000, fixedCosts: 3_300_000 },
    { label: '2025-12', sales: 8_000_000, variableCosts: 5_600_000, fixedCosts: 3_400_000 },
  ],
  title: 'Multi-Period CVP Analysis',
});
```

### Event Handling

```typescript
const config = createCVPChartConfig({
  input: { ... },
  events: {
    onSegmentClick: (segment, event, cvpResult) => {
      console.log('Clicked:', segment.label, segment.value);
    },
    onSegmentHover: (segment, event) => {
      if (segment) {
        console.log('Hovering:', segment.label);
      }
    },
  },
});
```

## API Reference

See the [main documentation](../../README.md) for full API reference.

## License

MIT

