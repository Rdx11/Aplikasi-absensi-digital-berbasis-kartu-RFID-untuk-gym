import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon, CurrencyDollarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '../../Components/ConfirmModal';

export default function DailyPackagesIndex({ packages }) {
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });

    const handleDelete = () => {
        router.delete(`/daily-packages/${deleteModal.id}`, {
            onSuccess: () => setDeleteModal({ open: false, id: null, name: '' }),
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    };

    return (
        <AuthenticatedLayout title="Paket Harian">
            <Head title="Paket Harian" />

            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-500 dark:text-gray-400">Kelola paket harian untuk non-member</p>
                <Link href="/daily-packages/create" className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium">
                    <PlusIcon className="w-5 h-5" />
                    Tambah Paket
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Paket</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Harga</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {packages.data.map((pkg) => (
                                <tr key={pkg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center">
                                                <CurrencyDollarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{pkg.name}</p>
                                                {pkg.description && <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{pkg.description}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">{formatPrice(pkg.price)}</td>
                                    <td className="px-6 py-4">
                                        {pkg.is_active ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                                <CheckCircleIcon className="w-3.5 h-3.5" />Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                                                <XCircleIcon className="w-3.5 h-3.5" />Nonaktif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/daily-packages/${pkg.id}/edit`} className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors">
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </Link>
                                            <button onClick={() => setDeleteModal({ open: true, id: pkg.id, name: pkg.name })} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {packages.data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                        <CurrencyDollarIcon className="w-12 h-12 mb-3" />
                        <p>Tidak ada paket harian</p>
                    </div>
                )}
            </div>

            {packages.links && packages.links.length > 3 && (
                <div className="flex justify-center gap-1 mt-6">
                    {packages.links.map((link, index) => (
                        <Link key={index} href={link.url || '#'} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${link.active ? 'bg-primary-600 text-white' : link.url ? 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                    ))}
                </div>
            )}

            <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null, name: '' })} onConfirm={handleDelete} title="Hapus Paket Harian" message={`Apakah Anda yakin ingin menghapus "${deleteModal.name}"?`} />
        </AuthenticatedLayout>
    );
}
