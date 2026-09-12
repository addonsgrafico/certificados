'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import {
  LayoutDashboard,
  Award,
  BookOpen,
  Users,
  ShieldAlert,
  FileSpreadsheet,
  Settings,
  LogOut,
  ShieldCheck,
  UserCheck,
  Lock,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    fetchApi('/auth/me')
      .then((user) => {
        setCurrentUser(user);
      })
      .catch(() => {
        router.push('/admin/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-950">{children}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Verificando credenciales administrativas...
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch (_) {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_session_token');
    }
    router.push('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'AUDITOR'] },
    { label: 'Certificados & Plantillas', href: '/admin/certificates', icon: Award, roles: ['SUPER_ADMIN', 'ADMIN', 'AUDITOR'] },
    { label: 'Cursos & Contenido Web', href: '/admin/courses', icon: BookOpen, roles: ['SUPER_ADMIN', 'ADMIN', 'AUDITOR'] },
    { label: 'Participantes', href: '/admin/participants', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'AUDITOR'] },
    { label: 'Usuarios Admin', href: '/admin/users', icon: UserCheck, roles: ['SUPER_ADMIN'] },
    { label: 'Auditoría & Seguridad', href: '/admin/audit', icon: ShieldAlert, roles: ['SUPER_ADMIN', 'AUDITOR'] },
    { label: 'Configuración', href: '/admin/settings', icon: Settings, roles: ['SUPER_ADMIN'] },
  ];

  const userRole = currentUser?.role || 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      
      {/* SIDEBAR ADMINISTRATIVO */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base">CertiValida</span>
              <span className="block text-[10px] uppercase font-mono text-blue-400">PANEL CONTROL</span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems
              .filter((item) => item.roles.includes(userRole))
              .map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* Perfil Usuario */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-blue-400 font-bold flex items-center justify-center text-xs">
              {currentUser?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-semibold text-white truncate">{currentUser?.fullName}</span>
              <span className="block text-[10px] font-mono text-blue-400">{currentUser?.role}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-xs font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL ADMIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header móvil */}
        <header className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-white text-sm">Panel Admin</span>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
