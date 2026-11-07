import { CsvUploader } from '@/components/upload/CsvUploader';

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

        <CsvUploader />
      </main>
    </div>
  );
}
