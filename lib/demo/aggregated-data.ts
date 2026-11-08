import type { AggregatedData } from '../analytics/types';

// サンプルCSV（public/sample.csv）から事前計算した集計値
// 集計根拠: aggregator.test.ts の統合テストで検証済み
const totalSales = 842500; // gross(830500) + discounts(12000)

export const demoAggregatedData: AggregatedData = {
  period: { start: '2025-08-02', end: '2025-10-30' },
  summary: {
    grossSales: 830500,
    discounts: 12000,
    returns: 8700,
    netSales: 821800,
    orderCount: 76,
    aov: 10928,
  },
  monthly: [
    { month: '2025-08', sales: 202900, orders: 23 },
    { month: '2025-09', sales: 265700, orders: 25 },
    { month: '2025-10', sales: 361900, orders: 28 },
  ],
  byCategory: [
    { category: 'アウター',     sales: 314100, ratio: 314100 / totalSales },
    { category: 'ボトムス',     sales: 189800, ratio: 189800 / totalSales },
    { category: 'トップス',     sales: 140400, ratio: 140400 / totalSales },
    { category: 'バッグ',       sales: 130300, ratio: 130300 / totalSales },
    { category: 'アクセサリー', sales:  67900, ratio:  67900 / totalSales },
  ],
  topSkus: [
    { sku: 'CS-OUT-003', name: 'トレンチコート',       sales: 132000, quantity: 6, ratio: 132000 / totalSales },
    { sku: 'CS-OUT-002', name: 'リネンコート',         sales:  92500, quantity: 5, ratio:  92500 / totalSales },
    { sku: 'CS-OUT-001', name: 'デニムジャケット',     sales:  89600, quantity: 7, ratio:  89600 / totalSales },
    { sku: 'CS-BAG-002', name: 'レザーショルダー',     sales:  72500, quantity: 5, ratio:  72500 / totalSales },
    { sku: 'CS-BTM-004', name: 'テーパードパンツ',     sales:  64400, quantity: 7, ratio:  64400 / totalSales },
    { sku: 'CS-TOP-003', name: 'ニットプルオーバー',   sales:  55800, quantity: 9, ratio:  55800 / totalSales },
    { sku: 'CS-BTM-002', name: 'リネンパンツ',         sales:  51000, quantity: 6, ratio:  51000 / totalSales },
    { sku: 'CS-BTM-001', name: 'デニムスカート',       sales:  46800, quantity: 6, ratio:  46800 / totalSales },
    { sku: 'CS-TOP-001', name: 'リネンブラウス',       sales:  34300, quantity: 7, ratio:  34300 / totalSales },
    { sku: 'CS-ACC-003', name: 'パールネックレス',     sales:  31500, quantity: 7, ratio:  31500 / totalSales },
  ],
};
