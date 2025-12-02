import { useEffect, useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Hapus', confirmColor = 'red' }) {
    const [show, setShow] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
            setTimeout(() => setAnimate(true), 10);
        } else {
            setAnimate(false);
            setTimeout(() => setShow(false), 200);
        }
    }, [isOpen]);

    if (!show) return null;

    const colors = {
        red: 'bg-red-500 hover:bg-red-600',
        orange: 'bg-primary-600 hover:bg-primary-700',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className={`fixed inset-0 bg-black transition-opacity duration-200 ${animate ? 'opacity-50' : 'opacity-0'}`}
                    onClick={onClose}
                />
                
                {/* Modal */}
                <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md transform transition-all duration-200 ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <div className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${colors[confirmColor]}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
