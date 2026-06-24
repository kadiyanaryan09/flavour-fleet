export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm' }) {
  return (
    <div className="fixed inset-0 bg-ink/50 grid place-items-center p-5 z-50" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-card p-6 max-w-sm w-full animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-full text-sm font-semibold bg-fleet-500 text-ink">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
