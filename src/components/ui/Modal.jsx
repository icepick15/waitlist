import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, panelClassName = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="app-modal" role="dialog" aria-modal="true">
      <div className="app-modal__backdrop" onClick={onClose} />

      <div className="app-modal__viewport">
        <div className={`app-modal__panel ${panelClassName}`.trim()}>
          <div className="app-modal__header">
            <div className="app-modal__title">{title}</div>
            <button onClick={onClose} className="app-modal__close" aria-label="Close modal">
              <X size={18} />
            </button>
          </div>

          <div className="app-modal__body">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

