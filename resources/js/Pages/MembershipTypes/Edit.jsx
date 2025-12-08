import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeftIcon, TagIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function MembershipTypesEdit({ membershipType }) {
    const { data, setData, put, processing, errors } = useForm({
        name: membershipType.name || '',
        duration_type: membershipType.duration_type || 'monthly',
        duration_days: membershipType.duration_days || 30,
        price: membershipType.price || 0,
        renewal_price: membershipType.renewal_price || 0,
        description: membershipType.description || '',
        is_active: membershipType.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/membership-types/${membershipType.id}`);
    };

    const inputClass = "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";

    return (
        <AuthenticatedLayout title="Edit Jenis Member">
            <Head title="Edit Jenis Member" />

            <div className="max-w-2xl mx-auto">
                <Link href="/membership-types" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6">
                    <ArrowLeftIcon className="w-4 h-4" />Kembali
                </Link>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Jenis Membership</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Perbarui informasi jenis membership</p>
                    </div>

                    <form onSubmit={submit} className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nama Jenis <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={`${inputClass} pl-10`} />
                            </div>
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tipe Durasi <span className="text-red-500">*</span>
                                </label>
                                <select value={data.duration_type} onChange={(e) => setData('duration_type', e.target.value)} className={inputClass}>
                                    <option value="daily">Harian</option>
                                    <option value="monthly">Bulanan</option>
                                    <option value="6_months">6 Bulan</option>
                                    <option value="yearly">Tahunan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Durasi (Hari) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="number" value={data.duration_days} onChange={(e) => setData('duration_days', parseInt(e.target.value))} className={`${inputClass} pl-10`} min="1" />
                                </div>
                                {errors.duration_days && <p className="text-red-500 text-sm mt-1">{errors.duration_days}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Harga Member Baru <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Rp</span>
                                    <input type="number" value={data.price} onChange={(e) => setData('price', parseFloat(e.target.value))} className={`${inputClass} pl-12`} min="0" />
                                </div>
                                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Harga Perpanjangan <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Rp</span>
                                    <input type="number" value={data.renewal_price} onChange={(e) => setData('renewal_price', parseFloat(e.target.value))} className={`${inputClass} pl-12`} min="0" />
                                </div>
                                {errors.renewal_price && <p className="text-red-500 text-sm mt-1">{errors.renewal_price}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deskripsi</label>
                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className={`${inputClass} resize-none`} rows="3" />
                        </div>

                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="is_active" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500" />
                            <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">Aktifkan jenis membership ini</label>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <Link href="/membership-types" className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">Batal</Link>
                            <button type="submit" disabled={processing} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2">
                                {processing && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                                {processing ? 'Menyimpan...' : 'Update'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
