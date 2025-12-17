import type { FC } from "react";
import {
  CartesianGrid, // background gridlines for easier reading
  Legend, // renders the legend describing each Line
  Line, // draws a single line series (cases/deaths)
  LineChart, // main chart container that wires axes + lines together
  ResponsiveContainer, // makes the chart adapt to parent width/height
  Tooltip, // hover tooltip showing values for the hovered x-position
  XAxis, // horizontal axis for dates
  YAxis, // vertical axis for numeric values
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
  // DEBUG: log a small slice and total length every render to trace inputs.
  if (import.meta.env?.DEV) {
    console.debug("[CovidChart] sample", data.slice(0, 5), "len", data.length);
  }

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>{error}</div>;
  if (!data || data.length === 0) return <div>Ничего не найдено</div>;

  // Show roughly up to ~8 ticks to avoid label clutter.
  const tickInterval = Math.max(0, Math.ceil(data.length / 8) - 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          interval={tickInterval}
          // Reduce tick density + format as YYYY-MM + rotate slightly so date labels don't overlap.
          tickFormatter={(value) => {
            const raw =
              typeof value === "string"
                ? value
                : value instanceof Date
                  ? value.toISOString().slice(0, 10)
                  : String(value);
            return raw.slice(0, 7); // YYYY-MM
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
