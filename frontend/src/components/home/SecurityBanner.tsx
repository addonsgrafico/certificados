'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, QrCode, Award } from 'lucide-react';

export default function SecurityBanner() {
  return (
    <section className="bg-gradient-to-br from-blue-900 to-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verificación de Autenticidad</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Certificados Protegidos con Código QR e Historial Inmutable
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Cada certificado emitido por <strong>CONSULTANCY ORGANIZATIONAL LLC</strong> cuenta con una clave hash única de 24 caracteres (Crockford Base32) y sello QR de comprobación en tiempo real.
            </p>
            <div className="pt-2">
              <Link
                href="/cursos"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
              >
                <Award className="w-4 h-4" />
                <span>Explorar Cursos y Certificados</span>
              </Link>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 space-y-6 shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-400/30">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <p className="font-extrabold text-lg text-white">Sello de Acreditación Oficial</p>
                <p className="text-xs text-slate-400">Firmado por Deisy Barrera</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>Validación estricta de Cédula de Identidad y Alumnos Registrados.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>Generación de Ticket temporal seguro de descarga en PDF.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>Impresión con plantilla gráfica personalizada configurable por clase.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
