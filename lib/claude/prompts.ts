import type { AggregatedData } from '../analytics/types';

function fmt(n: number): string {
  return `¥${n.toLocaleString('ja-JP')}`;
}

function fmtPct(r: number): string {
  return `${(r * 100).toFixed(1)}%`;
}

export function buildAnalysisPrompt(data: AggregatedData): string {
  const { period, summary, monthly, byCategory, topSkus } = data;

  const monthlyTable = monthly
    .map((m) => `| ${m.month} | ${fmt(m.sales)} | ${m.orders}件 |`)
    .join('\n');

  const categoryTable = byCategory
    .slice(0, 5)
    .map((c) => `| ${c.category} | ${fmt(c.sales)} | ${fmtPct(c.ratio)} |`)
    .join('\n');

  const skuTable = topSkus
    .map(
      (s, i) =>
        `| ${i + 1} | ${s.sku} | ${s.name} | ${fmt(s.sales)} | ${s.quantity}個 | ${fmtPct(s.ratio)} |`
    )
    .join('\n');

  return `あなたはECサイトの売上データを分析するアシスタントです。
以下に示す【実際の集計データ】のみを根拠として分析してください。

制約事項：
- データに存在しない情報の推測・補完は禁止です
- 一般的なECの慣習・季節性などの外部知識に基づく断定的な提案は禁止です
- 各アクションは必ず上記の集計数値（売上金額・比率・件数）を直接引用した根拠を持つこと
- 「〜と考えられます」「〜かもしれません」等の推測表現を使用すること

【対象期間】${period.start} 〜 ${period.end}

【サマリー】
- グロス売上: ${fmt(summary.grossSales)}
- 割引合計: ${fmt(summary.discounts)}
- 返品額: ${fmt(summary.returns)}
- ネット売上: ${fmt(summary.netSales)}
- 注文件数: ${summary.orderCount}件
- 平均注文単価: ${fmt(summary.aov)}

【月別売上推移】
| 月 | 売上 | 注文数 |
|---|---|---|
${monthlyTable}

【カテゴリ別売上 TOP5】
| カテゴリ | 売上 | 比率 |
|---|---|---|
${categoryTable}

【SKU別売上 TOP10】
| # | SKU | 商品名 | 売上 | 数量 | 比率 |
|---|---|---|---|---|---|
${skuTable}

以下の2点を、上記の数値のみに基づいて提供してください：

1. 定量的な分析コメント（上記の具体的な数値を引用しながら傾向を述べる、200文字以内）
2. 翌月の改善アクション5つ（各50文字以内。各アクションは上記データの数値を明示して根拠を示すこと）

必ず以下のJSON形式のみで返してください（前後の説明文・マークダウン不要）：
{"insights":"...","actions":["...","...","...","...","..."]}`;
}
