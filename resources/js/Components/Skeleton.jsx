export function Skeleton({ className = '' }) {
    return (
        <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
    );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <Skeleton className="h-6 w-48" />
            </div>
            <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        {Array(cols).fill(0).map((_, i) => (
                            <th key={i} className="px-4 py-3">
                                <Skeleton className="h-4 w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {Array(rows).fill(0).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Array(cols).fill(0).map((_, colIndex) => (
                                <td key={colIndex} className="px-4 py-3">
                                    <Skeleton className="h-4 w-full" />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <Skeleton className="h-10 w-10 rounded-lg mb-4" />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-32" />
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 lg:pl-70">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array(4).fill(0).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                        <Skeleton className="h-6 w-48 mb-4" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                        <Skeleton className="h-6 w-48 mb-4" />
                        <div className="space-y-3">
                            {Array(5).fill(0).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
