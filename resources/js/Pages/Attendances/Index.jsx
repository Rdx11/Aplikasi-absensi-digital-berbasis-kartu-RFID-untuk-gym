import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { CalendarDaysIcon, ClockIcon, UsersIcon, ArrowPathIcon, SignalIcon, CheckCircleIcon, XMarkIcon, MagnifyingGlassIcon, PlusIcon, UserPlusIcon } from '@heroicons/react/24/outline';

export default function AttendancesIndex({ attendances, members, dailyPackages, filters }) {
    const [date, setDate] = useState(filters.date || new Date().toISOString().split('T')[0]);
    const [search, setSearch] = useState(filters.search || '');
    const [loading, setLoading] = useState(false);
    const [isLive, setIsLive] = useState(true);
    const [showManualModal, setShowManualModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMemberData, setSuccessMemberData] = useState(null);
    const [isMemberAttendance, setIsMemberAttendance] = useState(false);
    const intervalRef = useRef(null);
    const lastAttendanceIdRef = useRef(null);
    const isToday = date === new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm({
        is_member: false,
        member_id: '',
        guest_name: '',
        daily_package_id: '',
    });

    useEffect(() => {
        if (attendances.data?.length > 0) {
            lastAttendanceIdRef.current = attendances.data[0].id;
        }
    }, []);

    useEffect(() => {
        if (isLive && isToday) {
            intervalRef.current = setInterval(() => {
                router.reload({ 
                    only: ['attendances'], 
                    preserveState: true,
                    onSuccess: (page) => {
                        const newAttendances = page.props.attendances.data;
                        if (newAttendances?.length > 0) {
                            const newestId = newAttendances[0].id;
                            if (lastAttendanceIdRef.current && newestId !== lastAttendanceIdRef.current) {
                                const attendance = newAttendances[0];
                                // Tampilkan pop-up untuk member
                                if (attendance.is_member && attendance.member) {
                                    setSuccessMemberData({
                                        name: attendance.member.name,
                                        photo: attendance.member.photo,
                                        membership_type: attendance.member.membership_type?.name,
                                        check_in_time: attendance.check_in_time,
                                    });
                                    setShowSuccessModal(true);
                                    setTimeout(() => setShowSuccessModal(false), 5000);
                                }
                                // Tampilkan pop-up untuk non-member
                                else if (!attendance.is_member) {
                                    setSuccessMemberData({
                                        name: attendance.guest_name,
                                        photo: null,
                                        membership_type: attendance.daily_package?.name,
                                        check_in_time: attendance.check_in_time,
                                    });
                                    setShowSuccessModal(true);
                                    setTimeout(() => setShowSuccessModal(false), 5000);
                                }
                            }
                            lastAttendanceIdRef.current = newestId;
                        }
                    }
                });
            }, 3000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isLive, isToday]);

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setDate(newDate);
        setLoading(true);
        router.get('/attendances', { date: newDate, search }, { preserveState: true, onFinish: () => setLoading(false) });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        router.get('/attendances', { date, search }, { preserveState: true, onFinish: () => setLoading(false) });
    };

    const refresh = () => {
        setLoading(true);
        router.reload({ only: ['attendances'], onFinish: () => setLoading(false) });
    };

    const submitManual = (e) => {
        e.preventDefault();
        post('/attendances/manual', {
            onSuccess: (page) => {
                setShowManualModal(false);
                setIsMemberAttendance(false);
                reset();
                
                // Tampilkan pop-up wajah/foto member
                if (isMemberAttendance && page.props.attendances?.data?.[0]) {
                    const attendance = page.props.attendances.data[0];
                    if (attendance.member) {
                        setSuccessMemberData({
                            name: attendance.member.name,
                            photo: attendance.member.photo,
                            membership_type: attendance.member.membership_type?.name,
                            check_in_time: attendance.check_in_time,
                        });
                        setShowSuccessModal(true);
                        setTimeout(() => setShowSuccessModal(false), 5000);
                    }
                } else if (!isMemberAttendance && page.props.attendances?.data?.[0]) {
                    // Untuk non-member, tampilkan nama dan paket
                    const attendance = page.props.attendances.data[0];
                    setSuccessMemberData({
                        name: attendance.guest_name,
                        photo: null,
                        membership_type: attendance.daily_package?.name,
                        check_in_time: attendance.check_in_time,
                    });
                    setShowSuccessModal(true);
                    setTimeout(() => setShowSuccessModal(false), 5000);
                }
            }
        });
    };

    const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return (
        <AuthenticatedLayout title="Absensi">
            <Head title="Absensi" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    <form onSubmit={handleSearch} className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama atau RFID..."
                            className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl w-full sm:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </form>
                    <div className="relative">
                        <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="date" value={date} onChange={handleDateChange} className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <button onClick={refresh} disabled={loading} className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 bg-white dark:bg-gray-800">
                        <ArrowPathIcon className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowManualModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                    >
                        <UserPlusIcon className="w-5 h-5" />
                        Absensi Manual
                    </button>
                    {isToday && (
                        <button
                            onClick={() => setIsLive(!isLive)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                isLive ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <SignalIcon className={`w-4 h-4 ${isLive ? 'animate-pulse' : ''}`} />
                            {isLive ? 'Live' : 'Paused'}
                        </button>
                    )}
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <UsersIcon className="w-5 h-5" />
                        <span className="font-medium">{attendances.total || attendances.data?.length || 0}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">RFID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Waktu Masuk</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {attendances.data?.map((attendance) => (
                                <tr key={attendance.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {attendance.is_member && attendance.member?.photo ? (
                                                    <img src={`/storage/${attendance.member.photo}`} className="w-10 h-10 object-cover" alt="" />
                                                ) : (
                                                    <UsersIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {attendance.is_member ? attendance.member?.name : attendance.guest_name}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {attendance.is_member ? attendance.member?.membership_type?.name : attendance.daily_package?.name}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                            attendance.is_member 
                                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' 
                                                : 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400'
                                        }`}>
                                            {attendance.is_member ? 'Member' : 'Non-Member'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-700 dark:text-gray-300">
                                            {attendance.rfid_uid}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <ClockIcon className="w-4 h-4 text-green-500" />{formatTime(attendance.check_in_time)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {(!attendances.data || attendances.data.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                        <CalendarDaysIcon className="w-16 h-16 mb-4" />
                        <p className="text-lg font-medium">Tidak ada data absensi</p>
                        <p className="text-sm">Belum ada yang absen pada tanggal ini</p>
                    </div>
                )}
            </div>

            {attendances.links && attendances.links.length > 3 && (
                <div className="flex justify-center gap-1 mt-6">
                    {attendances.links.map((link, index) => (
                        <Link key={index} href={link.url || '#'} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${link.active ? 'bg-primary-600 text-white' : link.url ? 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                    ))}
                </div>
            )}

            {/* Modal Absensi Manual */}
            {showManualModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Absensi Manual</h3>
                            <button onClick={() => { setShowManualModal(false); setIsMemberAttendance(false); reset(); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={submitManual} className="p-6 space-y-4">
                            {/* Toggle Member/Non-Member */}
                            <div className="flex gap-3 mb-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMemberAttendance(false);
                                        setData({
                                            is_member: false,
                                            member_id: '',
                                            guest_name: '',
                                            daily_package_id: '',
                                        });
                                    }}
                                    className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                                        !isMemberAttendance
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    Non-Member
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMemberAttendance(true);
                                        setData({
                                            is_member: true,
                                            member_id: '',
                                            guest_name: '',
                                            daily_package_id: '',
                                        });
                                    }}
                                    className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                                        isMemberAttendance
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    Member
                                </button>
                            </div>

                            {/* Member Form */}
                            {isMemberAttendance ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Pilih Member<span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.member_id}
                                        onChange={(e) => setData('member_id', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Cari member...</option>
                                        {members?.map((member) => (
                                            <option key={member.id} value={member.id}>
                                                {member.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.member_id && <p className="text-red-500 text-sm mt-1">{errors.member_id}</p>}
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Nama Lengkap<span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.guest_name}
                                            onChange={(e) => setData('guest_name', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Masukkan nama lengkap"
                                        />
                                        {errors.guest_name && <p className="text-red-500 text-sm mt-1">{errors.guest_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Paket Harian<span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.daily_package_id}
                                            onChange={(e) => setData('daily_package_id', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="">Pilih paket harian</option>
                                            {dailyPackages?.map((pkg) => (
                                                <option key={pkg.id} value={pkg.id}>
                                                    {pkg.name} - Rp {Number(pkg.price).toLocaleString('id-ID')}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.daily_package_id && <p className="text-red-500 text-sm mt-1">{errors.daily_package_id}</p>}
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Absensi'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowManualModal(false); setIsMemberAttendance(false); reset(); }}
                                    className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Foto Member - Absensi RFID & Manual */}
            {showSuccessModal && successMemberData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
                        <div className="bg-green-500 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white">
                                <CheckCircleIcon className="w-6 h-6" />
                                <span className="font-semibold text-lg">Check-in Berhasil!</span>
                            </div>
                            <button onClick={() => setShowSuccessModal(false)} className="text-white/80 hover:text-white">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 text-center">
                            <div className="w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden border-4 border-green-500 shadow-lg">
                                {successMemberData.photo ? (
                                    <img src={`/storage/${successMemberData.photo}`} alt={successMemberData.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                                        <UsersIcon className="w-20 h-20 text-primary-600 dark:text-primary-400" />
                                    </div>
                                )}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{successMemberData.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-3">{successMemberData.membership_type || 'Member'}</p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                                <ClockIcon className="w-5 h-5 text-green-500" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">{formatTime(successMemberData.check_in_time)}</span>
                            </div>
                        </div>
                        <div className="px-6 pb-6">
                            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 animate-shrink-width" />
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-2">Otomatis tertutup dalam 5 detik</p>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes shrink-width { from { width: 100%; } to { width: 0%; } }
                .animate-shrink-width { animation: shrink-width 5s linear forwards; }
            `}</style>
        </AuthenticatedLayout>
    );
}
