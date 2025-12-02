import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    UsersIcon, 
    UserGroupIcon, 
    CalendarDaysIcon, 
    CreditCardIcon,
    ArrowTrendingUpIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

export default function Dashboard({ stats, chartData, recentAttendances }) {
    const maxCount = Math.max(...chartData.map(d => d.count), 1);

    const statCards = [
        { 
            title: 'Total Member', 
            value: stats.totalMembers, 
            icon: UsersIcon, 
            color: 'text-blue-600 dark:text-blue-400',
            bgLight: 'bg-blue-50 dark:bg-blue-900/30'
        },
        { 
            title: 'Member Aktif', 
            value: stats.activeMembers, 
            icon: UserGroupIcon, 
            color: 'text-green-600 dark:text-green-400',
            bgLight: 'bg-green-50 dark:bg-green-900/30'
        },
        { 
            title: 'Hadir Hari Ini', 
            value: stats.todayAttendances, 
            icon: CalendarDaysIcon, 
            color: 'text-primary-600 dark:text-primary-400',
            bgLight: 'bg-primary-50 dark:bg-primary-900/30'
        },
        { 
            title: 'Belum Terdaftar', 
            value: stats.unregisteredCards, 
            icon: CreditCardIcon, 
            color: 'text-red-600 dark:text-red-400',
            bgLight: 'bg-red-50 dark:bg-red-900/30',
            badge: stats.unregisteredCards > 0
        },
    ];

    return (
        <AuthenticatedLayout title="Dashboard">
            <Head title="Dashboard" />
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                                <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${card.bgLight}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                        </div>
                        {card.badge && (
                            <div className="mt-3">
                                <Link 
                                    href="/unregistered"
                                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center gap-1"
                                >
                                    Lihat kartu baru
                                    <ArrowTrendingUpIcon className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Kehadiran 7 Hari Terakhir</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="w-3 h-3 bg-primary-600 rounded" />
                            Jumlah Hadir
                        </div>
                    </div>
                    <div className="flex items-end justify-between h-52 gap-3">
                        {chartData.map((item, index) => (
                            <div key={index} className="flex flex-col items-center flex-1">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{item.count}</span>
                                <div 
                                    className="w-full bg-primary-600 rounded-t-lg transition-all hover:bg-primary-500"
                                    style={{ 
                                        height: `${Math.max((item.count / maxCount) * 100, 4)}%`,
                                    }}
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium">{item.date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Attendances */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Absensi Terbaru</h3>
                        <Link 
                            href="/attendances"
                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                        >
                            Lihat Semua
                        </Link>
                    </div>
                    {recentAttendances.length > 0 ? (
                        <div className="space-y-4">
                            {recentAttendances.map((attendance) => (
                                <div key={attendance.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center overflow-hidden">
                                            {attendance.member_photo ? (
                                                <img src={`/storage/${attendance.member_photo}`} className="w-10 h-10 object-cover" alt="" />
                                            ) : (
                                                <UsersIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{attendance.member_name}</p>
                                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                <ClockIcon className="w-4 h-4" />
                                                {attendance.check_in_time}
                                                {attendance.check_out_time && ` - ${attendance.check_out_time}`}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        attendance.status === 'Hadir' 
                                            ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' 
                                            : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                                    }`}>
                                        {attendance.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                            <CalendarDaysIcon className="w-12 h-12 mb-3" />
                            <p>Belum ada absensi hari ini</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
