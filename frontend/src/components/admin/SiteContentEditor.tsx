'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import {
  Sparkles,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  HelpCircle,
} from 'lucide-react';

export default function SiteContentEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    orgName: 'CONSULTANCY ORGANIZATIONAL LLC',
    orgLogoUrl: '/consultancy-logo.png',
    coachName: 'Deisy Barrera',
    coachTitle: 'Executive Coach & Mentora Organizacional',
    coachBio:
      'Fundadora y mentora principal en CONSULTANCY ORGANIZATIONAL LLC. Especialista en la transformación de competencias ejecutivas, comunicación asertiva, persuasión estratégica y liderazgo directivo de alto rendimiento.',
    coachAvatarUrl: '/deisy-barrera.jpg',
    contactEmail: 'contacto@consultancyorganizational.com',
    contactPhone: '+1 (800) 555-DEISY / +591 700-00000',
    whatsapp: '+1 (800) 555-DEISY',
    address: 'CONSULTANCY ORGANIZATIONAL LLC — Acreditación Ejecutiva Internacional',
  });

  useEffect(() => {
    fetchApi('/settings')
      .then((data) => {
        if (data) {
          setForm({
            orgName: data.orgName || 'CONSULTANCY ORGANIZATIONAL LLC',
            orgLogoUrl: data.orgLogoUrl || '/consultancy-logo.png',
            coachName: data.coachName || 'Deisy Barrera',
            coachTitle: data.coachTitle || 'Executive Coach & Mentora Organizacional',
            coachBio:
              data.coachBio ||
              'Fundadora y mentora principal en CONSULTANCY ORGANIZATIONAL LLC. Especialista en la transformación de competencias ejecutivas, comunicación asertiva, persuasión estratégica y liderazgo directivo de alto rendimiento.',
            coachAvatarUrl: data.coachAvatarUrl || '/deisy-barrera.jpg',
            contactEmail: data.contactEmail || 'contacto@consultancyorganizational.com',
            contactPhone: data.contactPhone || '+1 (800) 555-DEISY / +591 700-00000',
            whatsapp: data.whatsapp || '+1 (800) 555-DEISY',
            address: data.address || 'CONSULTANCY ORGANIZATIONAL LLC — Acreditación Ejecutiva Internacional',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      await fetchApi('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setStatusMsg({ type: 'success', text: '✅ Contenido institucional y textos del sitio actualizados correctamente.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error al guardar los cambios.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
        Cargando contenidos del sitio web...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl">
      {/* Banner de Introducción */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Gestor de Contenido Web (CMS)</span>
          </div>
          <h2 className="text-xl font-bold text-white">Administración de Textos Públicos del Sitio</h2>
          <p className="text-xs text-slate-400">
            Edite la información institucional, biografía de la Coach Deisy Barrera y datos de atención que se muestran en el portal público.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all self-start md:self-auto disabled:opacity-50 shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>GUARDAR CAMBIOS</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-3 border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
              : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Bloque 1: Perfil de la Coach Deisy Barrera */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">1. Perfil Profesional de la Coach / Mentora</h3>
            <p className="text-xs text-slate-400">Textos que se muestran en el Hero principal y la sección "Sobre Deisy Barrera".</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Nombre de la Coach *</span>
            </label>
            <input
              type="text"
              required
              value={form.coachName}
              onChange={(e) => setForm({ ...form, coachName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
              placeholder="Deisy Barrera"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Título / Cargo Ejecutivo *</span>
            </label>
            <input
              type="text"
              required
              value={form.coachTitle}
              onChange={(e) => setForm({ ...form, coachTitle: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
              placeholder="Executive Coach & Mentora Organizacional"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Biografía & Trayectoria Profesional *</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Visible en la página principal</span>
            </label>
            <textarea
              rows={4}
              required
              value={form.coachBio}
              onChange={(e) => setForm({ ...form, coachBio: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 text-xs leading-relaxed focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
              placeholder="Especialista en desarrollo institucional, liderazgo directivo..."
            />
          </div>

          {/* Fotografía de la Coach con Live Preview y Botón Preset */}
          <div className="sm:col-span-2 space-y-2 bg-slate-950/40 p-5 rounded-2xl border border-slate-800">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>URL de Fotografía de la Coach (Recorte Transparente)</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">PNG Transparente Recomendado</span>
            </label>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-1 w-full space-y-2">
                <input
                  type="text"
                  value={form.coachAvatarUrl}
                  onChange={(e) => setForm({ ...form, coachAvatarUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
                  placeholder="/deisy-barrera-nobg.png"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-semibold">Preajuste rápido:</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, coachAvatarUrl: '/deisy-barrera-nobg.png' })}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-medium border border-blue-500/30 transition-colors"
                  >
                    ✨ Aplicar Foto sin Fondo Oficial (/deisy-barrera-nobg.png)
                  </button>
                </div>
              </div>

              <div className="w-20 h-24 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden relative shrink-0 flex items-center justify-center shadow-md p-1">
                {form.coachAvatarUrl ? (
                  <img
                    src={form.coachAvatarUrl}
                    alt="Preview Coach"
                    className="w-full h-full object-contain object-bottom"
                  />
                ) : (
                  <div className="text-[9px] text-slate-500 text-center">Sin foto</div>
                )}
                <span className="absolute bottom-1 right-1 text-[7px] bg-black/80 px-1 py-0.5 rounded text-slate-300 font-bold">
                  PREVIEW
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bloque 2: Institución & Marca */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">2. Institución Emisora & Acreditación</h3>
            <p className="text-xs text-slate-400">Razón social institucional y logotipo que encabezan el sitio y los diplomas oficiales.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Nombre de la Organización *</span>
            </label>
            <input
              type="text"
              required
              value={form.orgName}
              onChange={(e) => setForm({ ...form, orgName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
              placeholder="CONSULTANCY ORGANIZATIONAL LLC"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>URL del Logotipo Institucional</span>
            </label>
            <input
              type="text"
              value={form.orgLogoUrl}
              onChange={(e) => setForm({ ...form, orgLogoUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
              placeholder="/consultancy-logo.png"
            />
          </div>
        </div>
      </div>

      {/* Bloque 3: Canales de Atención & Contacto */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">3. Canales de Contacto & Asistencia</h3>
            <p className="text-xs text-slate-400">Teléfonos, WhatsApp y correo que se publican en el formulario de contacto y pie de página.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Correo Electrónico Oficial</span>
            </label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
              placeholder="contacto@consultancyorganizational.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp / Teléfono de Atención</span>
            </label>
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
              placeholder="+1 (800) 555-DEISY / +591 700-00000"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Dirección o Sede Institucional</span>
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
              placeholder="CONSULTANCY ORGANIZATIONAL LLC — Acreditación Ejecutiva Internacional"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>GUARDAR CAMBIOS EN EL SITIO WEB</span>
        </button>
      </div>
    </form>
  );
}
