# COVID-19 Statistics Dashboard

**Language / Valoda / Язык:** 🇬🇧 [English](#english) | 🇷🇺 [Русский](#russian) | 🇱🇻 [Latviešu](#latviesu)

## English

### Overview

React + TypeScript + Vite dashboard for global COVID-19 stats from the European Centre for Disease Prevention and Control (ECDC). Filter by period and metrics, switch between a sortable table and a time-series chart, and compare countries at a glance.

### Screenshots

- Table view  
  ![Table view](./docs/table.png)
- Chart view  
  ![Chart view](./docs/chart.png)

### GIF

- Table gif  
  ![Table gif](./docs/table.gif)
- Chart gif  
  ![Chart gif](./docs/chart.gif)

### Features

- Date range filter (auto-bounded by min/max from API) drives both table aggregation and chart series.
- Country search plus numeric range filters for `cases`, `deaths`, `casesPer1000`, and `deathsPer1000`.
- View switcher: Table or Chart; reset button to clear all filters in one click.
- Table: per-country aggregation, sorting, pagination, totals (period and all time), per-1k rates, avg/max per day metrics.
- Chart: responsive Recharts line chart of daily cases and deaths with optional country selector (all countries or one).

### Metrics and Aggregations

- `casesPer1000` / `deathsPer1000`: total cases/deaths for the selected date range divided by population and multiplied by 1,000 (population from API payload).
- Avg per day: sum of cases/deaths in the selected range divided by the number of days in range.
- Max per day: maximum single-day cases/deaths within the selected range.
- "All time" columns: totals across the full dataset, independent of the selected date range.

### How to Use

- Dates default to the API min/max; changing either instantly updates table and chart.
- Table defaults: countries sorted A→Z; page size 20 rows (configurable in UI if exposed).
- Reset filters returns dates, country search, and numeric ranges to defaults.
- View toggle switches Table <-> Chart; both honor the active date range.
- Chart country selector: empty = aggregated across all countries; pick a country to view only its series.

### Quickstart

- Requirements: Node.js 18+, modern Chrome/Firefox/Edge.
- Install deps: `npm install`
- Dev server: `npm run dev` (Vite default at http://localhost:5173)
- Production build: `npm run build`
- Preview production build locally: `npm run preview`
- Lint: `npm run lint`

### Tech Stack

- React 19, TypeScript, Vite
- Recharts for charts
- Bootstrap 5 for layout/styling

### Data Source and Refresh

- Endpoint: `https://opendata.ecdc.europa.eu/covid19/casedistribution/json/`
- Data is fetched live on app start; no local snapshots or caching.
- If the API shape or URL changes, update `src/services/covidApi.ts`, adjust types in `src/types`, and align the proxy in `vite.config.ts` if needed.

### API Proxy (Dev)

- Dev proxy: `/api/ecdc` -> `https://opendata.ecdc.europa.eu` (see `vite.config.ts`), matching fetch path `/api/ecdc/covid19/casedistribution/json/` in `src/services/covidApi.ts`.
- Production: either call the upstream URL directly or serve behind a reverse proxy that rewrites `/api/ecdc/*` to the upstream to avoid CORS.
- If you change the proxy path, keep `vite.config.ts` and `src/services/covidApi.ts` in sync.

### Project Structure

- `src/components` - UI pieces (filters, table, chart, view tabs, shared states)
- `src/components/CovidTable` - table view and pagination
- `src/components/CovidChart` - time-series chart and country selector
- `src/components/FiltersBar` - date range, country search, numeric range filters, reset
- `src/services` - API layer (ECDC fetch)
- `src/utils` - aggregation, date, and series helpers
- `src/types` - TypeScript models for API and derived data
- `/public` - static assets

### Key Files

- `src/App.tsx` - top-level page: fetches data, manages filters, toggles views
- `src/services/covidApi.ts` - fetches the ECDC dataset via the dev proxy
- `src/utils/aggregate.ts` - builds per-country aggregates with filters
- `src/utils/series.ts` - builds time-series data for the chart
- `src/types` - shared shapes for API records and derived data
- `vite.config.ts` - Vite config with the `/api/ecdc` dev proxy

### Limitations

- No offline mode; depends on live ECDC availability.
- No persistence beyond in-memory state during a session.
- Styling is Bootstrap-based, not a bespoke design system.

### Troubleshooting

- CORS when calling the API directly: use the dev proxy (`npm run dev`) or a proxy in production.
- Install issues: remove `node_modules`, run `npm cache clean --force`, then `npm install`.
- Data stops loading: verify the ECDC URL and update fetch URL/proxy/types if the upstream API changed.

---

<a id="russian"></a>

## Русский

### Обзор

Приложение на React + TypeScript + Vite для визуализации COVID-19 статистики от Европейского центра профилактики и контроля заболеваний (ECDC). Загружает данные онлайн, позволяет фильтровать по периоду и метрикам, переключаться между сортируемой таблицей и графиком, сравнивать страны.

### Скриншоты

- Таблица  
  ![Table view](./docs/table.png)
- График  
  ![Chart view](./docs/chart.png)

### GIF

- Таблица  
  ![Table gif](./docs/table.gif)
- График  
  ![Chart gif](./docs/chart.gif)

### Возможности

- Фильтр диапазона дат (границы берутся из min/max API) — влияет на таблицу и график.
- Поиск по стране и числовые фильтры для `cases`, `deaths`, `casesPer1000`, `deathsPer1000`.
- Переключатель вида: Таблица или График; кнопка сброса фильтров.
- Таблица: агрегирование по странам, сортировка, пагинация, итоги (за период и за всё время), показатели на 1k, средние/максимумы в день.
- График: адаптивный Recharts line chart по ежедневным случаям и смертям, с выбором страны (все или одна).

### Метрики и агрегирование

- `casesPer1000` / `deathsPer1000`: сумма случаев/смертей за выбранный период / население \* 1 000 (население из API).
- Среднее в день: сумма случаев/смертей за период / число дней в периоде.
- Максимум в день: максимальное дневное значение в выбранном диапазоне.
- Колонки «Всего»: итоги по всему набору данных, не зависят от выбранного периода.

### Как пользоваться

- По умолчанию даты = min/max из API; изменение сразу обновляет таблицу и график.
- Таблица по умолчанию: страны отсортированы A→Z; размер страницы 20 строк (если UI позволяет, можно менять).
- Сброс фильтров возвращает даты, поиск и числовые диапазоны к дефолту.
- Переключатель вида: Таблица <-> График; оба используют активный диапазон дат.
- Выбор страны на графике: пусто = данные по всем странам; выбранная страна = только её серия.

### Быстрый старт

- Требования: Node.js 18+, современные Chrome/Firefox/Edge.
- Установка: `npm install`
- Dev-сервер: `npm run dev` (Vite по умолчанию http://localhost:5173)
- Прод-сборка: `npm run build`
- Предпросмотр прод-сборки локально: `npm run preview`
- Линт: `npm run lint`

### Стек

- React 19, TypeScript, Vite
- Recharts для графиков
- Bootstrap 5 для сетки и стилей

### Источник данных и обновление

- API: `https://opendata.ecdc.europa.eu/covid19/casedistribution/json/`
- Данные грузятся на старте, кеша нет.
- Если меняется схема/URL API, обновите `src/services/covidApi.ts`, типы в `src/types` и dev-прокси в `vite.config.ts`.

### Прокси (dev)

- Dev-прокси: `/api/ecdc` -> `https://opendata.ecdc.europa.eu` (`vite.config.ts`), fetch путь `/api/ecdc/covid19/casedistribution/json/` (`src/services/covidApi.ts`).
- Прод: либо обращаться напрямую к upstream, либо ставить reverse proxy, переписывающий `/api/ecdc/*`, иначе будет CORS.
- Если меняете путь, синхронизируйте `vite.config.ts` и `src/services/covidApi.ts`.

### Структура проекта

- `src/components` — UI блоки (фильтры, таблица, график, переключатель видов, общее состояние)
- `src/components/CovidTable` — таблица и пагинация
- `src/components/CovidChart` — график и селектор страны
- `src/components/FiltersBar` — даты, поиск по стране, числовые фильтры, сброс
- `src/services` — слой API (fetch ECDC)
- `src/utils` — агрегации, даты, подготовка серий
- `src/types` — модели API и производных данных
- `/public` — статические ресурсы

### Ограничения

- Нет офлайн-режима; зависимость от доступности ECDC.
- Нет сохранения данных между сессиями (только in-memory).
- Стили на базе Bootstrap, не кастомный дизайн-систем.

### Решение проблем

- CORS: в dev используйте прокси (`npm run dev`) или настройте свой прокси в проде.
- Проблемы установки: удалите `node_modules`, `npm cache clean --force`, затем `npm install`.
- Данные не грузятся: проверьте URL ECDC, актуализируйте fetch/proxy/типы при изменениях upstream.

---

<a id="latviesu"></a>

## Latviešu

### Pārskats

React + TypeScript + Vite lietotne COVID-19 datu vizualizācijai no Eiropas Slimību profilakses un kontroles centra (ECDC). Ielādē datus reāllaikā, ļauj filtrēt periodu un rādītājus, pārslēgties starp sakārtojamu tabulu un laika rindas grafiku.

### Ekrānuzņēmumi

- Tabulas skats  
  ![Tabulas skats](./docs/table.png)
- Grafika skats  
  ![Grafika skats](./docs/chart.png)

### GIF

- Tabulas GIF  
  ![Tabulas GIF](./docs/table.gif)
- Grafika GIF  
  ![Grafika GIF](./docs/chart.gif)

### Funkcionalitāte

- Datumu diapazona filtrs (automātiski robežots ar API min/max), kas ietekmē tabulas agregāciju un grafika sērijas.
- Valstu meklēšana un skaitliskie filtri (`cases`, `deaths`, `casesPer1000`, `deathsPer1000`).
- Skata pārslēgšana: Tabula vai Grafiks; poga, lai atiestatītu visus filtrus.
- Tabula: agregācija pa valstīm, šķirošana, lapošana, kopsummas (perioda un visu laiku), rādītāji uz 1k, vidējais/maksimālais dienā.
- Grafiks: Recharts līniju grafiks ar dienas gadījumiem/nāves gadījumiem, izvēles valsts selektors (visas valstis vai viena).

### Metrikas un agregācija

- `casesPer1000` / `deathsPer1000`: perioda gadījumi/nāves dalīti ar populāciju un reizināti ar 1 000 (populācija no API).
- Vidēji dienā: perioda summa dalīta ar dienu skaitu.
- Maksimums dienā: lielākā vienas dienas vērtība periodā.
- Kolonnas "Kopējais": kopsummas pa visu datu kopu, neatkarīgas no izvēlētā datumu diapazona.

### Kā lietot

- Noklusējuma datumi ir API min/max; maiņa uzreiz atjaunina tabulu un grafiku.
- Tabulas noklusējumi: valstis kārtotas A→Z; lapas izmērs 20 rindas (ja UI ļauj, var mainīt).
- "Reset" poga atgriež datumus, valsts meklēšanu un skaitliskos filtrus noklusējumā.
- Skata pārslēgs: Tabula <-> Grafiks; abi izmanto aktīvo datumu diapazonu.
- Valsts izvēle grafikā: tukšs = agregēti visi dati; izvēlēta valsts = tikai tās sērija.

### Ātrais starts

- Prasības: Node.js 18+, mūsdienu Chrome/Firefox/Edge.
- Instalēt atkarības: `npm install`
- Dev serveris: `npm run dev` (Vite pēc noklusējuma http://localhost:5173)
- Produkcijas būve: `npm run build`
- Produkcijas priekšskatījums lokāli: `npm run preview`
- Linters: `npm run lint`

### Datu avots un atjaunošana

- ECDC API: `https://opendata.ecdc.europa.eu/covid19/casedistribution/json/`
- Dati tiek ielādēti palaišanas brīdī; nav lokālu kešu vai momentuzņēmumu.
- Ja mainās API shēma/URL, jāatjaunina `src/services/covidApi.ts`, tipizācija `src/types` un dev starpnieks `vite.config.ts`.

### Starpnieks (dev)

- Dev starpnieks: `/api/ecdc` -> `https://opendata.ecdc.europa.eu` (`vite.config.ts`), fetch ceļš `/api/ecdc/covid19/casedistribution/json/` (`src/services/covidApi.ts`).
- Produkcija: zvaniet tieši uz augšupstraumi vai izmantojiet reverse proxy, kas pārraksta `/api/ecdc/*`, lai izvairītos no CORS.
- Ja maināt ceļu, saskaņojiet `vite.config.ts` un `src/services/covidApi.ts`.

### Projekta struktūra

- `src/components` - UI bloki (filtri, tabula, grafiks, skata pārslēgs, koplietojamie stāvokļi)
- `src/components/CovidTable` - tabulas skats un lapošana
- `src/components/CovidChart` - laika rindas grafiks un valsts selektors
- `src/components/FiltersBar` - datumu diapazons, valsts meklēšana, skaitliskie filtri, reset
- `src/services` - API kārta (ECDC fetch)
- `src/utils` - agregācija, datumi, sēriju palīgfunkcijas
- `src/types` - TypeScript modeļi API un atvasinātajiem datiem
- `/public` - statiskie resursi

### Ierobežojumi

- Nav offline režīma; atkarīgs no ECDC pieejamības.
- Nav datu persistences ārpus sesijas.
- Dizains balstās uz Bootstrap; nav unikālas dizaina sistēmas.

### Problēmu novēršana

- CORS: devā lietojiet proxy (`npm run dev`) vai producijā savu reverse proxy.
- Instalācijas problēmas: izdzēsiet `node_modules`, `npm cache clean --force`, pēc tam `npm install`.
- Ja dati vairs neielādējas: pārbaudiet ECDC URL un saskaņojiet fetch/proxy/tipizāciju, ja upstream ir mainījies.
