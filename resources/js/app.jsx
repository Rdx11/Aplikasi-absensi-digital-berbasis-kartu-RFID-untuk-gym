import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import Toast from './Components/Toast';
import { DashboardSkeleton } from './Components/Skeleton';
import { ThemeProvider } from './Contexts/ThemeContext';

const pages = import.meta.glob('./Pages/**/*.jsx');

createInertiaApp({
    title: (title) => title ? `${title} - Bricks Gym` : 'Bricks Gym',
    resolve: async (name) => {
        const page = await pages[`./Pages/${name}.jsx`]();
        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ThemeProvider>
                <Toast />
                <Suspense fallback={<DashboardSkeleton />}>
                    <App {...props} />
                </Suspense>
            </ThemeProvider>
        );
    },
});
