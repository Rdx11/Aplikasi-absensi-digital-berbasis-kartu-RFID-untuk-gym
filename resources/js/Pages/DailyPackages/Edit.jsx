import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function DailyPackagesEdit({ package: pkg }) {
    const { data, setData, put, processing, errors } = useForm({
        name: pkg.name || '',
        description: pkg.description || '',
        price: pkg.price || '',
        is_active: pkg.is_active,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/daily-packages/${pkg.id}`);
    };

    const inputClass = "w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm";

    return (
        <AuthenticatedLayout title="Edit Paket Harian">
            <Head title="Edit Paket Harian" />

            <form onSubmit={submit}>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="font-semibold text-gray-900 dark:text-white">Informasi Paket</h2>
                    </div>
                    <div className="p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Nama Paket<span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputClass} />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Deskripsi</label>
                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className={`${inputClass} resize-y`} rows="3" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Harga<span className="text-red-500">*</span>
                            </label>
                            <input type="number" value={data.price} onChange={(e) => setData('price', e.target.value)} className={inputClass} />
                            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setData('is_active', !data.is_active)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${data.is_active ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <span className="text-sm text-gray-700 dark:text-gray-300">Status Aktif</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button type="submit" disabled={processing} className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm disabled:opacity-50">
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <Link href="/daily-packages" className="px-5 py-2.5 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors font-medium text-sm">
                        Batal
                    </Link>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
