import Papa from 'papaparse';
import { validateCsv, type ValidationResult } from './validator';
import type { ShopifyRow } from './types';

export interface ParseResult {
  rows: ShopifyRow[];
  validation: ValidationResult;
}

export async function parseCsvFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse<ShopifyRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const headers = results.meta.fields ?? [];
        const rows = results.data as ShopifyRow[];
        const validation = validateCsv(
          rows as unknown as Record<string, string>[],
          headers
        );
        resolve({ rows, validation });
      },
      error(err) {
        resolve({
          rows: [],
          validation: {
            valid: false,
            errors: [`CSVの解析に失敗しました: ${err.message}`],
          },
        });
      },
    });
  });
}
