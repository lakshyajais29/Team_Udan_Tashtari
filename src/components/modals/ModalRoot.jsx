import { lazy, Suspense } from 'react';
import { useModal } from '../../hooks/useModal.js';
import Modal from './Modal.jsx';

const TeamModal = lazy(() => import('./TeamModal.jsx'));
const DossierModal = lazy(() => import('./DossierModal.jsx'));
const SponsorModal = lazy(() => import('./SponsorModal.jsx'));
const ArchitectureModal = lazy(() => import('./ArchitectureModal.jsx'));

const REGISTRY = { team: TeamModal, dossier: DossierModal, sponsor: SponsorModal, arch: ArchitectureModal };

/** Renders whichever modal is currently open in ModalContext. */
export default function ModalRoot() {
  const { modal, close } = useModal();
  if (!modal) return null;
  const Body = REGISTRY[modal.type];
  if (!Body) return null;
  return (
    <Modal onClose={close} labelledBy="modal-title">
      <Suspense fallback={<p className="font-mono text-sm text-slate-400">Loading…</p>}>
        {/* key forces a fresh state when switching between modals of the same type */}
        <Body key={`${modal.type}-${modal.props.id ?? ''}`} {...modal.props} onClose={close} />
      </Suspense>
    </Modal>
  );
}
