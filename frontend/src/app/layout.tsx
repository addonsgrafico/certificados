import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

export const metadata: Metadata = {
  title: 'CONSULTANCY ORGANIZATIONAL LLC | Certificados Digitales & Capacitación',
  description:
    'Portal oficial de capacitación, clases ejecutivas y emisión segura de certificados digitales dirigidos por Deisy Barrera en CONSULTANCY ORGANIZATIONAL LLC.',
  keywords: ['Deisy Barrera', 'CONSULTANCY ORGANIZATIONAL LLC', 'certificados digitales', 'coaching ejecutivo', 'verificación QR'],
  openGraph: {
    title: 'CONSULTANCY ORGANIZATIONAL LLC - Certificados Digitales',
    description: 'Consulte y descargue la acreditación oficial de sus clases y tutorías.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-900 selection:text-white">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
