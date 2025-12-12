import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { compressImage } from '../../Utils/imageCompressor';

export default function MembersCreate({ membershipTypes, rfidUid }) {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(null);
    const [compressing, setCompressing] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        rfid_uid: rfidUid || '',
        name: '',
        phone: '',
        birth_date: '',
        gender: '',
        address: '',
        membership_type_id: '',
        membership_start_date: new Date().toISOString().split('T')[0],
        membership_end_date: '',
        status: true,
        photo: null,
    });

    const handleMembershipChange = (e) => {
        const typeId = e.target.value;
        const type = membershipTypes.find(t => t.id == typeId);
        
        if (type && data.membership_start_date) {
            const startDate = new Date(data.membership_start_date);
            startDate.setDate(startDate.getDate() + type.duration_days);
            setData(prev => ({
                ...prev,
                membership_type_id: typeId,
                membership_end_date: startDate.toISOString().split('T')[0],
            }));
        } else {
            setData('membership_type_id', typeId);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = async (file) => {
        if (file && file.type.startsWith('image/')) {
            setCompressing(true);
            try {
                // Compress image sebelum upload (max 800px, quality 80%, max 1MB)
                const compressedFile = await compressImage(file, {
                    maxWidth: 800,
                    maxHeight: 800,
                    quality: 0.8,
                    maxSizeMB: 1
                });
                setData('photo', compressedFile);
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result);
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                console.error('Error compressing image:', error);
                // Fallback ke file asli jika compress gagal
                setData('photo', file);
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result);
                reader.readAsDataURL(file);
            } finally {
                setCompressing(false);
            }
        }
    };

    const [dateError, setDateError] = useState('');

    // Validasi tanggal
    useEffect(() => {
        if (data.membership_start_date && data.membership_end_date) {
            if (new Date(data.membership_start_date) > new Date(data.membership_end_date)) {
                setDateError('Tanggal mulai keanggotaan tidak boleh lebih dari tanggal akhir keanggotaan');
            } else {
                setDateError('');
            }
        }
    }, [data.membership_start_date, data.membership_end_date]);

    const submit = (e) => {
        e.preventDefault();
        if (dateError) return;
        post('/members');
    };

    const inputClass = "w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm";

    return (
        <AuthenticatedLayout title="Tambah Member">
            <Head title="Tambah Member" />

            <form onSubmit={submit}>
                {/* RFID Section - Only show if rfidUid exists */}
                {rfidUid && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="font-semibold text-gray-900 dark:text-white">RFID</h2>
                        </div>
                        <div className="p-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">RFID UID</label>
                                <input type="text" value={data.rfid_uid} readOnly className={`${inputClass} bg-gray-50 dark:bg-gray-700`} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Informasi Pribadi */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="font-semibold text-gray-900 dark:text-white">Informasi Pribadi</h2>
                    </div>
                    <div className="p-6 space-y-5">
                        {/* RFID if not from unregistered */}
                        {!rfidUid && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    RFID UID<span className="text-red-500">*</span>
                                </label>
                                <input type="text" value={data.rfid_uid} onChange={(e) => setData('rfid_uid', e.target.value)} className={inputClass} placeholder="Scan kartu RFID" />
                                {errors.rfid_uid && <p className="text-red-500 text-sm mt-1">{errors.rfid_uid}</p>}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Nama Lengkap<span className="text-red-500">*</span>
                                </label>
                                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputClass} />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">No. Telepon</label>
                                <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className={inputClass} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tanggal Lahir</label>
                                <input type="date" value={data.birth_date} onChange={(e) => setData('birth_date', e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Jenis Kelamin</label>
                                <select value={data.gender} onChange={(e) => setData('gender', e.target.value)} className={inputClass}>
                                    <option value="">Pilih jenis kelamin</option>
                                    <option value="male">Laki-laki</option>
                                    <option value="female">Perempuan</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Alamat</label>
                            <textarea value={data.address} onChange={(e) => setData('address', e.target.value)} className={`${inputClass} resize-y`} rows="3" />
                        </div>
                    </div>
                </div>

                {/* Informasi Keanggotaan */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="font-semibold text-gray-900 dark:text-white">Informasi Keanggotaan</h2>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Jenis Keanggotaan<span className="text-red-500">*</span>
                                </label>
                                <select value={data.membership_type_id} onChange={handleMembershipChange} className={inputClass}>
                                    <option value="">Pilih jenis keanggotaan</option>
                                    {membershipTypes.map((type) => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                                {errors.membership_type_id && <p className="text-red-500 text-sm mt-1">{errors.membership_type_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Mulai Keanggotaan<span className="text-red-500">*</span>
                                </label>
                                <input type="date" value={data.membership_start_date} onChange={(e) => setData('membership_start_date', e.target.value)} className={inputClass} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Berakhir Keanggotaan<span className="text-red-500">*</span>
                                </label>
                                <input type="date" value={data.membership_end_date} onChange={(e) => setData('membership_end_date', e.target.value)} className={inputClass} />
                                {dateError && <p className="text-red-500 text-sm mt-1">{dateError}</p>}
                            </div>
                            <div className="flex items-center gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setData('status', !data.status)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${data.status ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.status ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm text-gray-700 dark:text-gray-300">Status Aktif</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Foto */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="font-semibold text-gray-900 dark:text-white">Foto</h2>
                    </div>
                    <div className="p-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Foto Anggota</label>
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                        >
                            {compressing ? (
                                <div className="flex flex-col items-center">
                                    <svg className="animate-spin w-8 h-8 text-primary-600 mb-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <p className="text-gray-500 dark:text-gray-400">Mengompresi gambar...</p>
                                </div>
                            ) : preview ? (
                                <div className="flex flex-col items-center">
                                    <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mb-3" />
                                    <button type="button" onClick={() => { setPreview(null); setData('photo', null); }} className="text-sm text-red-600 hover:text-red-700">Hapus foto</button>
                                </div>
                            ) : (
                                <>
                                    <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} className="hidden" id="photo-upload" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Drag & Drop your files or{' '}
                                        <label htmlFor="photo-upload" className="text-primary-600 hover:text-primary-700 cursor-pointer font-medium">Browse</label>
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button type="submit" disabled={processing} className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm disabled:opacity-50">
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <Link href="/members" className="px-5 py-2.5 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors font-medium text-sm">
                        Batal
                    </Link>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
