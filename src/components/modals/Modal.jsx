import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal shell: portal, Escape to close, focus trap,
 * body scroll lock, and focus returned to the trigger on close.
 */
export default function Modal({ onClose, labelledBy, children, wide = false }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const prev = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = cardRef.current?.querySelector(FOCUSABLE);
    first?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const els = [...cardRef.current.querySelectorAll(FOCUSABLE)];
      if (!els.length) return;
      const [a, b] = [els[0], els[els.length - 1]];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        b.focus();
      } else if (!e.shiftKey && document.activeElement === b) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="modal-card panel corner p-6 sm:p-8 relative"
        style={wide ? { maxWidth: 760 } : undefined}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 grid place-items-center rounded-lg border border-line hover:border-cyan hover:text-cyan transition-colors"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
