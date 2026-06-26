export default function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border-l-4 border-danger bg-danger-soft px-4 py-3 text-sm text-red-800">
      <span className="font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 text-red-400 hover:text-red-600"
          aria-label="Cerrar"
        >
          ✕
        </button>
      )}
    </div>
  );
}
