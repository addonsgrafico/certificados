'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import {
  Award,
  CheckCircle2,
  AlertOctagon,
  Calendar,
  BookOpen,
  Download,
  QrCode,
  Activity,
  Filter,
  Loader2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');

  const loadStats = (selectedPeriod: string) => {
    setLoading(true);
    fetchApi(`/admin/dashboard/stats?period=${selectedPeriod}`)
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats(period);
  }, [period]);

  return (
    <div className="space-y-8">
      
      {/* Header & Filtro de Período */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard General</h1>
          <p className="text-xs text-slate-400 mt-1">
            Resumen en tiempo real de emisión de certificados, verificaciones QR e incidencias.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl p-1.5 self-start sm:self-auto">
          <Filter className="w-4 h-4 text-slate-500 ml-2" />
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === 'month' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Este Mes
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === 'year' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Este Año
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Histórico Total
          </button>
        </div>
      </div>

      {loading || !stats ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* TARJETAS DE MÉTRICAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase">Certificados Totales</span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-white block">{stats.metrics.totalCertificates}</span>
              <span className="text-[11px] text-slate-500 block">Registrados en la plataforma</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase">Certificados Activos</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-emerald-400 block">{stats.metrics.activeCertificates}</span>
              <span className="text-[11px] text-slate-500 block">Válidos para descarga</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase">Certificados Revocados</span>
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <AlertOctagon className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-rose-400 block">{stats.metrics.revokedCertificates}</span>
              <span className="text-[11px] text-slate-500 block">Sin validez legal u oficial</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase">Verificaciones QR</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-indigo-400 block">{stats.metrics.totalQrScans}</span>
              <span className="text-[11px] text-slate-500 block">Escaneos acumulados</span>
            </div>

          </div>

          {/* MÉTRICAS SECUNDARIAS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Emitidos este mes</span>
                <span className="text-xl font-bold text-white">{stats.metrics.issuedThisMonth}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Cursos Activos</span>
                <span className="text-xl font-bold text-white">{stats.metrics.totalCourses}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Descargas Realizadas</span>
                <span className="text-xl font-bold text-white">{stats.metrics.totalDownloads}</span>
              </div>
            </div>
          </div>

          {/* ACTIVIDAD RECIENTE AUDIT LOG */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span>Actividad Administrativa Reciente</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Acción</th>
                    <th className="px-4 py-3">Recurso</th>
                    <th className="px-4 py-3">IP</th>
                    <th className="px-4 py-3">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {stats.recentActivity.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {new Date(log.createdAt).toLocaleString('es-ES')}
                      </td>
                      <td className="px-4 py-3 font-medium text-white">
                        {log.admin?.fullName || 'Sistema'}
                      </td>
                      <td className="px-4 py-3 font-mono text-blue-400">{log.action}</td>
                      <td className="px-4 py-3">{log.resource}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{log.ipAddress}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.result === 'SUCCESS'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {log.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
