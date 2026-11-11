interface EmptyStateProps {
  title: string;
  hint: string;
  compact?: boolean;
}

export default function EmptyState({ title, hint, compact = false }: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.035] text-center ${
        compact
          ? 'border-0 bg-transparent px-4 py-4 text-left'
          : 'px-5 py-12 sm:py-16'
      }`}
      role="status"
    >
      <span aria-hidden="true" className={compact ? 'text-lg' : 'text-3xl'}>⌕</span>
      <h2 className={`${compact ? 'mt-1 text-sm' : 'mt-3 text-base'} font-semibold text-white`}>
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-400">{hint}</p>
    </div>
  );
}