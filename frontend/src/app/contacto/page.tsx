'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertTriangle, Sparkles, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactoPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', honeypot: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.honeypot) return;

    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg('Por favor complete los campos obligatorios.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-900 text-xs font-bold uppercase tracking-wider border border-blue-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>CONSULTANCY ORGANIZATIONAL LLC</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Contacto & Atención Ejecutiva</h1>
        <p className="text-slate-600 text-sm">
          ¿Tienes consultas sobre nuestras clases, capacitaciones directivas o emisión de certificados? Envíanos un mensaje.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Info lateral */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6 bg-white border border-slate-200 rounded-3xl p-8 shadow-md"
        >
          <h2 className="text-xl font-extrabold text-slate-900">Información Institucional</h2>
          
          <div className="space-y-5 text-sm text-slate-600">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Correo Electrónico</span>
                <span className="font-bold text-slate-900">contacto@consultancyorganizational.com</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Atención Telefónica / WhatsApp</span>
                <span className="font-bold text-slate-900">+1 (800) 555-DEISY / +591 700-00000</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Institución Emisora</span>
                <span className="font-bold text-slate-900">CONSULTANCY ORGANIZATIONAL LLC — Dirigido por Deisy Barrera</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-xl"
        >
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">¡Mensaje Enviado con Éxito!</h3>
              <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto">
                Hemos recibido tu solicitud. Nuestro equipo de atención se pondrá en contacto contigo a la brevedad.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                className="hidden"
                tabIndex={-1}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    placeholder="juan@ejemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Asunto</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="Ej. Consulta sobre mi certificado"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Mensaje *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="Escriba su mensaje aquí..."
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs tracking-wider shadow-lg shadow-blue-900/15 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>ENVIAR MENSAJE</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
