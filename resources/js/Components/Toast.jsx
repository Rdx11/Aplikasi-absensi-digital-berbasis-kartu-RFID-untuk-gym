import { Toaster } from 'react-hot-toast';

export default function Toast() {
    return (
        <Toaster
            position="top-right"
            containerStyle={{
                top: 20,
                right: 20,
            }}
            toastOptions={{
                duration: 4000,
                className: '!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-white !shadow-lg !border !border-gray-100 dark:!border-gray-700',
                style: {
                    borderRadius: '12px',
                    padding: '12px 16px',
                    animation: 'toast-slide-in 0.3s ease-out',
                },
                success: {
                    iconTheme: {
                        primary: '#f97316',
                        secondary: '#fff',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
}
