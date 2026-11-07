'use client';

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyData } from '@/lib/analytics/types';

interface Props {
  data: MonthlyData[];
}

function formatYen(value: number) {
  if (value >= 1_000_000) return `¥${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `¥${(value / 1_000).toFixed(0)}K`;
  return `¥${value}`;
}

function formatMonth(ym: string) {
  const [year, month] = ym.split('-');
  return `${year}年${parseInt(month)}月`;
}

export function MonthlySalesChart({ data }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    monthLabel: formatMonth(d.month),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis
          dataKey="monthLabel"
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={{ stroke: '#E2E8F0' }}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tickFormatter={formatYen}
          tick={{ fontSize: 11, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 11, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          formatter={(value, name) => {
            const v = Number(value);
            if (name === '売上') return [`¥${v.toLocaleString('ja-JP')}`, name];
            return [`${v}件`, name];
          }}
          contentStyle={{ borderRadius: 8, borderColor: '#E2E8F0', fontSize: 12 }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Bar
          yAxisId="left"
          dataKey="sales"
          name="売上"
          fill="#1B2A4A"
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="orders"
          name="注文数"
          stroke="#3B6FD4"
          strokeWidth={2}
          dot={{ r: 5, fill: '#3B6FD4', strokeWidth: 0 }}
          activeDot={{ r: 7 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
