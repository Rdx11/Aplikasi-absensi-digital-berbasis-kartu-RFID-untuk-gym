import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { UsersIcon, ClipboardDocumentListIcon, BanknotesIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function Members({ stats, membersByType, membersByGender, membersList, filters }) {
    const reportTabs = [
        { name: 'Rekap Absensi', href: '/reports', icon: ClipboardDocumentListIcon, current: false },
        { name: 'Laporan Member', href: '/reports/members', icon: UsersIcon, current: true },
        { name: 'Rekap Pendapatan', href: '/reports/income', icon: BanknotesIcon, current: false },
    ];
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [filterType, setFilterType] = useState(filters.type || 'all');

    const handleFilter = () => {
        router.get('/reports/members', {
            date_from: dateFrom,
            date_to: dateTo,
            type: filterType,
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
        <AuthenticatedLayout title="Laporan Member">
            <Head title="Laporan Member" />

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
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Tipe Member</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[180px]"
                        >
                            <option value="all">Semua Member</option>
                            <option value="new">Member Baru</option>
                            <option value="expiring">Segera Expired</option>
                            <option value="active">Member Aktif</option>
                            <option value="expired">Member Expired</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleFilter}
                            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                        >
                            Terapkan Filter
                        </button>
                        <a
                            href={`/reports/members/export?date_from=${dateFrom}&date_to=${dateTo}&type=${filterType}`}
                            className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            Export Excel
                        </a>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Member</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMembers}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Member Aktif</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeMembers}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Member Expired</p>
                    <p className="text-2xl font-bold text-red-600">{stats.expiredMembers}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Member Nonaktif</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.inactiveMembers}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Member Baru</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.newMembers}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Segera Expired</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Members by Type */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Member per Tipe Membership</h3>
                    </div>
                    <div className="p-4">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                                    <th className="pb-2">Tipe</th>
                                    <th className="pb-2 text-right">Harga</th>
                                    <th className="pb-2 text-right">Total</th>
                                    <th className="pb-2 text-right">Aktif</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-900 dark:text-white">
                                {membersByType.map((type) => (
                                    <tr key={type.id} className="border-t border-gray-100 dark:border-gray-700">
                                        <td className="py-2">{type.name}</td>
                                        <td className="py-2 text-right">{formatCurrency(type.price)}</td>
                                        <td className="py-2 text-right">{type.total_members}</td>
                                        <td className="py-2 text-right text-green-600">{type.active_members}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Members by Gender */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Member per Gender</h3>
                    </div>
                    <div className="p-4">
                        <div className="flex justify-around items-center h-32">
                            <div className="text-center">
                                <div className="text-4xl mb-2">👨</div>
                                <p className="text-2xl font-bold text-blue-600">{membersByGender.male}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Laki-laki</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl mb-2">👩</div>
                                <p className="text-2xl font-bold text-pink-600">{membersByGender.female}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Perempuan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Members List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        {filterType === 'new' && `Member Baru (${formatDate(dateFrom)} - ${formatDate(dateTo)})`}
                        {filterType === 'expiring' && 'Member Segera Expired (30 Hari ke Depan)'}
                        {filterType === 'active' && 'Member Aktif'}
                        {filterType === 'expired' && 'Member Expired'}
                        {filterType === 'all' && 'Semua Member'}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">No. HP</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipe</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tgl Daftar</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Berlaku Sampai</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {membersList.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Tidak ada data member
                                    </td>
                                </tr>
                            ) : (
                                membersList.map((member) => {
                                    const daysLeft = member.membership_end_date 
                                        ? Math.ceil((new Date(member.membership_end_date) - new Date()) / (1000 * 60 * 60 * 24))
                                        : null;
                                    return (
                                        <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{member.name}</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{member.phone}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 rounded-lg text-sm">
                                                    {member.membership_type?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-sm font-medium ${
                                                    member.status === 'active' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                                                        : member.status === 'expired'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                                }`}>
                                                    {member.status === 'active' ? 'Aktif' : member.status === 'expired' ? 'Expired' : 'Nonaktif'}
                                                    {filterType === 'expiring' && daysLeft !== null && ` (${daysLeft} hari)`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{formatDate(member.created_at)}</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                {member.membership_end_date ? formatDate(member.membership_end_date) : '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
