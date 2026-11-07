import { Card } from '@/components/ui/Card';

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  subLabel?: string;
}

export function MetricCard({ label, value, sub, subLabel }: MetricCardProps) {
  return (
    <Card className="flex flex-col gap-1">
      <p className="text-xs font-medium uppercase tracking-widest text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-brand-navy">{value}</p>
      {sub && (
        <p className="text-xs text-gray-400">
          {subLabel && <span className="mr-1">{subLabel}</span>}
          {sub}
        </p>
      )}
    </Card>
  );
}
