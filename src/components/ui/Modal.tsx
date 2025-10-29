// src/components/ui/Modal.tsx
type ModalProps = {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;     // ✅ the single, consistent prop
};

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur">
        <div className="mb-3 flex items-start justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-sm hover:bg-white/15">
            Close
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}