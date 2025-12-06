import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { UsersIcon, ClipboardDocumentListIcon, ArrowDownTrayIcon, BanknotesIcon } from '@heroicons/react/24/outline';

export default function Income({ stats, incomeByMembershipType, incomeByDailyPackage, dailyIncome, filters }) {
    const reportTabs = [
        { name: 'Rekap Absensi', href: '/reports', icon: ClipboardDocumentListIcon, current: false },
        { name: 'Laporan Member', href: '/reports/members', icon: UsersIcon, current: false },
        { name: 'Rekap Pendapatan', href: '/reports/income', icon: BanknotesIcon, current: true },
    ];

    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);

    const handleFilter = () => {
        router.get('/reports/income', {
            date_from: dateFrom,
            date_to: dateTo,
        }, { preserveState: true });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <AuthenticatedLayout title="Rekap Pendapatan">
            <Head title="Rekap Pendapatan" />

            {/* Report Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-2 mb-6">
                <nav className="flex space-x-2">
                    {reportTabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                tab.current
                                    ? 'bg-primary-600 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.name}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Dari Tanggal</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Sampai Tanggal</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleFilter}
                            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                        >
                            Terapkan Filter
                        </button>
                        <a
                            href={`/reports/income/export?date_from=${dateFrom}&date_to=${dateTo}`}
                            className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            Export Excel
                        </a>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Pendapatan</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalIncome)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dari Membership</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.membershipIncome)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dari Paket Harian</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.dailyPackageIncome)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Member Baru</p>
                    <p className="text-2xl font-bold text-primary-600">{stats.newMembersCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kunjungan Harian</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.dailyVisitsCount}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Income by Membership Type */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Pendapatan per Tipe Membership</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tipe</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Harga</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Member Baru</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {incomeByMembershipType.map((type) => (
                                    <tr key={type.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{type.name}</td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatCurrency(type.price)}</td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{type.new_members}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-green-600">{formatCurrency(type.total_income)}</td>
                                    </tr>
                                ))}
                                {incomeByMembershipType.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            Tidak ada data
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Income by Daily Package */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Pendapatan per Paket Harian</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Paket</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Harga</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Penggunaan</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {incomeByDailyPackage.map((pkg) => (
                                    <tr key={pkg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{pkg.name}</td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatCurrency(pkg.price)}</td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{pkg.usage_count}x</td>
                                        <td className="px-4 py-3 text-right font-semibold text-green-600">{formatCurrency(pkg.total_income)}</td>
                                    </tr>
                                ))}
                                {incomeByDailyPackage.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            Tidak ada data
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Daily Income Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Pendapatan Harian</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Membership</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paket Harian</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {dailyIncome.map((day, index) => (
                                <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${day.total > 0 ? '' : 'opacity-50'}`}>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{formatDate(day.date)}</td>
                                    <td className="px-6 py-4 text-right text-blue-600">{formatCurrency(day.membership_income)}</td>
                                    <td className="px-6 py-4 text-right text-orange-600">{formatCurrency(day.daily_package_income)}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-green-600">{formatCurrency(day.total)}</td>
                                </tr>
                            ))}
                            {dailyIncome.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Tidak ada data pendapatan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Total</td>
                                <td className="px-6 py-4 text-right font-semibold text-blue-600">{formatCurrency(stats.membershipIncome)}</td>
                                <td className="px-6 py-4 text-right font-semibold text-orange-600">{formatCurrency(stats.dailyPackageIncome)}</td>
                                <td className="px-6 py-4 text-right font-bold text-green-600">{formatCurrency(stats.totalIncome)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
