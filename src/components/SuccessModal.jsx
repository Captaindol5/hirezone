import { CheckCircle2 } from 'lucide-react';

const SuccessModal = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl dark:bg-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center p-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 size={28} strokeWidth={2.5} />
          </div>
          <h3 className="mb-2 text-xl font-bold text-[var(--text-headers)]">Success!</h3>
          <p className="mb-6 text-sm text-[var(--text-muted)]">{message}</p>
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 active:scale-[0.98]"
          >
            Awesome
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
