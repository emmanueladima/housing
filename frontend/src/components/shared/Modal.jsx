import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop with strong blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full ${sizes[size]} bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl shadow-black/20 transform transition-all animate-fadeIn`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Only show if title is provided */}
          {title ? (
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
          ) : (
            /* Close button for headerless modals */
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <FiX size={24} />
            </button>
          )}

          {/* Content */}
          <div className={title ? "p-6" : "p-6 pt-10"}>{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
