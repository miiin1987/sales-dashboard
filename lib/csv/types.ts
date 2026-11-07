export type FinancialStatus =
  | 'paid'
  | 'refunded'
  | 'partially_refunded'
  | 'pending'
  | 'voided';

export const VALID_FINANCIAL_STATUSES: FinancialStatus[] = [
  'paid',
  'refunded',
  'partially_refunded',
  'pending',
  'voided',
];

export interface ShopifyRow {
  Name: string;
  'Financial Status': string;
  'Created at': string;
  Subtotal: string;
  Shipping: string;
  Taxes: string;
  Total: string;
  'Discount Code': string;
  'Discount Amount': string;
  'Refunded Amount': string;
  'Lineitem name': string;
  'Lineitem quantity': string;
  'Lineitem price': string;
  'Lineitem sku': string;
  Vendor: string;
  [key: string]: string;
}

export const REQUIRED_COLUMNS = [
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
] as const;

export type RequiredColumn = (typeof REQUIRED_COLUMNS)[number];
