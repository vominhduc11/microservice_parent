import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/layout/ClientLayout';
import { AuthProvider } from '@/context/AuthContext';
import { LoginModalProvider } from '@/context/LoginModalContext';
import { SearchModalProvider } from '@/context/SearchModalContext';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
    icons: {
        icon: [{ url: '/logo.png', sizes: '32x32', type: 'image/png' }]
    }
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body id="__next" className="antialiased" suppressHydrationWarning={true}>
                <LanguageProvider>
                    <AuthProvider>
                        <LoginModalProvider>
                            <SearchModalProvider>
                                <ClientLayout>{children}</ClientLayout>
                            </SearchModalProvider>
                        </LoginModalProvider>
                    </AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
