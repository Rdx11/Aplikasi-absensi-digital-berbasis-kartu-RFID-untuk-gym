import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { CalendarDaysIcon, ClockIcon, UsersIcon, ArrowPathIcon, SignalIcon, CheckCircleIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function AttendancesIndex({ attendances, members, filters }) {
    const [date, setDate] = useState(filters.date || new Date().toISOString().split('T')[0]);
    const [search, setSearch] = useState(filters.search || '');
    const [loading, setLoading] = useState(false);
    const [isLive, setIsLive] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [latestMember, setLatestMember] = useState(null);
    const intervalRef = useRef(null);
    const lastAttendanceIdRef = useRef(null);
    const isToday = date === new Date().toISOString().split('T')[0];

    // Set initial last attendance ID
    useEffect(() => {
        if (attendances.data?.length > 0) {
            lastAttendanceIdRef.current = attendances.data[0].id;
        }
    }, []);

    // Auto refresh dan deteksi absensi baru
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
                            // Jika ada absensi baru
                            if (lastAttendanceIdRef.current && newestId !== lastAttendanceIdRef.current) {
                                const newMember = newAttendances[0].member;
                                if (newMember) {
                                    setLatestMember({
                                        ...newMember,
                                        check_in_time: newAttendances[0].check_in_time
                                    });
                                    setShowModal(true);
                                    // Auto close setelah 5 detik
                                    setTimeout(() => setShowModal(false), 5000);
                                }
                            }
                            lastAttendanceIdRef.current = newestId;
                        }
                    }
                });
            }, 3000);
        }
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
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
                <div className="flex items-center gap-4">
                    {isToday && (
                        <button
                            onClick={() => setIsLive(!isLive)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                isLive 
                                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' 
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <SignalIcon className={`w-4 h-4 ${isLive ? 'animate-pulse' : ''}`} />
                            {isLive ? 'Live' : 'Paused'}
                        </button>
                    )}
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <UsersIcon className="w-5 h-5" />
                        <span className="font-medium">{attendances.total || attendances.data?.length || 0}</span>
                        <span>absensi</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
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
                                                {attendance.member?.photo ? <img src={`/storage/${attendance.member.photo}`} className="w-10 h-10 object-cover" alt="" /> : <UsersIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{attendance.member?.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{attendance.member?.membership_type?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-700 dark:text-gray-300">{attendance.rfid_uid}</code></td>
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
                        <p className="text-sm">Belum ada member yang absen pada tanggal ini</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {attendances.links && attendances.links.length > 3 && (
                <div className="flex justify-center gap-1 mt-6">
                    {attendances.links.map((link, index) => (
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

            {/* Modal Foto Member */}
            {showModal && latestMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-green-500 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white">
                                <CheckCircleIcon className="w-6 h-6" />
                                <span className="font-semibold text-lg">Check-in Berhasil!</span>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6 text-center">
                            {/* Foto */}
                            <div className="w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden border-4 border-green-500 shadow-lg">
                                {latestMember.photo ? (
                                    <img 
                                        src={`/storage/${latestMember.photo}`} 
                                        alt={latestMember.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                                        <UsersIcon className="w-20 h-20 text-primary-600 dark:text-primary-400" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Info */}
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {latestMember.name}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-3">
                                {latestMember.membership_type?.name || 'Member'}
                            </p>
                            
                            {/* Waktu */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                                <ClockIcon className="w-5 h-5 text-green-500" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {formatTime(latestMember.check_in_time)}
                                </span>
                            </div>
                        </div>
                        
                        {/* Footer */}
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
                @keyframes shrink-width {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-shrink-width {
                    animation: shrink-width 5s linear forwards;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
