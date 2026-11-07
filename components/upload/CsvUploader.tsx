'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseCsvFile } from '@/lib/csv/parser';
import { aggregate } from '@/lib/analytics/aggregator';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ValidationError } from './ValidationError';

type UploadState = 'idle' | 'processing' | 'error';

export function CsvUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.csv')) {
        setErrors(['CSVファイル（.csv）を選択してください。']);
        setState('error');
        return;
      }

      setState('processing');
      setErrors([]);

      const { rows, validation } = await parseCsvFile(file);

      if (!validation.valid) {
        setErrors(validation.errors);
        setState('error');
        return;
      }

      const data = aggregate(rows);

      if (data.summary.orderCount === 0) {
        setErrors([
          '集計対象の注文が見つかりませんでした。Financial Status が "paid" または "partially_refunded" の注文が必要です。',
        ]);
        setState('error');
        return;
      }

      try {
        sessionStorage.setItem('dashboardData', JSON.stringify(data));
      } catch {
        setErrors(['データの保存に失敗しました。ブラウザのストレージ設定を確認してください。']);
        setState('error');
        return;
      }

      router.push('/dashboard');
    },
    [router]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="w-full max-w-xl space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-8 py-14 transition-colors ${
          isDragging
            ? 'border-brand-accent bg-blue-50'
            : 'border-brand-border bg-white hover:border-brand-navy hover:bg-brand-gray'
        }`}
        role="button"
        aria-label="CSVファイルを選択"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        {state === 'processing' ? (
          <>
            <Spinner size="lg" />
            <p className="text-sm text-brand-navy">解析・集計中...</p>
          </>
        ) : (
          <>
            <svg
              className="h-10 w-10 text-brand-navy opacity-60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div className="text-center">
              <p className="text-base font-medium text-brand-navy">
                ドラッグ＆ドロップ
              </p>
              <p className="text-sm text-gray-500">または クリックして選択</p>
            </div>
            <p className="text-xs text-gray-400">Shopify 注文エクスポートCSV</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      <ValidationError errors={errors} />

      <div className="flex items-center justify-between">
        <a
          href="/sample.csv"
          download
          className="text-sm text-brand-accent underline underline-offset-2 hover:opacity-80"
        >
          サンプルCSVをダウンロード
        </a>
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={state === 'processing'}
        >
          ファイルを選択
        </Button>
      </div>

      <div className="rounded-lg bg-brand-gray px-4 py-3 text-xs text-gray-500 leading-relaxed">
        <p className="font-medium text-gray-600 mb-1">必須列</p>
        <p>Name, Financial Status, Created at, Total, Subtotal, Discount Amount, Refunded Amount, Lineitem name, Lineitem quantity, Lineitem price, Lineitem sku, Vendor</p>
      </div>
    </div>
  );
}
