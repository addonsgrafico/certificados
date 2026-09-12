'use client';

import React, { useState } from 'react';
import { fetchApi, getBaseApiUrl } from '@/lib/api';
import { Award, Download, Search, AlertCircle, CheckCircle2, ShieldCheck, User, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CertificateDownloadFormProps {
  courseId: string;
  courseTitle: string;
  onSuccess?: () => void;
}

export default function CertificateDownloadForm({
  courseId,
  courseTitle,
  onSuccess,
}: CertificateDownloadFormProps) {
  const [studentCode, setStudentCode] = useState('');
  const [ciDocument, setCiDocument] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim() && !ciDocument.trim()) {
      setErrorMsg('Por favor ingrese el Código de Estudiante o su Cédula de Identidad (CI/DNI).');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessData(null);

    try {
      // Intentar búsqueda con CI primero o Código de Estudiante
      const queryTerm = ciDocument.trim() || studentCode.trim();

      const res = await fetchApi('/certificates/lookup', {
        method: 'POST',
        body: JSON.stringify({
          courseEventId: courseId,
          studentEmailOrDocument: queryTerm,
        }),
      });

      if (!res.success) {
        setErrorMsg(res.message || 'No se encontró un certificado activo registrado a su nombre en esta clase.');
        return;
      }

      setSuccessData(res);
      if (onSuccess) onSuccess();

      // Si existe ticket de descarga, abrir automáticamente en nueva pestaña
      if (res.downloadTicket) {
        const downloadUrl = `${getBaseApiUrl()}/certificates/download?ticket=${res.downloadTicket}`;
        window.open(downloadUrl, '_blank');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión al consultar el certificado. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
      <div className="space-y-2 border-b border-slate-100 pb-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>Descarga de Acreditación Oficial</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">
          Obtener Certificado Digital
        </h3>
        <p className="text-xs text-slate-500">
          Ingresa tu <strong>Código de Estudiante</strong> y tu <strong>Cédula de Identidad (CI / DNI)</strong> para generar y descargar tu PDF verificado.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo 1: Código de Estudiante / Correo */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Código de Estudiante o Correo Registrado
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="Ej. EST-2026 / alumno@ejemplo.com"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all"
            />
          </div>
        </div>

        {/* Campo 2: Cédula de Identidad CI / DNI */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Cédula de Identidad (CI / DNI)
          </label>
          <div className="relative">
            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={ciDocument}
              onChange={(e) => setCiDocument(e.target.value)}
              placeholder="Ej. 12345678"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all"
            />
          </div>
        </div>

        {/* Mensaje de Error */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2 text-xs text-red-700 font-medium"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mensaje de Éxito */}
        <AnimatePresence>
          {successData && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs text-emerald-900"
            >
              <div className="flex items-center space-x-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>¡Certificado Encontrado y Generado!</span>
              </div>
              <p>
                <strong>Estudiante:</strong> {successData.certificate?.participantName}
              </p>
              <p>
                <strong>ID Público:</strong> {successData.certificate?.publicId}
              </p>
              {successData.downloadTicket && (
                <a
                  href={`${getBaseApiUrl()}/certificates/download?ticket=${successData.downloadTicket}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-xs font-bold text-blue-900 underline pt-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Si la descarga no inició automáticamente, haz clic aquí.</span>
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm shadow-lg shadow-blue-900/15 transition-all disabled:opacity-50"
        >
          {loading ? (
            <span>Buscando certificado...</span>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>DESCARGAR MI CERTIFICADO</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
