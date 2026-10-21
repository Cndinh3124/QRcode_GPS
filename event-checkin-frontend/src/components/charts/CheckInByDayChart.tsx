import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import type { CheckInByDay } from '../../features/dashboard/types/dashboard.types';

interface Props {
  data: CheckInByDay[];
}

function formatDate(value: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
}

export default function CheckInByDayChart({
  data,
}: Props) {
  const chartData = [...data]
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime(),
    )
    .slice(-7)
    .map((item) => ({
      ...item,
      label: formatDate(item.date),
      total: Number(item.total),
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
        No check-in data available
      </div>
    );
  }

  return (
    <ResponsiveContainer
      width="100%"
      height={330}
    >
      <LineChart
        data={chartData}
        margin={{
          top: 20,
          right: 20,
          left: 0,
          bottom: 10,
        }}
      >
        <CartesianGrid
          strokeDasharray="4 4"
          vertical={false}
        />

        <XAxis
          dataKey="label"
          tick={{
            fontSize: 12,
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
            'Lượt điểm danh',
          ]}
          labelFormatter={(label) =>
            `Date: ${label}`
          }
        />

        <Line
          type="monotone"
          dataKey="total"
          name="Lượt điểm danh"
          stroke="#1677ff"
          strokeWidth={3}
          dot={{
            r: 4,
            strokeWidth: 2,
            fill: '#fff',
          }}
          activeDot={{
            r: 6,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}