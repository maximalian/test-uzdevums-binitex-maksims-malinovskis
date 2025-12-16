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
    return <p>No data available</p>;
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

  return (
    <>
      {/* Rendering the statistics table with semantic HTML elements */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th
              style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #e2e8f0" }}
              onClick={() => handleHeaderClick("country")}
            >
              Страна{" "}
              {sortField === "country" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </th>
            <th
              style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #e2e8f0" }}
              onClick={() => handleHeaderClick("casesInPeriod")}
            >
              Cases (за период){" "}
              {sortField === "casesInPeriod" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </th>
            <th
              style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #e2e8f0" }}
              onClick={() => handleHeaderClick("deathsInPeriod")}
            >
              Deaths (за период){" "}
              {sortField === "deathsInPeriod" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </th>
            <th
              style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #e2e8f0" }}
              onClick={() => handleHeaderClick("casesTotalAllTime")}
            >
              Cases Total (всё время){" "}
              {sortField === "casesTotalAllTime" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </th>
            <th
              style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #e2e8f0" }}
              onClick={() => handleHeaderClick("deathsTotalAllTime")}
            >
              Deaths Total (всё время){" "}
              {sortField === "deathsTotalAllTime" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </th>
            <th
              style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #e2e8f0" }}
              onClick={() => handleHeaderClick("casesPer1000")}
            >
              Cases per 1000{" "}
              {sortField === "casesPer1000" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </th>
            <th
              style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #e2e8f0" }}
              onClick={() => handleHeaderClick("deathsPer1000")}
            >
              Deaths per 1000{" "}
              {sortField === "deathsPer1000" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => (
            // Table row: one country's statistics in a single <tr>
            <tr key={row.country}>
              <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>{row.country}</td>
              <td
                style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #e2e8f0" }}
              >
                {row.casesInPeriod.toLocaleString("en-US")}
              </td>
              <td
                style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #e2e8f0" }}
              >
                {row.deathsInPeriod.toLocaleString("en-US")}
              </td>
              <td
                style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #e2e8f0" }}
              >
                {row.casesTotalAllTime.toLocaleString("en-US")}
              </td>
              <td
                style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #e2e8f0" }}
              >
                {row.deathsTotalAllTime.toLocaleString("en-US")}
              </td>
              <td
                style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #e2e8f0" }}
              >
                {row.casesPer1000.toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </td>
              <td
                style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #e2e8f0" }}
              >
                {row.deathsPer1000.toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls: show current page and navigate with bounds checking */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          justifyContent: "flex-end",
          marginTop: "12px",
        }}
      >
        <button type="button" onClick={handlePrevPage} disabled={safePage === 0}>
          Previous
        </button>
        <span>
          Page {safePage + 1} of {totalPages}
        </span>
        <button
          type="button"
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
