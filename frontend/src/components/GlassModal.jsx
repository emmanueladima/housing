import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Card } from '@heroui/card';
import { FiX } from 'react-icons/fi';

const GlassModal = ({ children, onClose, className = "" }) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const modalContent = (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            <div
                className={`w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 ${className}`}
                onClick={e => e.stopPropagation()}
            >
                <Card
                    isBlurred
                    className="w-full h-full border border-white/20 bg-white/10 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col"
                >
                    {children}
                </Card>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default GlassModal;
