import { useEffect } from 'react';
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

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            <div className="w-full max-w-6xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <Card isBlurred className="w-full h-full border border-white/20 bg-white/10 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col">
                    {/* Fixed Header */}
                    <div className="flex items-center justify-end px-5 py-4 border-b border-gray-200/20 flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg transition-colors hover:bg-white/10 text-white hover:text-gray-200"
                        >
                            <FiX size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <ListingDetailContent listingId={listingId} onClose={onClose} isModal={true} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ListingDetailModal;

