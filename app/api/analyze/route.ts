import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildAnalysisPrompt } from '@/lib/claude/prompts';
import type { AggregatedData } from '@/lib/analytics/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function isValidAnalysisResult(val: unknown): val is { insights: string; actions: string[] } {
  if (typeof val !== 'object' || val === null) return false;
  const obj = val as Record<string, unknown>;
  return (
    typeof obj.insights === 'string' &&
    obj.insights.trim().length > 0 &&
    Array.isArray(obj.actions) &&
    obj.actions.length > 0 &&
    obj.actions.every((a) => typeof a === 'string')
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY が設定されていません' },
      { status: 500 }
    );
  }

  let summary: AggregatedData;
  try {
    const body = await request.json();
    summary = body.summary as AggregatedData;
  } catch {
    return NextResponse.json({ error: 'リクエストの解析に失敗しました' }, { status: 400 });
  }

  if (
    !summary?.period?.start ||
    !summary?.period?.end ||
    typeof summary?.summary?.grossSales !== 'number' ||
    !Array.isArray(summary?.monthly)
  ) {
    return NextResponse.json({ error: '集計データの構造が不正です' }, { status: 400 });
  }

  const prompt = buildAnalysisPrompt(summary);

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    if (message.content.length === 0 || message.content[0].type !== 'text') {
      return NextResponse.json({ error: 'AIから有効な応答がありませんでした' }, { status: 500 });
    }

    const text = message.content[0].text;

    // Extract the outermost JSON object (handles markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'AIの応答からJSONを取得できませんでした' },
        { status: 500 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: 'AIの応答が無効なJSON形式でした' }, { status: 500 });
    }

    if (!isValidAnalysisResult(parsed)) {
      return NextResponse.json(
        { error: 'AIの応答に必要なフィールド（insights, actions）がありません' },
        { status: 500 }
      );
    }

    // Normalize: ensure exactly 5 actions (pad or trim)
    const actions = parsed.actions.slice(0, 5);

    return NextResponse.json({ insights: parsed.insights, actions });
  } catch (err) {
    const errMsg = err instanceof Anthropic.APIError
      ? `Claude API エラー (${err.status}): ${err.message}`
      : err instanceof Error
        ? err.message
        : '不明なエラー';

    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
