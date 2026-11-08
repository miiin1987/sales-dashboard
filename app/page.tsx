import Link from 'next/link';
import { CsvUploader } from '@/components/upload/CsvUploader';
import { DemoBanner } from '@/components/ui/DemoBanner';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function UploadPage() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-gray">
      {/* Header */}
      <header className="border-b border-brand-border bg-brand-navy px-4 py-4 shadow-sm sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide text-white">COSMO SALES ANALYTICS</span>
        </div>
      </header>

      {isDemoMode && <DemoBanner />}

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">
            売上分析ダッシュボード
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            ShopifyのCSVをアップロードすると、月次売上レポートをAIが自動生成します
          </p>
        </div>

        {isDemoMode ? (
          <div className="w-full max-w-xl space-y-6">
            {/* Demo info */}
            <div className="rounded-xl border border-brand-border bg-white p-6 shadow-sm text-center space-y-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-brand-gray mx-auto">
                <svg className="h-6 w-6 text-brand-navy opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-brand-navy">デモデータを使用</p>
                <p className="mt-1 text-sm text-gray-500">
                  架空ストア「COSMO STYLE」の2025年8〜10月データ（76件・¥830,500）
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-brand-navy px-6 py-3 text-sm font-medium text-white hover:bg-brand-navy-light transition-colors"
              >
                ダッシュボードを見る →
              </Link>
            </div>

            {/* Feature description */}
            <div className="rounded-lg bg-white border border-brand-border p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">機能概要</p>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  'ShopifyエクスポートCSVのドラッグ&ドロップ対応',
                  '必須列・形式・数値のバリデーション',
                  'グロス/ネット売上・注文数・AOV集計',
                  '月別売上推移・カテゴリ別・SKUトップ10表示',
                  'Claude APIによる定量的分析コメント生成',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-navy shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <CsvUploader />
        )}
      </main>
    </div>
  );
}
