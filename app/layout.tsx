import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store/AppContext';
import CommandBar from '@/components/layout/CommandBar';
import Sidebar from '@/components/layout/Sidebar';
import Toast from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'SilverSuite — The Operating System for Silver Manufacturing',
  description: 'End-to-end ERP for silver manufacturers. Track orders, production, silver movement, billing, karigar, outsourcing and finance in one place.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0A0A0B', color: '#C8D0D8', fontSize: '13px', overflow: 'hidden' }}>
            <CommandBar />
            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
              <Sidebar />
              <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: '#0A0A0B' }}>
                {children}
              </main>
            </div>
          </div>
          <Toast />
        </AppProvider>
      </body>
    </html>
  );
}
