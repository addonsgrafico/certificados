import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 text-blue-400 flex items-center justify-center shadow-xl">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-white">404 - Página No Encontrada</h1>
      <p className="text-slate-400 text-sm max-w-md">
        La ruta solicitada no existe o no tiene permisos para acceder.
      </p>
      <Link
        href="/"
        className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al Inicio</span>
      </Link>
    </div>
  );
}
