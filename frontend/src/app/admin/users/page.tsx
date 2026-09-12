'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { UserCheck, Plus, ShieldCheck, X, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Role } from '@certificados/shared';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: '', fullName: '', pass: '', role: Role.ADMIN as string });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadUsers = () => {
    setLoading(true);
    fetchApi('/admin/users').then(setUsers).catch(() => setUsers([])).finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      await fetchApi('/admin/users', { method: 'POST', body: JSON.stringify(form) });
      setShowModal(false);
      setForm({ email: '', fullName: '', pass: '', role: Role.ADMIN });
      loadUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear el administrador.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user: any) => {
    if (!confirm(`¿${user.isActive ? 'Desactivar' : 'Activar'} al usuario ${user.fullName}?`)) return;
    try {
      await fetchApi(`/admin/users/${user.id}/status`, { method: 'PUT', body: JSON.stringify({ isActive: !user.isActive }) });
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar el estado.');
    }
  };

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    ADMIN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    AUDITOR: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestión de Usuarios Administradores</h1>
          <p className="text-xs text-slate-400 mt-1">Solo SUPER_ADMIN puede crear, activar o desactivar usuarios. No existe registro público.</p>
        </div>
        <button onClick={() => { setShowModal(true); setErrorMsg(null); }} className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto">
          <Plus className="w-4 h-4" /><span>Nuevo Administrador</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-blue-500" /></div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Nombre Completo</th>
                <th className="px-4 py-3">Correo Electrónico</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">MFA</th>
                <th className="px-4 py-3">Último Acceso</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold text-white">{user.fullName}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${roleColors[user.role] || 'bg-slate-700 text-slate-300'}`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    {user.mfaEnabled
                      ? <span className="flex items-center space-x-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /><span>Activo</span></span>
                      : <span className="flex items-center space-x-1 text-slate-500"><XCircle className="w-3.5 h-3.5" /><span>No configurado</span></span>
                    }
                  </td>
                  <td className="px-4 py-3 text-slate-500">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('es-ES') : 'Nunca'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>{user.isActive ? 'ACTIVO' : 'INACTIVO'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.role !== 'SUPER_ADMIN' && (
                      <button onClick={() => toggleStatus(user)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${user.isActive ? 'bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400' : 'bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400'}`}>
                        {user.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Crear Nuevo Administrador</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Nombre Completo *</label>
                <input type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Correo Electrónico *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Contraseña Inicial (mín. 10 caracteres) *</label>
                <input type="password" required minLength={10} value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                <p className="text-slate-500 text-[10px]">Debe incluir mayúsculas, números y caracteres especiales.</p>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Rol Administrativo *</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value={Role.ADMIN}>ADMIN — Gestión de Certificados</option>
                  <option value={Role.AUDITOR}>AUDITOR — Solo Lectura / Reportes</option>
                </select>
              </div>
              {errorMsg && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">{errorMsg}</div>}
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg transition-all flex items-center justify-center">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'CREAR ADMIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
