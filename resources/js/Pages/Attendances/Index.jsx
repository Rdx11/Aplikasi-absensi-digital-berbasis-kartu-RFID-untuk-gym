import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { CalendarDaysIcon, ClockIcon, UsersIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function AttendancesIndex({ attendances, members, filters }) {
    const [date, setDate] = useState(filters.date || new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setDate(newDate);
        setLoading(true);
        router.get('/attendances', { date: newDate }, { preserveState: true, onFinish: () => setLoading(false) });
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
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="date" value={date} onChange={handleDateChange} className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <button onClick={refresh} disabled={loading} className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 bg-white dark:bg-gray-800">
                        <ArrowPathIcon className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <UsersIcon className="w-5 h-5" />
                    <span className="font-medium">{attendances.total || attendances.data?.length || 0}</span>
                    <span>absensi</span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">RFID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check In</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check Out</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
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
                                    <td className="px-6 py-4">
                                        {attendance.check_out_time ? (
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                <ClockIcon className="w-4 h-4 text-blue-500" />{formatTime(attendance.check_out_time)}
                                            </div>
                                        ) : <span className="text-gray-400 dark:text-gray-500">-</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${attendance.check_out_time ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'}`}>
                                            {attendance.check_out_time ? 'Pulang' : 'Hadir'}
                                        </span>
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
        </AuthenticatedLayout>
    );
}
