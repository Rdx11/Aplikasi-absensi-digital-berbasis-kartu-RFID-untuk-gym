import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    HomeIcon, 
    UsersIcon, 
    ClipboardDocumentCheckIcon, 
    CreditCardIcon, 
    ChartBarIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    SunIcon,
    MoonIcon,
    TagIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useTheme } from '../Contexts/ThemeContext';

export default function AuthenticatedLayout({ children, title }) {
    const { auth, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { darkMode, toggleDarkMode } = useTheme();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Member', href: '/members', icon: UsersIcon },
        { name: 'Jenis Member', href: '/membership-types', icon: TagIcon },
        { name: 'Absensi', href: '/attendances', icon: ClipboardDocumentCheckIcon },
        { name: 'Belum Terdaftar', href: '/unregistered', icon: CreditCardIcon },
        { name: 'Rekap', href: '/reports', icon: ChartBarIcon },
    ];

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <img src="/storage/logo/logo.jpg" alt="Bricks Gym" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Bricks Gym</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navigation.map((item) => {
                        // Exact match for dashboard, or startsWith + next char is / or end of string
                        const isActive = currentPath === item.href || 
                            (item.href !== '/dashboard' && currentPath.startsWith(item.href + '/')) ||
                            (item.href !== '/dashboard' && currentPath === item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' 
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User info at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                            <UserCircleIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{auth?.user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{auth?.user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title={darkMode ? 'Light Mode' : 'Dark Mode'}
                            >
                                {darkMode ? (
                                    <SunIcon className="w-5 h-5 text-yellow-500" />
                                ) : (
                                    <MoonIcon className="w-5 h-5 text-gray-600" />
                                )}
                            </button>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
