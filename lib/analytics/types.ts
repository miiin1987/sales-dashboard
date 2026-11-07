export interface MonthlyData {
  month: string;
  sales: number;
  orders: number;
}

export interface CategoryData {
  category: string;
  sales: number;
  ratio: number;
}

export interface SkuData {
  sku: string;
  name: string;
  sales: number;
  quantity: number;
  ratio: number;
}

export interface SummaryData {
  grossSales: number;
  discounts: number;
  returns: number;
  netSales: number;
  orderCount: number;
  aov: number;
}

export interface AggregatedData {
  period: {
    start: string;
    end: string;
  };
  summary: SummaryData;
  monthly: MonthlyData[];
  byCategory: CategoryData[];
  topSkus: SkuData[];
}
