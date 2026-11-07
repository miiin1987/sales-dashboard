import { describe, it, expect } from 'vitest';
import { validateCsv } from '../lib/csv/validator';

const ALL_HEADERS = [
  'Name',
  'Financial Status',
  'Created at',
  'Total',
  'Subtotal',
  'Discount Amount',
  'Refunded Amount',
  'Lineitem name',
  'Lineitem quantity',
  'Lineitem price',
  'Lineitem sku',
  'Vendor',
];

function validRow(overrides: Record<string, string> = {}): Record<string, string> {
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
    'Lineitem name': 'テスト商品',
    'Lineitem quantity': '1',
    'Lineitem price': '10000',
    'Lineitem sku': 'TEST-001',
    Vendor: 'トップス',
    ...overrides,
  };
}

// ───────────────────────────── 1. 正常ケース ─────────────────────────────────
describe('正常ケース', () => {
  it('有効なCSVはエラーなしで通過する', () => {
    const result = validateCsv([validRow()], ALL_HEADERS);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ───────────────────────────── 2. 必須列チェック ──────────────────────────────
describe('必須列チェック', () => {
  it('必須列がすべて存在する場合はエラーなし', () => {
    const result = validateCsv([validRow()], ALL_HEADERS);
    expect(result.valid).toBe(true);
  });

  it.each([
    'Name',
    'Financial Status',
    'Created at',
    'Total',
    'Subtotal',
    'Discount Amount',
    'Refunded Amount',
    'Lineitem name',
    'Lineitem quantity',
    'Lineitem price',
    'Lineitem sku',
    'Vendor',
  ])('必須列 "%s" が欠けている場合はエラー', (missingCol) => {
    const headers = ALL_HEADERS.filter(h => h !== missingCol);
    const result = validateCsv([validRow()], headers);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes(missingCol))).toBe(true);
  });

  it('空ファイル（ヘッダーのみ）はエラー', () => {
    const result = validateCsv([], ALL_HEADERS);
    expect(result.valid).toBe(false);
  });
});

// ───────────────────────────── 3. Financial Status バリデーション ─────────────
describe('Financial Status バリデーション', () => {
  it.each(['paid', 'refunded', 'partially_refunded', 'pending', 'voided'])(
    '"%s" は有効な値として通過する',
    (status) => {
      const result = validateCsv([validRow({ 'Financial Status': status })], ALL_HEADERS);
      expect(result.valid).toBe(true);
    }
  );

  it('不正な Financial Status はエラー', () => {
    const result = validateCsv([validRow({ 'Financial Status': 'cancelled' })], ALL_HEADERS);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Financial Status');
  });

  it('空の Financial Status はエラー', () => {
    const result = validateCsv([validRow({ 'Financial Status': '' })], ALL_HEADERS);
    expect(result.valid).toBe(false);
  });
});

// ───────────────────────────── 4. 日付バリデーション ─────────────────────────
describe('日付バリデーション', () => {
  it('Shopify形式の日時は有効', () => {
    const result = validateCsv(
      [validRow({ 'Created at': '2025-08-02 09:15:00 +0900' })],
      ALL_HEADERS
    );
    expect(result.valid).toBe(true);
  });

  it('ISO形式の日時も有効', () => {
    const result = validateCsv(
      [validRow({ 'Created at': '2025-08-02T09:15:00+09:00' })],
      ALL_HEADERS
    );
    expect(result.valid).toBe(true);
  });

  it('完全に無効な日付はエラー', () => {
    const result = validateCsv(
      [validRow({ 'Created at': 'not-a-date' })],
      ALL_HEADERS
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Created at');
  });

  it('空の Created at はエラー', () => {
    const result = validateCsv([validRow({ 'Created at': '' })], ALL_HEADERS);
    expect(result.valid).toBe(false);
  });
});

// ───────────────────────────── 5. 数値バリデーション ─────────────────────────
describe('数値バリデーション', () => {
  it('Lineitem quantity が非整数はエラー', () => {
    const result = validateCsv([validRow({ 'Lineitem quantity': 'abc' })], ALL_HEADERS);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Lineitem quantity');
  });

  it('Lineitem quantity が負数はエラー', () => {
    const result = validateCsv([validRow({ 'Lineitem quantity': '-1' })], ALL_HEADERS);
    expect(result.valid).toBe(false);
  });

  it('Total が数値でない場合はエラー', () => {
    const result = validateCsv([validRow({ Total: 'invalid' })], ALL_HEADERS);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Total');
  });

  it('Discount Amount が空文字でも有効（0扱い）', () => {
    const result = validateCsv([validRow({ 'Discount Amount': '' })], ALL_HEADERS);
    expect(result.valid).toBe(true);
  });

  it('Refunded Amount が空文字でも有効（0扱い）', () => {
    const result = validateCsv([validRow({ 'Refunded Amount': '' })], ALL_HEADERS);
    expect(result.valid).toBe(true);
  });
});

// ───────────────────────────── 6. エラー件数上限 ─────────────────────────────
describe('エラー件数上限', () => {
  it('エラーが多い場合でも10件以下に収める', () => {
    const rows = Array.from({ length: 20 }, () =>
      validRow({ 'Financial Status': 'invalid_status' })
    );
    const result = validateCsv(rows, ALL_HEADERS);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeLessThanOrEqual(11); // 10 errors + "too many" message
  });
});
