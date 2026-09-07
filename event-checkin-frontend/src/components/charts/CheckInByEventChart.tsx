import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import type { CheckInByEvent } from '../../features/dashboard/types/dashboard.types';

interface Props {
  data: CheckInByEvent[];
}

function shortenTitle(
  title: string,
  maxLength = 18,
) {
  if (title.length <= maxLength) {
    return title;
  }

  return `${title.slice(0, maxLength)}...`;
}

export default function CheckInByEventChart({
  data,
}: Props) {
  const chartData = [...data]
    .map((item) => ({
      ...item,
      totalCheckIn: Number(
        item.totalCheckIn,
      ),
    }))
    .sort(
      (a, b) =>
        b.totalCheckIn -
        a.totalCheckIn,
    )
    .slice(0, 8)
    .map((item) => ({
      ...item,
      shortTitle: shortenTitle(
        item.title,
      ),
    }));

  if (!chartData.length) {
    return (
      <div
        style={{
          height: 330,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8c8c8c',
          fontSize: 14,
        }}
      >
        No event check-in data available
      </div>
    );
  }

  return (
    <ResponsiveContainer
      width="100%"
      height={330}
    >
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 20,
          left: 0,
          bottom: 20,
        }}
      >
        <CartesianGrid
          strokeDasharray="4 4"
          vertical={false}
        />

        <XAxis
          dataKey="shortTitle"
          interval={0}
          tick={{
            fontSize: 11,
          }}
          tickLine={false}
          axisLine={false}
        />

        <YAxis
          allowDecimals={false}
          tick={{
            fontSize: 12,
          }}
          tickLine={false}
          axisLine={false}
          width={30}
        />

        <Tooltip
          formatter={(value) => [
            Number(value),
            'Participants',
          ]}
          labelFormatter={(_, payload) => {
            const event =
              payload?.[0]?.payload;

            return event?.title ?? '';
          }}
        />

        <Bar
          dataKey="totalCheckIn"
          name="Participants"
          fill="#1677ff"
          radius={[
            6,
            6,
            0,
            0,
          ]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}