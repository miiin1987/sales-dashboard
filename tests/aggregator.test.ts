import { describe, it, expect } from 'vitest';
import { aggregate } from '../lib/analytics/aggregator';
import type { ShopifyRow } from '../lib/csv/types';

function row(overrides: Partial<ShopifyRow>): ShopifyRow {
  return {
    Name: '#1001',
    'Financial Status': 'paid',
    'Created at': '2025-08-02 09:00:00 +0900',
    Subtotal: '10000',
    Shipping: '0',
    Taxes: '0',
    Total: '10000',
    'Discount Code': '',
    'Discount Amount': '0',
    'Refunded Amount': '0',
    'Lineitem name': 'テスト商品A',
    'Lineitem quantity': '1',
    'Lineitem price': '10000',
    'Lineitem sku': 'TEST-001',
    Vendor: 'カテゴリA',
    ...overrides,
  };
}

// ───────────────────────────── 1. Financial Status filtering ─────────────────
describe('Financial Status のフィルタリング', () => {
  it('paid と partially_refunded のみ集計対象になる', () => {
    const rows: ShopifyRow[] = [
      row({ Name: '#1001', 'Financial Status': 'paid', Total: '10000' }),
      row({ Name: '#1002', 'Financial Status': 'partially_refunded', Total: '8000' }),
      row({ Name: '#1003', 'Financial Status': 'refunded', Total: '5000' }),
      row({ Name: '#1004', 'Financial Status': 'voided', Total: '3000' }),
      row({ Name: '#1005', 'Financial Status': 'pending', Total: '2000' }),
    ];
    const result = aggregate(rows);
    expect(result.summary.orderCount).toBe(2);
    expect(result.summary.grossSales).toBe(18000); // 10000 + 8000
  });

  it('全注文が対象外の場合は orderCount=0', () => {
    const rows = [
      row({ Name: '#1001', 'Financial Status': 'refunded' }),
      row({ Name: '#1002', 'Financial Status': 'voided' }),
    ];
    const result = aggregate(rows);
    expect(result.summary.orderCount).toBe(0);
    expect(result.summary.grossSales).toBe(0);
  });
});

// ───────────────────────────── 2. 注文の重複カウント防止 ─────────────────────
describe('複数ラインアイテムを持つ注文の重複カウント防止', () => {
  it('同一Nameの複数行は注文1件としてカウント', () => {
    const rows: ShopifyRow[] = [
      row({ Name: '#1001', Total: '15000', 'Lineitem name': '商品A', 'Lineitem price': '8000', 'Lineitem sku': 'SKU-A', Vendor: 'カテゴリA' }),
      row({ Name: '#1001', Total: '15000', 'Lineitem name': '商品B', 'Lineitem price': '7000', 'Lineitem sku': 'SKU-B', Vendor: 'カテゴリB' }),
    ];
    const result = aggregate(rows);
    expect(result.summary.orderCount).toBe(1);
    expect(result.summary.grossSales).toBe(15000); // Total counted once
  });

  it('複数ラインアイテムのカテゴリ別集計は各アイテム合算', () => {
    const rows: ShopifyRow[] = [
      row({ Name: '#1001', Total: '15000', 'Lineitem name': '商品A', 'Lineitem price': '8000', 'Lineitem sku': 'SKU-A', Vendor: 'カテゴリA' }),
      row({ Name: '#1001', Total: '15000', 'Lineitem name': '商品B', 'Lineitem price': '7000', 'Lineitem sku': 'SKU-B', Vendor: 'カテゴリB' }),
    ];
    const result = aggregate(rows);
    const catA = result.byCategory.find(c => c.category === 'カテゴリA');
    const catB = result.byCategory.find(c => c.category === 'カテゴリB');
    expect(catA?.sales).toBe(8000);
    expect(catB?.sales).toBe(7000);
  });
});

// ───────────────────────────── 3. Summary 計算精度 ───────────────────────────
describe('Summary 計算精度', () => {
  it('Gross Sales = Σ Total（対象注文）', () => {
    const rows = [
      row({ Name: '#1001', Total: '12000' }),
      row({ Name: '#1002', Total: '8500' }),
    ];
    expect(aggregate(rows).summary.grossSales).toBe(20500);
  });

  it('Discounts = Σ Discount Amount（対象注文）', () => {
    const rows = [
      row({ Name: '#1001', Total: '9500', 'Discount Amount': '500' }),
      row({ Name: '#1002', Total: '8000', 'Discount Amount': '1000' }),
    ];
    expect(aggregate(rows).summary.discounts).toBe(1500);
  });

  it('Returns = Σ Refunded Amount（対象注文）', () => {
    const rows = [
      row({ Name: '#1001', 'Financial Status': 'partially_refunded', Total: '14700', 'Refunded Amount': '5500' }),
      row({ Name: '#1002', Total: '8000', 'Refunded Amount': '0' }),
    ];
    expect(aggregate(rows).summary.returns).toBe(5500);
  });

  it('Net Sales = Gross Sales - Returns', () => {
    const rows = [
      row({ Name: '#1001', 'Financial Status': 'partially_refunded', Total: '14700', 'Refunded Amount': '5500' }),
      row({ Name: '#1002', Total: '8000' }),
    ];
    const { grossSales, returns, netSales } = aggregate(rows).summary;
    expect(grossSales).toBe(22700);
    expect(returns).toBe(5500);
    expect(netSales).toBe(grossSales - returns);
  });

  it('AOV = round(Gross / OrderCount)', () => {
    const rows = [
      row({ Name: '#1001', Total: '10000' }),
      row({ Name: '#1002', Total: '10001' }),
      row({ Name: '#1003', Total: '10002' }),
    ];
    // (30003 / 3) = 10001
    expect(aggregate(rows).summary.aov).toBe(10001);
  });

  it('Discount Amount が空文字でも 0 として扱う', () => {
    const rows = [row({ Name: '#1001', 'Discount Amount': '' })];
    expect(aggregate(rows).summary.discounts).toBe(0);
  });

  it('Refunded Amount が空文字でも 0 として扱う', () => {
    const rows = [row({ Name: '#1001', 'Refunded Amount': '' })];
    expect(aggregate(rows).summary.returns).toBe(0);
  });
});

// ───────────────────────────── 4. 月別集計 ───────────────────────────────────
describe('月別集計', () => {
  it('年月ごとに正しくグループ化される', () => {
    const rows = [
      row({ Name: '#1001', 'Created at': '2025-08-10 09:00:00 +0900', Total: '10000' }),
      row({ Name: '#1002', 'Created at': '2025-08-20 09:00:00 +0900', Total: '5000' }),
      row({ Name: '#1003', 'Created at': '2025-09-05 09:00:00 +0900', Total: '8000' }),
    ];
    const result = aggregate(rows);
    expect(result.monthly).toHaveLength(2);
    const aug = result.monthly.find(m => m.month === '2025-08');
    const sep = result.monthly.find(m => m.month === '2025-09');
    expect(aug?.sales).toBe(15000);
    expect(aug?.orders).toBe(2);
    expect(sep?.sales).toBe(8000);
    expect(sep?.orders).toBe(1);
  });

  it('月別データは昇順ソートされる', () => {
    const rows = [
      row({ Name: '#1001', 'Created at': '2025-10-01 09:00:00 +0900' }),
      row({ Name: '#1002', 'Created at': '2025-08-01 09:00:00 +0900' }),
      row({ Name: '#1003', 'Created at': '2025-09-01 09:00:00 +0900' }),
    ];
    const months = aggregate(rows).monthly.map(m => m.month);
    expect(months).toEqual(['2025-08', '2025-09', '2025-10']);
  });
});

// ───────────────────────────── 5. カテゴリ別集計 ─────────────────────────────
describe('カテゴリ別集計（Vendor列）', () => {
  it('Lineitem price × quantity で集計される', () => {
    const rows = [
      row({ Name: '#1001', Vendor: 'トップス', 'Lineitem price': '5000', 'Lineitem quantity': '2' }),
      row({ Name: '#1002', Vendor: 'ボトムス', 'Lineitem price': '8000', 'Lineitem quantity': '1' }),
    ];
    // Note: Total for #1001 is 10000 (default), so we update it
    rows[0].Total = '10000';
    rows[1].Total = '8000';
    const result = aggregate(rows);
    const tops = result.byCategory.find(c => c.category === 'トップス');
    expect(tops?.sales).toBe(10000); // 5000 × 2
  });

  it('比率の合計は 1 になる', () => {
    const rows = [
      row({ Name: '#1001', Vendor: 'A', 'Lineitem price': '6000', Total: '6000' }),
      row({ Name: '#1002', Vendor: 'B', 'Lineitem price': '4000', Total: '4000' }),
    ];
    const { byCategory } = aggregate(rows);
    const totalRatio = byCategory.reduce((s, c) => s + c.ratio, 0);
    expect(totalRatio).toBeCloseTo(1, 5);
  });

  it('カテゴリは売上の降順にソートされる', () => {
    const rows = [
      row({ Name: '#1001', Vendor: '小', 'Lineitem price': '1000', Total: '1000' }),
      row({ Name: '#1002', Vendor: '大', 'Lineitem price': '9000', Total: '9000' }),
      row({ Name: '#1003', Vendor: '中', 'Lineitem price': '5000', Total: '5000' }),
    ];
    const cats = aggregate(rows).byCategory.map(c => c.category);
    expect(cats).toEqual(['大', '中', '小']);
  });
});

// ───────────────────────────── 6. SKU別集計 ──────────────────────────────────
describe('SKU別集計', () => {
  it('同一SKUが複数注文にまたがる場合に合算される', () => {
    const rows = [
      row({ Name: '#1001', 'Lineitem sku': 'TOP-001', 'Lineitem price': '5000', 'Lineitem quantity': '1', Total: '5000' }),
      row({ Name: '#1002', 'Lineitem sku': 'TOP-001', 'Lineitem price': '5000', 'Lineitem quantity': '2', Total: '10000' }),
    ];
    const { topSkus } = aggregate(rows);
    const sku = topSkus.find(s => s.sku === 'TOP-001');
    expect(sku?.sales).toBe(15000); // 5000 + 10000
    expect(sku?.quantity).toBe(3);  // 1 + 2
  });

  it('上位10件のみ返される', () => {
    const rows = Array.from({ length: 15 }, (_, i) =>
      row({
        Name: `#${1000 + i}`,
        'Lineitem sku': `SKU-${String(i).padStart(2, '0')}`,
        'Lineitem price': String((15 - i) * 1000),
        Total: String((15 - i) * 1000),
      })
    );
    expect(aggregate(rows).topSkus).toHaveLength(10);
  });

  it('SKUは売上降順にソートされる', () => {
    const rows = [
      row({ Name: '#1001', 'Lineitem sku': 'LOW', 'Lineitem price': '1000', Total: '1000' }),
      row({ Name: '#1002', 'Lineitem sku': 'HIGH', 'Lineitem price': '9000', Total: '9000' }),
    ];
    const skus = aggregate(rows).topSkus.map(s => s.sku);
    expect(skus[0]).toBe('HIGH');
    expect(skus[1]).toBe('LOW');
  });
});

// ───────────────────────────── 7. sample.csv 統合テスト ──────────────────────
describe('sample.csv 集計値の検証', () => {
  it('期待する集計値と一致する', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const Papa = (await import('papaparse')).default;

    const csvPath = path.resolve(__dirname, '../public/sample.csv');
    const csvText = fs.readFileSync(csvPath, 'utf-8');

    const result = Papa.parse<ShopifyRow>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const data = aggregate(result.data);

    // Summary
    expect(data.summary.grossSales).toBe(830500);
    expect(data.summary.discounts).toBe(12000);
    expect(data.summary.returns).toBe(8700);
    expect(data.summary.netSales).toBe(821800);
    expect(data.summary.orderCount).toBe(76);
    expect(data.summary.aov).toBe(10928);

    // Monthly trend
    expect(data.monthly).toHaveLength(3);
    const aug = data.monthly.find(m => m.month === '2025-08');
    const sep = data.monthly.find(m => m.month === '2025-09');
    const oct = data.monthly.find(m => m.month === '2025-10');
    expect(aug?.sales).toBe(202900);
    expect(aug?.orders).toBe(23);
    expect(sep?.sales).toBe(265700);
    expect(sep?.orders).toBe(25);
    expect(oct?.sales).toBe(361900);
    expect(oct?.orders).toBe(28);

    // Category ranking: アウター should be #1
    expect(data.byCategory[0].category).toBe('アウター');
    expect(data.byCategory[0].sales).toBe(314100);

    // Top SKU: トレンチコート should be #1
    expect(data.topSkus[0].sku).toBe('CS-OUT-003');
    expect(data.topSkus[0].sales).toBe(132000);
  });
});
