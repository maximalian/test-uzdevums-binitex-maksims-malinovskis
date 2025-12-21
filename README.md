# COVID-19 Statistics Dashboard

React + TypeScript + Vite app that visualizes global COVID-19 case data from the European Centre for Disease Prevention and Control (ECDC). It fetches the dataset at runtime, lets you filter by period and metrics, and switches between a sortable table and a time-series chart.

## Screenshots

- Table view screenshot  
  ![Table view](./docs/table.png)
- Chart view screenshot  
  ![Chart view](./docs/chart.png)

## GIF

- Table gif  
  ![Table gif](./docs/table.gif)
- Chart gif  
  ![Chart gif](./docs/chart.gif)

## Data Source / Data Refresh

- ECDC endpoint: `https://opendata.ecdc.europa.eu/covid19/casedistribution/json/`
- Data is loaded live from the API when the app starts; no local snapshots.
- No caching implemented.
- If the API shape or URL changes, update `src/services/covidApi.ts`, adjust parsing/types under `src/types`, and align the proxy in `vite.config.ts` if needed.

## Features

- Date range filter sourced from the API’s min/max bounds; drives both table aggregation and chart series.
- Country search plus numeric range filters for `cases`, `deaths`, `casesPer1000`, and `deathsPer1000`.
- View switcher between table and chart; reset button for filters.
- Table: per-country aggregation with sorting, pagination, totals (period and all time), per-1k rates, and avg/max per day metrics.
- Chart: responsive line chart (Recharts) for daily cases and deaths, with an optional country selector (all countries or a single country).

## Metrics / Aggregations

- `casesPer1000` / `deathsPer1000`: total cases/deaths for the selected date range divided by population and multiplied by 1,000 (population sourced from the API payload).
- Avg per day: sum of cases/deaths in the selected range divided by the number of days in range.
- Max per day: maximum single-day cases/deaths within the selected range.
- “Всего” columns: totals across the full dataset, independent of the currently selected date range.

## How to Use

- Dates default to the API's min/max; changing either instantly updates table and chart.
- Table defaults: countries sorted A→Z, page size set to 20 rows (configurable in UI if exposed).
- Filters reset button returns dates, country search, and numeric ranges to defaults.
- View toggle switches Table ↔ Chart; both honor the active date range.
- Chart country selector: empty = aggregated across all countries; pick a country to view only its series.

## API Proxy (Dev only)

- Dev proxy is configured: requests to `/api/ecdc` are proxied to `https://opendata.ecdc.europa.eu` (see `vite.config.ts`), matching the fetch path `/api/ecdc/covid19/casedistribution/json/` used in `src/services/covidApi.ts`.
- In production, point the fetch URL to the upstream (`https://opendata.ecdc.europa.eu/...`) or serve the app behind your own reverse proxy that rewrites `/api/ecdc/*` to the upstream; otherwise you will hit CORS.
- If you change the proxy path, adjust both `vite.config.ts` and `src/services/covidApi.ts` to keep them aligned.

## Project Structure

- `src/components` — UI components (filters, table, chart, view tabs, shared states).
- `src/components/CovidTable` — table view and pagination for aggregated country data.
- `src/components/CovidChart` — time-series chart and country selector.
- `src/components/FiltersBar` — date range, country search, numeric range filters, reset.
- `src/services` — API layer (ECDC fetch).
- `src/utils` — aggregation, date, and series helpers.
- `src/types` — TypeScript models for API and derived data.
- `/public` — static assets (e.g., App logo).

## Key Files

- `src/App.tsx` - top-level page: fetches data, manages filters, toggles table/chart views.
- `src/services/covidApi.ts` - fetches the ECDC dataset via the dev proxy path.
- `src/utils/aggregate.ts` - builds per-country aggregates used by the table, applying filters.
- `src/utils/series.ts` - builds time-series data for the chart from filtered records.
- `src/types` - shared TypeScript shapes for API records, chart points, and aggregates.
- `vite.config.ts` - Vite config with the `/api/ecdc` dev proxy.

## Requirements

- Node.js 18+
- Browsers: latest Chrome, Firefox, Edge

## Setup / Run / Build / Lint / Testing

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Limitations

- Currently no offline mode; depends on live availability of the ECDC endpoint.
- No persistence beyond the in-memory state while the app is open.
- Styling relies on Bootstrap with light customization; not a fully bespoke design system.

## Troubleshooting

- CORS errors when calling the API directly: use the dev proxy (`npm run dev`) or configure your own proxy in production.
- Package install issues: remove `node_modules`, run `npm cache clean --force`, then `npm install`.
- If data stops loading, verify the ECDC URL and update the fetch URL/proxy/types if the upstream API changed.
