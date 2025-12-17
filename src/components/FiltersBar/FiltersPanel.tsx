import type { ReactNode } from "react";

type FiltersPanelProps = {
  title?: string;
  children: ReactNode;
};

export default function FiltersPanel({ title = "Filters", children }: FiltersPanelProps) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        {/* WHY: reusable wrapper to keep a single consistent Bootstrap look for all filter blocks. */}
        <div className="mb-3">
          <h5 className="card-title mb-1">{title}</h5>
          {/* OPTIONAL: small hint text under the title for better UX context. */}
          <small className="text-muted">Adjust filters to narrow down results</small>
        </div>

        <div className="d-flex flex-wrap gap-3 align-items-end">{children}</div>
      </div>
    </div>
  );
}

