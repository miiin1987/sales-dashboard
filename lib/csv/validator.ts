import {
  REQUIRED_COLUMNS,
  VALID_FINANCIAL_STATUSES,
  type ShopifyRow,
} from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function parseShopifyDate(dateStr: string): Date {
  // Normalize "2025-08-02 09:15:00 +0900" → "2025-08-02T09:15:00+09:00"
  const normalized = dateStr
    .trim()
    .replace(' ', 'T')
    .replace(/ ([+-])(\d{2})(\d{2})$/, '$1$2:$3');
  const d = new Date(normalized);
  if (!isNaN(d.getTime())) return d;
  // fallback
  return new Date(dateStr);
}

export function validateCsv(
  rows: Record<string, string>[],
  headers: string[]
): ValidationResult {
  const errors: string[] = [];

  // 1. Check required columns
  for (const col of REQUIRED_COLUMNS) {
    if (!headers.includes(col)) {
      errors.push(`必須列が見つかりません: "${col}"`);
    }
  }
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  if (rows.length === 0) {
    return { valid: false, errors: ['データ行が1件もありません。'] };
  }

  // 2. Row-level validation (sample up to 500 rows for performance)
  const sampleSize = Math.min(rows.length, 500);
  const rowErrors: string[] = [];

  for (let i = 0; i < sampleSize; i++) {
    const row = rows[i] as ShopifyRow;
    const lineNum = i + 2; // 1-indexed with header

    if (!row.Name || row.Name.trim() === '') {
      rowErrors.push(`行 ${lineNum}: Name が空です`);
    }

    const status = row['Financial Status']?.trim();
    if (!status) {
      rowErrors.push(`行 ${lineNum}: Financial Status が空です`);
    } else if (!VALID_FINANCIAL_STATUSES.includes(status as typeof VALID_FINANCIAL_STATUSES[number])) {
      rowErrors.push(
        `行 ${lineNum}: Financial Status の値が不正です ("${status}")`
      );
    }

    const createdAt = row['Created at']?.trim();
    if (!createdAt) {
      rowErrors.push(`行 ${lineNum}: Created at が空です`);
    } else {
      const d = parseShopifyDate(createdAt);
      if (isNaN(d.getTime())) {
        rowErrors.push(`行 ${lineNum}: Created at が日付として解析できません ("${createdAt}")`);
      }
    }

    const total = parseFloat(row.Total);
    if (row.Total?.trim() !== '' && isNaN(total)) {
      rowErrors.push(`行 ${lineNum}: Total が数値ではありません ("${row.Total}")`);
    }

    const qty = parseInt(row['Lineitem quantity'], 10);
    if (isNaN(qty) || qty < 0) {
      rowErrors.push(`行 ${lineNum}: Lineitem quantity が正の整数ではありません ("${row['Lineitem quantity']}")`);
    }

    const price = parseFloat(row['Lineitem price']);
    if (row['Lineitem price']?.trim() !== '' && isNaN(price)) {
      rowErrors.push(`行 ${lineNum}: Lineitem price が数値ではありません ("${row['Lineitem price']}")`);
    }

    if (rowErrors.length >= 10) {
      rowErrors.push('エラーが多すぎます。最初の10件のみ表示しています。');
      break;
    }
  }

  errors.push(...rowErrors);

  return {
    valid: errors.length === 0,
    errors,
  };
}
