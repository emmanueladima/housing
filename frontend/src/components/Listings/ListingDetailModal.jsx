import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FiX } from 'react-icons/fi';
import { Card } from '@heroui/card';
import ListingDetailContent from './ListingDetailContent';

const ListingDetailModal = ({ listingId, onClose }) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!listingId) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className="relative w-full max-w-6xl h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <Card isBlurred className="w-full h-full border border-white/20 bg-white/10 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col">
                    {/* Fixed Header */}
                    <div className="flex items-center justify-end px-5 py-4 border-b border-white/10 flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full transition-colors hover:bg-white/20 text-white hover:text-gray-200"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <ListingDetailContent listingId={listingId} onClose={onClose} isModal={true} />
                    </div>
                </Card>
            </div>
        </div>,
        document.body
    );
};

export default ListingDetailModal;
