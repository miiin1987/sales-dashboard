import type { ShopifyRow } from '../csv/types';
import type {
  AggregatedData,
  CategoryData,
  MonthlyData,
  SkuData,
} from './types';

interface OrderRecord {
  status: string;
  total: number;
  discountAmount: number;
  refundedAmount: number;
  createdAt: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
    sku: string;
    vendor: string;
  }>;
}

function parseShopifyDate(dateStr: string): Date {
  const normalized = dateStr
    .trim()
    .replace(' ', 'T')
    .replace(/ ([+-])(\d{2})(\d{2})$/, '$1$2:$3');
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? new Date(dateStr) : d;
}

function toYearMonth(dateStr: string): string {
  const d = parseShopifyDate(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function aggregate(rows: ShopifyRow[]): AggregatedData {
  // Group rows by order name, deduplicating order-level fields
  const orderMap = new Map<string, OrderRecord>();

  for (const row of rows) {
    const name = row.Name?.trim();
    if (!name) continue;

    if (!orderMap.has(name)) {
      orderMap.set(name, {
        status: row['Financial Status']?.trim() ?? '',
        total: parseFloat(row.Total) || 0,
        discountAmount: parseFloat(row['Discount Amount']) || 0,
        refundedAmount: parseFloat(row['Refunded Amount']) || 0,
        createdAt: row['Created at']?.trim() ?? '',
        items: [],
      });
    }

    const qty = parseInt(row['Lineitem quantity'], 10) || 0;
    const price = parseFloat(row['Lineitem price']) || 0;
    if (qty > 0 && price >= 0) {
      orderMap.get(name)!.items.push({
        name: row['Lineitem name']?.trim() ?? '',
        qty,
        price,
        sku: row['Lineitem sku']?.trim() ?? '',
        vendor: row.Vendor?.trim() ?? '',
      });
    }
  }

  // Filter to eligible orders: paid + partially_refunded
  const eligible = [...orderMap.entries()].filter(
    ([, o]) => o.status === 'paid' || o.status === 'partially_refunded'
  );

  // Summary
  const grossSales = eligible.reduce((s, [, o]) => s + o.total, 0);
  const discounts = eligible.reduce((s, [, o]) => s + o.discountAmount, 0);
  const returns_ = eligible.reduce((s, [, o]) => s + o.refundedAmount, 0);
  const netSales = grossSales - returns_;
  const orderCount = eligible.length;
  const aov = orderCount > 0 ? Math.round(grossSales / orderCount) : 0;

  // Monthly
  const monthlyMap = new Map<string, { sales: number; orders: number }>();
  for (const [, order] of eligible) {
    const month = toYearMonth(order.createdAt);
    const prev = monthlyMap.get(month) ?? { sales: 0, orders: 0 };
    monthlyMap.set(month, {
      sales: prev.sales + order.total,
      orders: prev.orders + 1,
    });
  }
  const monthly: MonthlyData[] = [...monthlyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({ month, sales: d.sales, orders: d.orders }));

  // Category (by Vendor)
  const categoryMap = new Map<string, number>();
  for (const [, order] of eligible) {
    for (const item of order.items) {
      const vendor = item.vendor || '不明';
      categoryMap.set(vendor, (categoryMap.get(vendor) ?? 0) + item.qty * item.price);
    }
  }
  const totalCatSales = [...categoryMap.values()].reduce((s, v) => s + v, 0);
  const byCategory: CategoryData[] = [...categoryMap.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([category, sales]) => ({
      category,
      sales,
      ratio: totalCatSales > 0 ? sales / totalCatSales : 0,
    }));

  // SKU top 10
  const skuMap = new Map<string, { name: string; sales: number; quantity: number }>();
  for (const [, order] of eligible) {
    for (const item of order.items) {
      const sku = item.sku || item.name;
      const existing = skuMap.get(sku);
      if (existing) {
        existing.sales += item.qty * item.price;
        existing.quantity += item.qty;
      } else {
        skuMap.set(sku, {
          name: item.name,
          sales: item.qty * item.price,
          quantity: item.qty,
        });
      }
    }
  }
  const totalSkuSales = [...skuMap.values()].reduce((s, v) => s + v.sales, 0);
  const topSkus: SkuData[] = [...skuMap.entries()]
    .sort(([, a], [, b]) => b.sales - a.sales)
    .slice(0, 10)
    .map(([sku, d]) => ({
      sku,
      name: d.name,
      sales: d.sales,
      quantity: d.quantity,
      ratio: totalSkuSales > 0 ? d.sales / totalSkuSales : 0,
    }));

  // Period
  const dates = eligible
    .map(([, o]) => parseShopifyDate(o.createdAt))
    .filter((d) => !isNaN(d.getTime()));
  const minDate = dates.length
    ? new Date(Math.min(...dates.map((d) => d.getTime())))
    : new Date();
  const maxDate = dates.length
    ? new Date(Math.max(...dates.map((d) => d.getTime())))
    : new Date();

  return {
    period: {
      start: minDate.toISOString().split('T')[0],
      end: maxDate.toISOString().split('T')[0],
    },
    summary: {
      grossSales,
      discounts,
      returns: returns_,
      netSales,
      orderCount,
      aov,
    },
    monthly,
    byCategory,
    topSkus,
  };
}
