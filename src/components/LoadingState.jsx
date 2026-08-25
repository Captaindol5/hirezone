const LoadingState = ({ title = 'Loading', message = 'Preparing your workspace...' }) => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="w-full max-w-md rounded-3xl border border-[var(--border-color)] bg-white/70 p-8 text-center shadow-[var(--shadow-soft)] backdrop-blur dark:bg-slate-900/80">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
      <h2 className="text-xl font-bold text-[var(--text-headers)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  </div>
);

export default LoadingState;
