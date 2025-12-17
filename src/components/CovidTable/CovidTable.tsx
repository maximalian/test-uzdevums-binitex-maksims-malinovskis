import type { FC } from "react";
import { useState } from "react";
import type { CountryRow } from "../../types/stats";

// Props: aggregated country rows that will be shown inside the table
type CovidTableProps = {
  data?: CountryRow[];
};

// Simple client-side pagination: show 20 rows per page by default
const ROWS_PER_PAGE = 20;

const CovidTable: FC<CovidTableProps> = ({ data }) => {
  // Sorting state: which column is active and whether it is ascending or descending
  const [sortField, setSortField] = useState<keyof CountryRow>("country");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  // Pagination state: current page index (0-based)
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Normalize data: keep hooks unconditional, use an empty array when data is missing
  const rows = data ?? [];

  // Rendering fallback when there are no rows to display
  if (rows.length === 0) {
    // Bootstrap alert keeps the empty state visually consistent inside a card.
    return (
      <div className="alert alert-warning mb-0" role="alert">
        No data available
      </div>
    );
  }

  // Handle clicks on table headers to toggle sort column/direction without mutating props
  const handleHeaderClick = (field: keyof CountryRow) => {
    // Clicking the same column toggles direction; a new column resets to ascending
    if (field === sortField) {
      setSortDirection((prevDirection) => (prevDirection === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Copy the input array to avoid mutating props, then sort based on active column and direction
  const sortedData = [...rows].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    // String columns use localeCompare; numeric columns use arithmetic difference
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

  // Pagination: compute slice boundaries and render only the visible portion
  const totalPages = Math.max(1, Math.ceil(sortedData.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages - 1);
  const startIndex = safePage * ROWS_PER_PAGE;
  // Use slice to create a view of the current page without mutating the sorted array
  const visibleRows = sortedData.slice(startIndex, startIndex + ROWS_PER_PAGE);

  // Navigation handlers with bounds checking to prevent going out of range
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const stickyThClass = "position-sticky top-0 bg-light";

  return (
    <>
      {/* `table-responsive` adds horizontal scroll on small screens so columns don't squish into unreadable layout. */}
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
                Страна {sortField === "country" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                scope="col"
                className={`${stickyThClass} text-end text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("casesInPeriod")}
              >
                {/* WHY `text-end`: numbers align by digits and are easier to scan vertically. */}
                Cases (за период){" "}
                {sortField === "casesInPeriod" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                scope="col"
                className={`${stickyThClass} text-end text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("deathsInPeriod")}
              >
                Deaths (за период){" "}
                {sortField === "deathsInPeriod" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                scope="col"
                className={`${stickyThClass} text-end text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("casesTotalAllTime")}
              >
                Cases Total (всё время){" "}
                {sortField === "casesTotalAllTime" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                scope="col"
                className={`${stickyThClass} text-end text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("deathsTotalAllTime")}
              >
                Deaths Total (всё время){" "}
                {sortField === "deathsTotalAllTime"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                scope="col"
                className={`${stickyThClass} text-end text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("casesPer1000")}
              >
                Cases per 1000{" "}
                {sortField === "casesPer1000" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                scope="col"
                className={`${stickyThClass} text-end text-nowrap`}
                style={{ zIndex: 1 }}
                onClick={() => handleHeaderClick("deathsPer1000")}
              >
                Deaths per 1000{" "}
                {sortField === "deathsPer1000" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.country}>
                <td className="text-start">{row.country}</td>
                <td className="text-end">{row.casesInPeriod.toLocaleString("en-US")}</td>
                <td className="text-end">{row.deathsInPeriod.toLocaleString("en-US")}</td>
                <td className="text-end">{row.casesTotalAllTime.toLocaleString("en-US")}</td>
                <td className="text-end">{row.deathsTotalAllTime.toLocaleString("en-US")}</td>
                <td className="text-end">{row.casesPer1000.toFixed(2)}</td>
                <td className="text-end">{row.deathsPer1000.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls: keep them compact and aligned to the right. */}
      <div className="d-flex align-items-center justify-content-end gap-2 mt-3">
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
    </>
  );
};

export default CovidTable;
