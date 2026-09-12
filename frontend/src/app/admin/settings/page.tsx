'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Settings, Save, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchApi('/settings').then(setSettings).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const updated = await fetchApi('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) });
      setSettings(updated);
      setSuccessMsg('Configuración institucional actualizada correctamente.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-3">
          <Settings className="w-6 h-6 text-blue-400" />
          <span>Configuración Institucional</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Personalice la información de la organización que se muestra en el sitio público.</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-300 flex items-start space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>Parámetros críticos de seguridad</strong> como DATABASE_URL, SESSION_SECRET, CERTIFICATE_CODE_PEPPER y MFA_ENCRYPTION_KEY solo pueden modificarse mediante variables de entorno del servidor. No se pueden cambiar desde esta interfaz.
        </span>
      </div>

      {settings && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <h2 className="text-base font-bold text-white">Información de la Organización</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="md:col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">Nombre de la Organización</label>
              <input type="text" value={settings.orgName || ''} onChange={(e) => setSettings({ ...settings, orgName: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Correo Electrónico Institucional</label>
              <input type="email" value={settings.contactEmail || ''} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Teléfono de Contacto</label>
              <input type="text" value={settings.contactPhone || ''} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">WhatsApp (con código de país)</label>
              <input type="text" value={settings.whatsapp || ''} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} placeholder="+1 (555) 019-2834" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">URL del Logo Corporativo</label>
              <input type="url" value={settings.orgLogoUrl || ''} onChange={(e) => setSettings({ ...settings, orgLogoUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">Dirección Institucional</label>
              <input type="text" value={settings.address || ''} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span className="text-blue-400">👤</span>
              <span>Perfil de la Coach / Instructora</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Nombre de la Coach / Instructora</label>
                <input type="text" value={settings.coachName || ''} onChange={(e) => setSettings({ ...settings, coachName: e.target.value })} placeholder="Ej. Dra. Elena Valenzuela" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Título Profesional / Rol</label>
                <input type="text" value={settings.coachTitle || ''} onChange={(e) => setSettings({ ...settings, coachTitle: e.target.value })} placeholder="Ej. Coach Educativa & Mentora Institucional" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="font-semibold text-slate-300">Biografía / Resumen de Perfil</label>
                <textarea rows={3} value={settings.coachBio || ''} onChange={(e) => setSettings({ ...settings, coachBio: e.target.value })} placeholder="Resumen profesional de la coach..." className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="font-semibold text-slate-300">URL de la Foto / Avatar de la Coach</label>
                <input type="url" value={settings.coachAvatarUrl || ''} onChange={(e) => setSettings({ ...settings, coachAvatarUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 space-y-4">
            <h2 className="text-base font-bold text-white">Redes Sociales</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {['facebook', 'linkedin', 'twitter', 'instagram', 'youtube'].map((net) => (
                <div key={net} className="space-y-1">
                  <label className="font-semibold text-slate-300 capitalize">{net}</label>
                  <input
                    type="url"
                    value={(settings.socialLinks?.[net]) || ''}
                    onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, [net]: e.target.value } })}
                    placeholder={`https://${net}.com/...`}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" /><span>{errorMsg}</span>
            </div>
          )}

          <button type="submit" disabled={saving} className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /><span>GUARDAR CONFIGURACIÓN</span></>}
          </button>
        </form>
      )}
    </div>
  );
}
