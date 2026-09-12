'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { ShieldAlert, Activity, AlertOctagon, Loader2 } from 'lucide-react';

export default function AdminAuditPage() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [secTotal, setSecTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [secPage, setSecPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'audit' | 'security'>('audit');

  const loadData = () => {
    setLoading(true);
    const auditFetch = fetchApi(`/admin/security/audit-logs?page=${auditPage}&limit=25`);
    const secFetch = fetchApi(`/admin/security/security-events?page=${secPage}&limit=25`);

    Promise.allSettled([auditFetch, secFetch]).then(([a, s]) => {
      if (a.status === 'fulfilled') { setAuditLogs(a.value.items); setAuditTotal(a.value.total); }
      if (s.status === 'fulfilled') { setSecurityEvents(s.value.items); setSecTotal(s.value.total); }
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, [auditPage, secPage]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Auditoría y Eventos de Seguridad</h1>
        <p className="text-xs text-slate-400 mt-1">Registro inmutable de acciones administrativas e incidencias de seguridad del sistema.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900 border border-slate-800 rounded-xl p-1 max-w-sm">
        <button onClick={() => setActiveTab('audit')} className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'audit' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
          <Activity className="w-3.5 h-3.5" /><span>Audit Logs</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-700/50 text-[10px]">{auditTotal}</span>
        </button>
        <button onClick={() => setActiveTab('security')} className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'security' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
          <AlertOctagon className="w-3.5 h-3.5" /><span>Seguridad</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-700/50 text-[10px]">{secTotal}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-blue-500" /></div>
      ) : activeTab === 'audit' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
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
                {auditLogs.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No hay registros de auditoría disponibles.</td></tr>
                ) : auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">{new Date(log.createdAt).toLocaleString('es-ES')}</td>
                    <td className="px-4 py-3 font-medium text-white">{log.admin?.fullName || 'Sistema'}<br /><span className="text-slate-500 text-[10px]">{log.admin?.email}</span></td>
                    <td className="px-4 py-3 font-mono text-blue-400 font-bold">{log.action}</td>
                    <td className="px-4 py-3 text-slate-300">{log.resource}{log.resourceId && <span className="block text-[10px] text-slate-600 font-mono">{log.resourceId.substring(0, 8)}...</span>}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{log.ipAddress}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.result === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{log.result}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Total: {auditTotal} registros</span>
            <div className="space-x-2">
              <button disabled={auditPage <= 1} onClick={() => setAuditPage(auditPage - 1)} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50">Anterior</button>
              <span className="font-semibold text-white">Página {auditPage}</span>
              <button disabled={auditPage * 25 >= auditTotal} onClick={() => setAuditPage(auditPage + 1)} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Tipo de Evento</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {securityEvents.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-500">No hay eventos de seguridad registrados.</td></tr>
                ) : securityEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">{new Date(ev.createdAt).toLocaleString('es-ES')}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">{ev.eventType}</span></td>
                    <td className="px-4 py-3 text-slate-300">{ev.description}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{ev.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Total: {secTotal} eventos</span>
            <div className="space-x-2">
              <button disabled={secPage <= 1} onClick={() => setSecPage(secPage - 1)} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50">Anterior</button>
              <span className="font-semibold text-white">Página {secPage}</span>
              <button disabled={secPage * 25 >= secTotal} onClick={() => setSecPage(secPage + 1)} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
