interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando previsão...' }: LoadingStateProps) {
  return (
    <div
      aria-live="polite"
      className="flex min-h-64 flex-col items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/[0.04] text-center"
      role="status"
    >
      <span aria-hidden="true" className="relative flex h-10 w-10 items-center justify-center">
        <span className="absolute h-10 w-10 animate-ping rounded-full border border-teal-200/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-teal-200" />
      </span>
      <p className="mt-4 text-sm text-slate-300">{message}</p>
    </div>
  );
}