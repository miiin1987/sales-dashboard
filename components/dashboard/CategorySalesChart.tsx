'use client';

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { CategoryData } from '@/lib/analytics/types';

const COLORS = ['#1B2A4A', '#2D4070', '#3B6FD4', '#5B8FD4', '#8BB5E8', '#B8D0F0'];

interface Props {
  data: CategoryData[];
}

export function CategorySalesChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={3}
          dataKey="sales"
          nameKey="category"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [
            `¥${Number(value).toLocaleString('ja-JP')}`,
            '売上',
          ]}
          contentStyle={{ borderRadius: 8, borderColor: '#E2E8F0', fontSize: 12 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 12, color: '#374151' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
