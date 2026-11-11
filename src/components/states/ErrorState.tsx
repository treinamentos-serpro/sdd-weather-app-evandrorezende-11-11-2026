interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section
      aria-labelledby="error-title"
      className="rounded-[1.75rem] border border-rose-300/15 bg-rose-300/[0.045] px-5 py-10 text-center backdrop-blur-md"
      role="alert"
    >
      <span aria-hidden="true" className="text-3xl">!</span>
      <h2 className="mt-3 text-lg font-semibold text-white" id="error-title">Não foi possível carregar</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-300">{message}</p>
      <button
        className="mt-5 rounded-xl border border-white/15 bg-white/[0.07] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.12]"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </section>
  );
}