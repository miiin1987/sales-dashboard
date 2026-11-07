import type { SkuData } from '@/lib/analytics/types';

interface Props {
  data: SkuData[];
}

export function TopSkuTable({ data }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-border text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="pb-3 pr-4">#</th>
            <th className="pb-3 pr-4">SKU</th>
            <th className="pb-3 pr-4">商品名</th>
            <th className="pb-3 pr-4 text-right">売上</th>
            <th className="pb-3 pr-4 text-right">数量</th>
            <th className="pb-3 text-right">比率</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr
              key={item.sku}
              className="border-b border-brand-border last:border-0 hover:bg-brand-gray"
            >
              <td className="py-3 pr-4 font-medium text-gray-400">{i + 1}</td>
              <td className="py-3 pr-4 font-mono text-xs text-gray-500">{item.sku}</td>
              <td className="py-3 pr-4 font-medium text-brand-navy">{item.name}</td>
              <td className="py-3 pr-4 text-right font-semibold">
                ¥{item.sales.toLocaleString('ja-JP')}
              </td>
              <td className="py-3 pr-4 text-right text-gray-600">
                {item.quantity.toLocaleString('ja-JP')}個
              </td>
              <td className="py-3 text-right">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-brand-accent">
                  {(item.ratio * 100).toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
