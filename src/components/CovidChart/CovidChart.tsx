import type { FC } from "react";
import {
  CartesianGrid, // Background gridlines for easier reading.
  Legend, // Renders the legend describing each Line.
  Line, // Draws a single line series (cases/deaths).
  LineChart, // Main chart container that wires axes and lines together.
  ResponsiveContainer, // Makes the chart adapt to parent width and height.
  Tooltip, // Hover tooltip showing values for the hovered x-position.
  XAxis, // Horizontal axis for dates.
  YAxis, // Vertical axis for numeric values.
} from "recharts";
import type { ChartPoint } from "../../types/chart";

type CovidChartProps = {
  data: ChartPoint[];
  loading?: boolean;
  error?: string | null;
  height?: number;
};

const CovidChart: FC<CovidChartProps> = ({
  data,
  loading,
  error,
  height = 400,
}) => {
  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>{error}</div>;
  if (!data || data.length === 0) return <div>Nothing found</div>;

  // Show roughly up to eight ticks to avoid label clutter.
  const tickInterval = Math.max(0, Math.ceil(data.length / 8) - 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          interval={tickInterval}
          // Reduce tick density, format as YYYY-MM, and rotate slightly so date labels do not overlap.
          tickFormatter={(value) => {
            const raw =
              typeof value === "string"
                ? value
                : value instanceof Date
                  ? value.toISOString().slice(0, 10)
                  : String(value);
            return raw.slice(0, 7); // YYYY-MM.
          }}
          angle={-45}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 12 }}
          tickMargin={8}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="cases"
          name="Cases"
          stroke="#3182ce"
          dot={false}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="deaths"
          name="Deaths"
          stroke="#e53e3e"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CovidChart;
