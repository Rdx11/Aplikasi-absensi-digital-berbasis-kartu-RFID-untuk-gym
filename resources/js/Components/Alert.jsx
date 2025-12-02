import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Alert({ type = 'info', message, onClose }) {
    const styles = {
        success: {
            bg: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800',
            icon: CheckCircleIcon,
            iconColor: 'text-green-500 dark:text-green-400',
            textColor: 'text-green-800 dark:text-green-300',
        },
        error: {
            bg: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
            icon: XCircleIcon,
            iconColor: 'text-red-500 dark:text-red-400',
            textColor: 'text-red-800 dark:text-red-300',
        },
        warning: {
            bg: 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800',
            icon: ExclamationTriangleIcon,
            iconColor: 'text-orange-500 dark:text-orange-400',
            textColor: 'text-orange-800 dark:text-orange-300',
        },
        info: {
            bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
            icon: InformationCircleIcon,
            iconColor: 'text-blue-500 dark:text-blue-400',
            textColor: 'text-blue-800 dark:text-blue-300',
        },
    };

    const style = styles[type];
    const Icon = style.icon;

    return (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${style.bg}`}>
            <Icon className={`w-5 h-5 flex-shrink-0 ${style.iconColor}`} />
            <p className={`flex-1 text-sm ${style.textColor}`}>{message}</p>
            {onClose && (
                <button onClick={onClose} className={`p-1 rounded hover:bg-white/50 dark:hover:bg-black/20 ${style.textColor}`}>
                    <XMarkIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
