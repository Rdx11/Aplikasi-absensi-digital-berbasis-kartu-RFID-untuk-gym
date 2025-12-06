import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { CalendarDaysIcon, UsersIcon, ChartBarIcon, ArrowTrendingUpIcon, FunnelIcon, ArrowDownTrayIcon, UserGroupIcon, ClipboardDocumentListIcon, CurrencyDollarIcon, BanknotesIcon } from '@heroicons/react/24/outline';

export default function ReportsIndex({ stats, memberStats, nonMemberStats, members, filters }) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [memberId, setMemberId] = useState(filters.member_id || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [loading, setLoading] = useState(false);

    const handleFilter = () => {
        setLoading(true);
        router.get('/reports', { date_from: dateFrom, date_to: dateTo, member_id: memberId || null, status }, { preserveState: true, onFinish: () => setLoading(false) });
    };

    const setQuickFilter = (days) => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - days);
        setDateFrom(from.toISOString().split('T')[0]);
        setDateTo(to.toISOString().split('T')[0]);
    };

    const statCards = [
        { title: 'Total Kehadiran', value: stats.totalAttendances, icon: ChartBarIcon, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/30' },
        { title: 'Member', value: stats.memberAttendances, icon: UsersIcon, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/30' },
        { title: 'Non-Member', value: stats.nonMemberAttendances, icon: UserGroupIcon, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/30' },
        { title: 'Rata-rata/Hari', value: stats.avgPerDay, icon: ArrowTrendingUpIcon, color: 'text-primary-600 dark:text-primary-400', bgColor: 'bg-primary-50 dark:bg-primary-900/30' },
    ];

    const inputClass = "pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500";

    const reportTabs = [
        { name: 'Rekap Absensi', href: '/reports', icon: ClipboardDocumentListIcon, current: true },
        { name: 'Laporan Member', href: '/reports/members', icon: UsersIcon, current: false },
        { name: 'Rekap Pendapatan', href: '/reports/income', icon: BanknotesIcon, current: false },
    ];

    return (
        <AuthenticatedLayout title="Rekap Absensi">
            <Head title="Rekap" />

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

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <FunnelIcon className="w-5 h-5 text-gray-400" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Filter Data</h3>
                </div>
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Dari Tanggal</label>
                        <div className="relative">
                            <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Sampai Tanggal</label>
                        <div className="relative">
                            <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[150px]">
                            <option value="all">Semua</option>
                            <option value="member">Member</option>
                            <option value="non-member">Non-Member</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Member</label>
                        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[200px]">
                            <option value="">Semua Member</option>
                            {members.map((member) => (<option key={member.id} value={member.id}>{member.name}</option>))}
                        </select>
                    </div>
                    <button onClick={handleFilter} disabled={loading} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2">
                        {loading && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                        Terapkan Filter
                    </button>
                    <a 
                        href={`/reports/export?date_from=${dateFrom}&date_to=${dateTo}${memberId ? `&member_id=${memberId}` : ''}&status=${status}`}
                        className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Export Excel
                    </a>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Cepat:</span>
                    {[{ label: 'Hari Ini', days: 0 }, { label: '7 Hari', days: 7 }, { label: '30 Hari', days: 30 }, { label: '3 Bulan', days: 90 }].map((item) => (
                        <button key={item.days} onClick={() => setQuickFilter(item.days)} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{item.label}</button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                                <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${card.bgColor}`}><card.icon className={`w-6 h-6 ${card.color}`} /></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Member Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Kehadiran Member</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Hadir</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Persentase</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {memberStats.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {item.member?.photo ? <img src={`/storage/${item.member.photo}`} className="w-10 h-10 object-cover" alt="" /> : <UsersIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">{item.member?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><span className="font-semibold text-gray-900 dark:text-white">{item.total}</span><span className="text-gray-500 dark:text-gray-400 ml-1">kali</span></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 max-w-[200px] bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                                <div className="bg-primary-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(item.percentage, 100)}%` }} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 w-12">{item.percentage}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {memberStats.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                        <UsersIcon className="w-12 h-12 mb-3" />
                        <p>Tidak ada data kehadiran member</p>
                    </div>
                )}
            </div>

            {/* Non-Member Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Kehadiran Non-Member</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paket</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Hadir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {nonMemberStats?.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                                                <UserGroupIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">{item.guest_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 rounded-lg text-sm">
                                            {item.daily_package?.name || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4"><span className="font-semibold text-gray-900 dark:text-white">{item.total}</span><span className="text-gray-500 dark:text-gray-400 ml-1">kali</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {(!nonMemberStats || nonMemberStats.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                        <UserGroupIcon className="w-12 h-12 mb-3" />
                        <p>Tidak ada data kehadiran non-member</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
