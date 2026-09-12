'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi, getBaseApiUrl } from '@/lib/api';
import {
  Award,
  Plus,
  Search,
  RotateCw,
  Ban,
  CheckCircle,
  QrCode,
  Download,
  AlertTriangle,
  X,
  FileUp,
  Loader2,
  Copy,
  Check,
  Mail,
  Sliders,
} from 'lucide-react';
import CertificateTemplateDesigner from '@/components/admin/CertificateTemplateDesigner';

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'emission' | 'designer'>('emission');

  // Modales
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [showQrModal, setShowQrModal] = useState<any | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<{
    publicId: string;
    id: string;
    participantName: string;
    courseName: string;
    email?: string;
  } | null>(null);

  // Formulario Emisión
  const [issueForm, setIssueForm] = useState({
    participantName: '',
    participantEmail: '',
    participantDocument: '',
    courseEventId: '',
    issuedAt: '',
    expiresAt: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadCertificates = () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      limit: '15',
      ...(search ? { search } : {}),
    });

    fetchApi(`/admin/certificates?${query}`)
      .then((res) => {
        setCertificates(res.items);
        setTotal(res.total);
      })
      .catch(() => setCertificates([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCertificates();
    fetchApi('/admin/courses')
      .then((res) => setCourses(res))
      .catch(() => setCourses([]));
  }, [page, search]);

  const [autoGenerate, setAutoGenerate] = useState(true);

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.participantName || !issueForm.courseEventId) {
      setErrorMsg('Debe completar los campos obligatorios del estudiante y curso.');
      return;
    }

    if (!autoGenerate && !selectedFile) {
      setErrorMsg('Debe adjuntar el archivo PDF o habilitar la generación automática.');
      return;
    }

    setIssuing(true);
    setErrorMsg(null);

    const formData = new FormData();
    if (selectedFile && !autoGenerate) {
      formData.append('file', selectedFile);
    }
    formData.append('participantName', issueForm.participantName);
    if (issueForm.participantEmail) formData.append('participantEmail', issueForm.participantEmail);
    if (issueForm.participantDocument) formData.append('participantDocument', issueForm.participantDocument);
    formData.append('courseEventId', issueForm.courseEventId);
    if (issueForm.issuedAt) formData.append('issuedAt', issueForm.issuedAt);
    if (issueForm.expiresAt) formData.append('expiresAt', issueForm.expiresAt);

    try {
      const res = await fetchApi('/admin/certificates/issue', {
        method: 'POST',
        body: formData,
      });

      setShowIssueModal(false);
      setIssueForm({ participantName: '', participantEmail: '', participantDocument: '', courseEventId: '', issuedAt: '', expiresAt: '' });
      setSelectedFile(null);
      
      // Mostrar confirmación ejecutiva sin códigos criptográficos confusos
      setShowSuccessModal({
        publicId: res.certificate.publicId,
        id: res.certificate.id,
        participantName: res.certificate.participant?.fullName || issueForm.participantName,
        courseName: res.certificate.courseEvent?.name || 'Capacitación Oficial',
        email: res.certificate.participantEmail || issueForm.participantEmail,
      });
      loadCertificates();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al emitir el certificado.');
    } finally {
      setIssuing(false);
    }
  };

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRevokeModal || !revokeReason) return;

    try {
      await fetchApi(`/admin/certificates/${showRevokeModal}/revoke`, {
        method: 'POST',
        body: JSON.stringify({ reason: revokeReason }),
      });
      setShowRevokeModal(null);
      setRevokeReason('');
      loadCertificates();
    } catch (err: any) {
      alert(err.message || 'Error al revocar el certificado.');
    }
  };

  const handleReactivate = async (id: string) => {
    if (!confirm('¿Desea reactivar este certificado?')) return;
    try {
      await fetchApi(`/admin/certificates/${id}/reactivate`, { method: 'POST' });
      loadCertificates();
    } catch (err: any) {
      alert(err.message || 'Error al reactivar.');
    }
  };

  const handleShowQr = async (cert: any) => {
    try {
      const res = await fetchApi(`/admin/certificates/${cert.id}/qr`);
      setShowQrModal({ ...cert, qr: res });
    } catch (err) {
      alert('Error al generar vista de QR.');
    }
  };

  const handleSendEmail = async (id: string, currentEmail?: string) => {
    const targetEmail = prompt('Ingrese el correo electrónico al que desea enviar el certificado:', currentEmail || '');
    if (!targetEmail || !targetEmail.trim()) return;

    try {
      await fetchApi(`/admin/certificates/${id}/send-email`, {
        method: 'POST',
        body: JSON.stringify({ email: targetEmail.trim() }),
      });
      alert(`✅ Correo de notificación enviado correctamente a ${targetEmail.trim()}.`);
    } catch (err: any) {
      alert(err.message || 'Error al enviar el correo.');
    }
  };


  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Certificados Digitales & Plantillas</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión completa de emisión para estudiantes y calibración visual de plantillas de certificados.
          </p>
        </div>

        {activeTab === 'emission' && (
          <button
            onClick={() => setShowIssueModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Nuevo Certificado</span>
          </button>
        )}
      </div>

      {/* Tabs Principales: Emisión vs Diseñador */}
      <div className="flex border-b border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab('emission')}
          className={`flex items-center space-x-2 pb-3 px-1 border-b-2 text-sm font-semibold transition-all ${
            activeTab === 'emission'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Gestión & Emisión de Certificados</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
            {total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('designer')}
          className={`flex items-center space-x-2 pb-3 px-1 border-b-2 text-sm font-semibold transition-all ${
            activeTab === 'designer'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Diseñador & Edición de Plantillas de Certificados</span>
        </button>
      </div>

      {activeTab === 'designer' && (
        <CertificateTemplateDesigner
          courses={courses}
          onRefreshCourses={() => {
            fetchApi('/admin/courses').then((res) => setCourses(res));
          }}
        />
      )}

      {activeTab === 'emission' && (
        <>
          {/* Buscador */}
          <div className="relative max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por ID Público, Estudiante o Terminación..."
              className="w-full px-4 py-2.5 pl-10 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

      {/* Tabla Certificados */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">ID Público</th>
                <th className="px-4 py-3">Participante</th>
                <th className="px-4 py-3">Curso / Programa</th>
                <th className="px-4 py-3">Emisión</th>
                <th className="px-4 py-3">Identificación (CI/DNI)</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    Cargando certificados...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    No se encontraron certificados registrados.
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-blue-400">{cert.publicId}</td>
                    <td className="px-4 py-3 font-semibold text-white">{cert.participant?.fullName}</td>
                    <td className="px-4 py-3 text-slate-300">{cert.courseEvent?.name}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(cert.issuedAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {cert.participant?.internalDocument || <span className="text-slate-600 italic">N/A</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cert.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {cert.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <a
                        href={`${getBaseApiUrl()}/certificates/download?publicId=${cert.publicId}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Ver / Descargar PDF Oficial"
                        className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 transition-colors inline-flex"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleShowQr(cert)}
                        title="Ver Código QR"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleSendEmail(cert.id, cert.participant?.email)}
                        title="Enviar por Correo Electrónico"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-500/20 text-blue-400"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>

                      {cert.status === 'ACTIVE' ? (
                        <button
                          onClick={() => setShowRevokeModal(cert.id)}
                          title="Revocar Certificado"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(cert.id)}
                          title="Reactivar Certificado"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-emerald-400"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Total: {total} certificados</span>
          <div className="space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="font-semibold text-white">Página {page}</span>
            <button
              disabled={page * 15 >= total}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </>
  )}

      {/* MODAL EMISIÓN (REDESISEÑADO CON ALTA UX/UI) */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Emitir Nuevo Certificado Digital</h3>
                  <p className="text-xs text-slate-400">Acreditación verificable con código QR y clave secreta.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Nombre Completo del Participante *</span>
                  <span className="text-[10px] text-slate-500 font-normal">Tal como figurará en el diploma</span>
                </label>
                <input
                  type="text"
                  required
                  value={issueForm.participantName}
                  onChange={(e) => setIssueForm({ ...issueForm, participantName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-medium text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
                  placeholder="Ej. Dra. María Fernanda Gómez"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Correo Electrónico (Opcional)</label>
                  <input
                    type="email"
                    value={issueForm.participantEmail}
                    onChange={(e) => setIssueForm({ ...issueForm, participantEmail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-medium text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
                    placeholder="maria@ejemplo.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Doc. Identidad / CI (Opcional)</label>
                  <input
                    type="text"
                    value={issueForm.participantDocument}
                    onChange={(e) => setIssueForm({ ...issueForm, participantDocument: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-medium text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
                    placeholder="CI / DNI / Pasaporte"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Curso / Programa de Capacitación *</label>
                <select
                  required
                  value={issueForm.courseEventId}
                  onChange={(e) => setIssueForm({ ...issueForm, courseEventId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-medium text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
                >
                  <option value="">Seleccione el curso al que pertenece...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.duration || '12 Horas'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle Generación Automática */}
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 space-y-1.5">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGenerate}
                    onChange={(e) => setAutoGenerate(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-950 border-slate-700"
                  />
                  <span className="font-bold text-blue-200 text-xs">
                    Generar diseño de certificado PDF automáticamente (Recomendado)
                  </span>
                </label>
                <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                  El sistema renderizará el certificado A4 apaisado institucional con sellos dorados, firma de Deisy Barrera y código QR criptográfico.
                </p>
              </div>

              {!autoGenerate && (
                <div className="space-y-1.5 p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
                  <label className="text-xs font-bold text-slate-200">Archivo PDF del Certificado Externo *</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    required={!autoGenerate}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white file:text-xs file:font-semibold hover:file:bg-blue-500 transition-all"
                  />
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={issuing}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {issuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                  <span>EMITIR Y GUARDAR SEGURO</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN DE EMISIÓN EXITOSA */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Acreditación Generada
              </span>
              <h3 className="text-xl font-bold text-white pt-1">¡Certificado Emitido con Éxito!</h3>
              <p className="text-xs text-slate-400">
                El diploma digital ha sido firmado institucionalmente y registrado con validez QR.
              </p>
            </div>

            {/* Resumen del Certificado */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Participante:</span>
                <span className="font-bold text-white text-sm">{showSuccessModal.participantName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Programa:</span>
                <span className="text-slate-300">{showSuccessModal.courseName}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">ID Público:</span>
                  <span className="font-mono font-bold text-blue-400">{showSuccessModal.publicId}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(showSuccessModal.publicId);
                    alert('ID copiado al portapapeles');
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copiar ID</span>
                </button>
              </div>
            </div>

            {/* Botones de Acción Inmediata */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`${getBaseApiUrl()}/certificates/download?publicId=${showSuccessModal.publicId}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/25 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF</span>
              </a>

              <button
                onClick={() => {
                  const certObj = certificates.find((c) => c.id === showSuccessModal.id) || {
                    id: showSuccessModal.id,
                    publicId: showSuccessModal.publicId,
                    participant: { fullName: showSuccessModal.participantName },
                    courseEvent: { name: showSuccessModal.courseName },
                  };
                  setShowSuccessModal(null);
                  setShowQrModal(certObj);
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors border border-slate-700"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Ver Código QR</span>
              </button>
            </div>

            {showSuccessModal.email && (
              <button
                onClick={() => handleSendEmail(showSuccessModal.id, showSuccessModal.email)}
                className="w-full py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-blue-500/20 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Enviar Notificación por Correo ({showSuccessModal.email})</span>
              </button>
            )}

            <button
              onClick={() => setShowSuccessModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Cerrar y Continuar
            </button>
          </div>
        </div>
      )}

      {/* MODAL REVOCAR */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-rose-400">Revocar Certificado</h3>
            <p className="text-xs text-slate-300">
              Al revocar, el código secreto no permitirá descargas y la página pública QR mostrará el banner de REVOCADO.
            </p>

            <form onSubmit={handleRevokeSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Motivo Obligatorio de Revocación *</label>
                <textarea
                  rows={3}
                  required
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  placeholder="Ej. Error en datos de emisión o anulación de acreditación..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRevokeModal(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  CONFIRMAR REVOCACIÓN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MOSTRAR QR */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
            <h3 className="text-base font-bold text-white">QR de Autenticidad</h3>
            <p className="text-xs text-slate-400">Enlaza a: {showQrModal.qr.verificationUrl}</p>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={showQrModal.qr.qrDataUrl}
              alt="QR Code"
              className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border border-slate-700"
            />

            <a
              href={showQrModal.qr.qrDataUrl}
              download={`QR-${showQrModal.publicId}.png`}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Imagen QR (PNG)</span>
            </a>

            <div>
              <button
                onClick={() => setShowQrModal(null)}
                className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
