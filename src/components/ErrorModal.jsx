import { AlertCircle } from 'lucide-react';

const ErrorModal = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl dark:bg-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center p-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle size={28} strokeWidth={2.5} />
          </div>
          <h3 className="mb-2 text-xl font-bold text-[var(--text-headers)]">Oops!</h3>
          <p className="mb-6 text-sm text-[var(--text-muted)]">{error}</p>
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600 active:scale-[0.98]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
