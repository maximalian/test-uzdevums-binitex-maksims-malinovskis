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
  const tickInterval = Math.max(0, Math.floor(data.length / 8));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          interval={tickInterval}
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
