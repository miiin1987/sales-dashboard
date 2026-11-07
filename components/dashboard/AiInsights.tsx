'use client';

import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import type { AggregatedData } from '@/lib/analytics/types';

interface AnalysisResult {
  insights: string;
  actions: string[];
}

type FetchState = 'loading' | 'done' | 'error';

interface Props {
  data: AggregatedData;
}

export function AiInsights({ data }: Props) {
  const [state, setState] = useState<FetchState>('loading');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchInsights() {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ summary: data }),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json: AnalysisResult = await res.json();
        if (!cancelled) {
          setResult(json);
          setState('done');
        }
      } catch {
        if (!cancelled) setState('error');
      }
    }

    fetchInsights();
    return () => {
      cancelled = true;
    };
  }, [data]);

  if (state === 'loading') {
    return (
      <div className="flex items-center gap-3 py-6 text-sm text-gray-500">
        <Spinner />
        <span>Claude AI が分析中です...</span>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
        分析コメントの取得に失敗しました。
        <span className="ml-1 text-xs text-orange-500">
          （サーバーの ANTHROPIC_API_KEY を確認してください）
        </span>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-6">
      {/* Insights */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-brand-navy">定量的な分析コメント</h3>
        <p className="rounded-lg bg-brand-gray p-4 text-sm leading-relaxed text-gray-700">
          {result.insights}
        </p>
      </div>

      {/* Actions */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-brand-navy">翌月の改善アクション提案</h3>
        <ol className="space-y-2">
          {result.actions.map((action, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                {i + 1}
              </span>
              <p className="pt-0.5 text-sm text-gray-700">{action}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
