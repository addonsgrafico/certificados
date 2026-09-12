'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Mail, Phone, MapPin, Award, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-slate-800">
          {/* Columna 1: Marca Corporativa */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 bg-white rounded-xl p-1.5 flex items-center justify-center">
                <Image
                  src="/consultancy-logo.png"
                  alt="CONSULTANCY ORGANIZATIONAL LLC"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base tracking-wider uppercase">
                  CONSULTANCY
                </h3>
                <p className="text-xs font-bold text-amber-400 tracking-widest uppercase">
                  ORGANIZATIONAL LLC
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Organización líder en desarrollo ejecutivo, capacitación institucional y coaching estratégico bajo la dirección de la Coach Deisy Barrera. Emisión y verificación segura de certificados digitales.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verificación con Hash HMAC-SHA256 y Código QR Oficial</span>
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Página Principal
                </Link>
              </li>
              <li>
                <Link href="/#sobre-deisy" className="hover:text-amber-400 transition-colors">
                  Sobre Deisy Barrera
                </Link>
              </li>
              <li>
                <Link href="/cursos" className="hover:text-amber-400 transition-colors">
                  Catálogo de Clases & Cursos
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-amber-400 transition-colors">
                  Contacto & Asistencia
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-amber-400 transition-colors">
                  Acceso Administrativo
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto & Institución */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">
              Atención & Consultoría
            </h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                <span>contacto@consultancyorganizational.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                <span>+1 (800) 555-DEISY / +591 700-00000</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                <span>CONSULTANCY ORGANIZATIONAL LLC — Certificación Internacional</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} CONSULTANCY ORGANIZATIONAL LLC. Todos los derechos reservados.</p>
          <p className="flex items-center space-x-1">
            <span>Dirigido por Deisy Barrera — Coach Organizacional & Executive Mentoring</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
