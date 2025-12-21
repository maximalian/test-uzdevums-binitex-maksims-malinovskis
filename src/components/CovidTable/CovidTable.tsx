import type { ChangeEvent, FC } from "react";
import { useState } from "react";
import type { CountryRow } from "../../types/stats";

// Props: aggregated country rows that will be shown inside the table.
type CovidTableProps = {
  data?: CountryRow[];
};

type PageSize = 10 | 20 | 50;
const PAGE_SIZE_OPTIONS: readonly PageSize[] = [10, 20, 50];

const CovidTable: FC<CovidTableProps> = ({ data }) => {
  // Sorting state tracks which column is active and whether it is ascending or descending.
  const [sortField, setSortField] = useState<keyof CountryRow>("country");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  // Pagination state tracks the current page index (0-based).
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<PageSize>(20);

  // Normalize data: keep hooks unconditional and use an empty array when data is missing.
  const rows = data ?? [];

  // Rendering fallback when there are no rows to display.
  if (rows.length === 0) {
    // Bootstrap alert keeps the empty state visually consistent inside a card.
    return (
      <div className="alert alert-warning mb-0" role="alert">
        No data available
      </div>
    );
  }

  // Handle clicks on table headers to toggle sort column and direction without mutating props.
  const handleHeaderClick = (field: keyof CountryRow) => {
    // Clicking the same column toggles direction; a new column resets to ascending.
    if (field === sortField) {
      setSortDirection((prevDirection) => (prevDirection === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextSize = Number(event.target.value) as PageSize;
    setPageSize(nextSize);
    // Changing page size can change the total page count; resetting prevents landing on an out-of-range page.
    setCurrentPage(0);
  };

  // Copy the input array to avoid mutating props, then sort based on active column and direction.
  const sortedData = [...rows].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    // String columns use localeCompare; numeric columns use arithmetic difference.
    if (typeof aValue === "string" && typeof bValue === "string") {
      const result = aValue.localeCompare(bValue);
      return sortDirection === "asc" ? result : -result;
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      const result = aValue - bValue;
      return sortDirection === "asc" ? result : -result;
    }

    return 0;
  });

  // Visual-only helper: show aligned sort arrows; sorting logic and state stay untouched.
  const renderSortIndicator = (field: keyof CountryRow) => {
    if (sortField !== field) {
      return <span className="small" aria-hidden="true" style={{ minWidth: "1em" }} />;
    }

    return (
      <span className="small" aria-hidden="true" style={{ minWidth: "1em" }}>
        {sortDirection === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  // Pagination: compute slice boundaries and render only the visible portion.
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages - 1);
  const startIndex = safePage * pageSize;
  // Use slice to create a view of the current page without mutating the sorted array.
  const visibleRows = sortedData.slice(startIndex, startIndex + pageSize);

  // Navigation handlers add bounds checking to prevent going out of range.
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const stickyThClass = "position-sticky top-0 bg-light";

  return (
    <>
      {/* `table-responsive` adds horizontal scroll on small screens so columns do not collapse into an unreadable layout. */}
      <div className="table-responsive">
        <table className="table table-striped table-hover table-sm mb-0">
          {/* `table-light` makes the header more readable against striped rows. */}
          <thead className="table-light">
            <tr>
              <th
                scope="col"
                className={`${stickyThClass} text-start text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("country")}
              >
                <span className="d-inline-flex align-items-center gap-1">
                  <span>Country</span>
                  {renderSortIndicator("country")}
                </span>
              </th>
              <th
                scope="col"
                className={`${stickyThClass} text-end text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("casesInPeriod")}
              >
                {/* WHY `text-end`: numbers align by digits and are easier to scan vertically. */}
                <span className="d-inline-flex align-items-center gap-1">
                  <span>Cases (in period)</span>
                  {renderSortIndicator("casesInPeriod")}
                </span>
              </th>
              <th
                scope="col"
                className={`${stickyThClass} text-end text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("deathsInPeriod")}
              >
                <span className="d-inline-flex align-items-center gap-1">
                  <span>Deaths (in period)</span>
                  {renderSortIndicator("deathsInPeriod")}
                </span>
              </th>
              <th
                scope="col"
                className={`${stickyThClass} text-end text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("casesTotalAllTime")}
              >
                <span className="d-inline-flex align-items-center gap-1">
                  <span>Total Cases (all time)</span>
                  {renderSortIndicator("casesTotalAllTime")}
                </span>
              </th>
              <th
                scope="col"
                className={`${stickyThClass} text-end text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("deathsTotalAllTime")}
              >
                <span className="d-inline-flex align-items-center gap-1">
                  <span>Total Deaths (all time)</span>
                  {renderSortIndicator("deathsTotalAllTime")}
                </span>
              </th>
              <th
                scope="col"
                className={`${stickyThClass} text-end text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("casesPer1000")}
              >
                <span className="d-inline-flex align-items-center gap-1">
                  <span>Cases per 1000</span>
                  {renderSortIndicator("casesPer1000")}
                </span>
              </th>
              <th
                scope="col"
                className={`${stickyThClass} text-end text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("deathsPer1000")}
              >
                <span className="d-inline-flex align-items-center gap-1">
                  <span>Deaths per 1000</span>
                  {renderSortIndicator("deathsPer1000")}
                </span>
              </th>
              {/* Optional daily aggregates scoped to the selected date range. */}
              <th
                scope="col"
                className={`${stickyThClass} text-end text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("avgCasesPerDay")}
              >
                <span className="d-inline-flex align-items-center gap-1">
                  <span>Avg Cases / Day</span>
                  {renderSortIndicator("avgCasesPerDay")}
                </span>
              </th>
              <th
                scope="col"
                className={`${stickyThClass} text-end text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("avgDeathsPerDay")}
              >
                <span className="d-inline-flex align-items-center gap-1">
                  <span>Avg Deaths / Day</span>
                  {renderSortIndicator("avgDeathsPerDay")}
                </span>
              </th>
              <th
                scope="col"
                className={`${stickyThClass} text-end text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("maxCasesPerDay")}
              >
                <span className="d-inline-flex align-items-center gap-1">
                  <span>Max Cases / Day</span>
                  {renderSortIndicator("maxCasesPerDay")}
                </span>
              </th>
              <th
                scope="col"
                className={`${stickyThClass} text-end text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("maxDeathsPerDay")}
              >
                <span className="d-inline-flex align-items-center gap-1">
                  <span>Max Deaths / Day</span>
                  {renderSortIndicator("maxDeathsPerDay")}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.country}>
                <td className="text-start">{row.country.replaceAll("_", " ")}</td>
                <td className="text-end">{row.casesInPeriod.toLocaleString("en-US")}</td>
                <td className="text-end">{row.deathsInPeriod.toLocaleString("en-US")}</td>
                <td className="text-end">{row.casesTotalAllTime.toLocaleString("en-US")}</td>
                <td className="text-end">{row.deathsTotalAllTime.toLocaleString("en-US")}</td>
                <td className="text-end">{row.casesPer1000.toFixed(2)}</td>
                <td className="text-end">{row.deathsPer1000.toFixed(2)}</td>
                <td className="text-end">{row.avgCasesPerDay.toFixed(2)}</td>
                <td className="text-end">{row.avgDeathsPerDay.toFixed(2)}</td>
                <td className="text-end">{row.maxCasesPerDay.toLocaleString("en-US")}</td>
                <td className="text-end">{row.maxDeathsPerDay.toLocaleString("en-US")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls plus page size selector (both affect visibleRows). */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="covidTablePageSize" className="form-label small text-muted mb-0">
            Rows per page
          </label>
          <select
            id="covidTablePageSize"
            className="form-select form-select-sm w-auto"
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handlePrevPage}
            disabled={safePage === 0}
          >
            Previous
          </button>
          <span className="text-muted small">
            Page {safePage + 1} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleNextPage}
            disabled={safePage >= totalPages - 1}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default CovidTable;
