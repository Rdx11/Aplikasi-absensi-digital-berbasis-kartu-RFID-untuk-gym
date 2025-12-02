import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { CreditCardIcon, ClockIcon, PlusCircleIcon, TrashIcon, ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '../../Components/ConfirmModal';

export default function UnregisteredIndex({ unregistered }) {
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [loading, setLoading] = useState(false);

    const handleDelete = () => {
        router.delete(`/unregistered/${deleteModal.id}`, {
            onSuccess: () => setDeleteModal({ open: false, id: null }),
        });
    };

    const refresh = () => {
        setLoading(true);
        router.reload({ only: ['unregistered'], onFinish: () => setLoading(false) });
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const isRecent = (dateString) => (new Date() - new Date(dateString)) / (1000 * 60) <= 5;

    return (
        <AuthenticatedLayout title="RFID Belum Terdaftar">
            <Head title="Belum Terdaftar" />

            <div className="bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                    <ExclamationCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-primary-800 dark:text-primary-300 font-medium">Kartu RFID Belum Terdaftar</p>
                        <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">Daftar kartu RFID yang sudah di-scan tapi belum terdaftar sebagai member. Klik "Daftarkan" untuk mendaftarkan kartu sebagai member baru.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <CreditCardIcon className="w-5 h-5" />
                    <span className="font-medium">{unregistered.total || unregistered.data?.length || 0}</span>
                    <span>kartu</span>
                </div>
                <button onClick={refresh} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 bg-white dark:bg-gray-800">
                    <ArrowPathIcon className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} />
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Refresh</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">RFID UID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Waktu Scan</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {unregistered.data?.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center">
                                                <CreditCardIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <code className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono font-medium text-gray-700 dark:text-gray-300">{item.rfid_uid}</code>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <ClockIcon className="w-4 h-4" />{formatDate(item.scan_time)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isRecent(item.scan_time) && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />Baru
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/members/create?rfid_uid=${item.rfid_uid}`} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                                                <PlusCircleIcon className="w-4 h-4" />Daftarkan
                                            </Link>
                                            <button onClick={() => setDeleteModal({ open: true, id: item.id })} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {(!unregistered.data || unregistered.data.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                        <CreditCardIcon className="w-16 h-16 mb-4" />
                        <p className="text-lg font-medium">Tidak ada kartu belum terdaftar</p>
                        <p className="text-sm">Semua kartu RFID yang di-scan sudah terdaftar</p>
                    </div>
                )}
            </div>

            <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })} onConfirm={handleDelete} title="Hapus Data RFID" message="Apakah Anda yakin ingin menghapus data RFID ini?" />
        </AuthenticatedLayout>
    );
}
