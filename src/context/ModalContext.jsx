import { createContext, useCallback, useMemo, useState } from 'react';

/**
 * One modal at a time, opened from anywhere:
 *   open('sponsor', { amount })  open('team', { id })  open('dossier', { id })  open('arch', { id })
 */
export const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);
  const open = useCallback((type, props = {}) => setModal({ type, props }), []);
  const close = useCallback(() => setModal(null), []);
  const value = useMemo(() => ({ modal, open, close }), [modal, open, close]);
  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}
