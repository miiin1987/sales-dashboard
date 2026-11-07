interface ValidationErrorProps {
  errors: string[];
}

export function ValidationError({ errors }: ValidationErrorProps) {
  if (errors.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-4"
    >
      <p className="mb-2 text-sm font-semibold text-red-700">
        CSVの検証エラー（{errors.length}件）
      </p>
      <ul className="space-y-1">
        {errors.map((e, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-red-600">
            <span className="mt-0.5 shrink-0">✕</span>
            <span>{e}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
