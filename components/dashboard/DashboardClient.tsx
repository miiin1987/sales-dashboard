'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { AggregatedData } from '@/lib/analytics/types';
import { Card } from '@/components/ui/Card';
import { MetricCard } from './MetricCard';
import { MonthlySalesChart } from './MonthlySalesChart';
import { CategorySalesChart } from './CategorySalesChart';
import { TopSkuTable } from './TopSkuTable';
import { AiInsights } from './AiInsights';

function formatPeriod(start: string, end: string): string {
  const toJp = (d: string) => {
    const [y, m] = d.split('-');
    return `${y}年${parseInt(m)}月`;
  };
  if (start.slice(0, 7) === end.slice(0, 7)) return toJp(start);
  return `${toJp(start)} 〜 ${toJp(end)}`;
}

export function DashboardClient() {
  const router = useRouter();
  const [data, setData] = useState<AggregatedData | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('dashboardData');
      if (!raw) {
        router.replace('/');
        return;
      }
      setData(JSON.parse(raw) as AggregatedData);
    } catch {
      router.replace('/');
    }
  }, [router]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-sm text-gray-400">読み込み中...</div>
      </div>
    );
  }

  const { period, summary } = data;
  const fmtJpy = (n: number) => `¥${n.toLocaleString('ja-JP')}`;

  return (
    <div className="min-h-screen bg-brand-gray">
      {/* Header */}
      <header className="border-b border-brand-border bg-brand-navy px-4 py-4 shadow-sm sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-wide text-white">COSMO SALES ANALYTICS</span>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10"
          >
            新しいファイル
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {/* Period */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>対象期間:</span>
          <span className="font-medium text-brand-navy">
            {formatPeriod(period.start, period.end)}
          </span>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            label="グロス売上"
            value={fmtJpy(summary.grossSales)}
            subLabel="割引"
            sub={`−${fmtJpy(summary.discounts)}`}
          />
          <MetricCard
            label="注文件数"
            value={`${summary.orderCount.toLocaleString('ja-JP')}件`}
            subLabel="返品"
            sub={`−${fmtJpy(summary.returns)}`}
          />
          <MetricCard
            label="平均注文単価"
            value={fmtJpy(summary.aov)}
            subLabel="ネット売上"
            sub={fmtJpy(summary.netSales)}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <h2 className="mb-4 text-sm font-semibold text-brand-navy">
              月別売上推移
            </h2>
            <MonthlySalesChart data={data.monthly} />
          </Card>
          <Card className="lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold text-brand-navy">
              カテゴリ別売上
            </h2>
            <CategorySalesChart data={data.byCategory} />
          </Card>
        </div>

        {/* SKU Table */}
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-brand-navy">
            SKU別売上 TOP10
          </h2>
          <TopSkuTable data={data.topSkus} />
        </Card>

        {/* AI Insights */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-navy text-xs font-bold text-white">
              AI
            </span>
            <h2 className="text-sm font-semibold text-brand-navy">AI分析レポート</h2>
          </div>
          <AiInsights data={data} />
        </Card>
      </main>
    </div>
  );
}
