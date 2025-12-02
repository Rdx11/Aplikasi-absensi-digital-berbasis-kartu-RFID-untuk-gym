import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    MagnifyingGlassIcon, 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon,
    UsersIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import ConfirmModal from '../../Components/ConfirmModal';

export default function MembersIndex({ members, membershipTypes, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/members', { ...filters, search }, { preserveState: true });
    };

    const handleFilter = (key, value) => {
        router.get('/members', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleDelete = () => {
        router.delete(`/members/${deleteModal.id}`, {
            onSuccess: () => setDeleteModal({ open: false, id: null, name: '' }),
        });
    };

    const statusStyles = {
        active: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400',
        inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
        expired: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400',
    };

    const statusLabels = {
        active: 'Aktif',
        inactive: 'Tidak Aktif',
        expired: 'Expired',
    };

    return (
        <AuthenticatedLayout title="Member">
            <Head title="Member" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <form onSubmit={handleSearch} className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama, phone, RFID..."
                            className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl w-full sm:w-72 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </form>
                    <div className="relative">
                        <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={filters.status || 'all'}
                            onChange={(e) => handleFilter('status', e.target.value)}
                            className="pl-10 pr-8 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Tidak Aktif</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>
                <Link
                    href="/members/create"
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                >
                    <PlusIcon className="w-5 h-5" />
                    Tambah Member
                </Link>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">RFID UID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Membership</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expired</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {members.data.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {member.photo ? (
                                                    <img src={`/storage/${member.photo}`} className="w-10 h-10 object-cover" alt="" />
                                                ) : (
                                                    <UsersIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{member.email || '-'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-700 dark:text-gray-300">{member.rfid_uid}</code>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{member.phone}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{member.membership_type?.name || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{member.membership_end_date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[member.status]}`}>
                                            {statusLabels[member.status]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/members/${member.id}/edit`}
                                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => setDeleteModal({ open: true, id: member.id, name: member.name })}
                                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {members.data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                        <UsersIcon className="w-12 h-12 mb-3" />
                        <p>Tidak ada data member</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {members.links && members.links.length > 3 && (
                <div className="flex justify-center gap-1 mt-6">
                    {members.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                link.active 
                                    ? 'bg-primary-600 text-white' 
                                    : link.url 
                                        ? 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600' 
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title="Hapus Member"
                message={`Apakah Anda yakin ingin menghapus member "${deleteModal.name}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </AuthenticatedLayout>
    );
}
