'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import {
  Users,
  Search,
  Loader2,
  Plus,
  Award,
  X,
  CheckCircle,
  Copy,
  Check,
  Mail,
  GraduationCap,
  Sparkles,
  Folder,
  FolderOpen,
  BookOpen,
  Clock,
  Download,
  QrCode,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  FileText,
  Calendar,
  UserCheck,
} from 'lucide-react';

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Selector de Modo de Vista: Carpetas (Expedientes) vs Tabla
  const [viewMode, setViewMode] = useState<'folders' | 'table'>('folders');

  // Modal / Drawer de Carpetita (Expediente del Estudiante)
  const [selectedFolder, setSelectedFolder] = useState<any | null>(null);
  const [folderTab, setFolderTab] = useState<'courses' | 'certificates' | 'profile'>('courses');

  // Modales adicionales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<any | null>(null);
  const [showQrModal, setShowQrModal] = useState<any | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<{
    publicId: string;
    id: string;
    participantName: string;
    courseName: string;
    email?: string;
  } | null>(null);

  // Formulario Crear Estudiante
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    email: '',
    internalDocument: '',
  });
  const [creating, setCreating] = useState(false);

  // Formulario Asignar Clase / Emitir Certificado
  const [assignForm, setAssignForm] = useState({
    courseEventId: '',
    autoGenerate: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadParticipants = () => {
    setLoading(true);
    const q = new URLSearchParams({
      page: page.toString(),
      limit: '24',
      ...(search ? { search } : {}),
    });
    fetchApi(`/admin/participants?${q}`)
      .then((res) => {
        setParticipants(res.items || []);
        setTotal(res.total || 0);

        // Si hay una carpeta abierta, actualizar sus datos en vivo
        if (selectedFolder) {
          const updated = (res.items || []).find((p: any) => p.id === selectedFolder.id);
          if (updated) setSelectedFolder(updated);
        }
      })
      .catch(() => setParticipants([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadParticipants();
    fetchApi('/admin/courses')
      .then((res) => setCourses(res || []))
      .catch(() => setCourses([]));
  }, [page, search]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.fullName.trim()) return;

    setCreating(true);
    try {
      const newStudent = await fetchApi('/admin/participants', {
        method: 'POST',
        body: JSON.stringify(studentForm),
      });
      setShowCreateModal(false);
      setStudentForm({ fullName: '', email: '', internalDocument: '' });
      loadParticipants();
      // Abrir inmediatamente la carpetita del nuevo estudiante
      setSelectedFolder(newStudent);
      setFolderTab('courses');
    } catch (err: any) {
      alert(err.message || 'Error al registrar estudiante.');
    } finally {
      setCreating(false);
    }
  };

  const handleAssignClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAssignModal || !assignForm.courseEventId) {
      setErrorMsg('Debe seleccionar un curso o clase.');
      return;
    }

    if (!assignForm.autoGenerate && !selectedFile) {
      setErrorMsg('Debe adjuntar el archivo PDF o seleccionar generación automática.');
      return;
    }

    setAssigning(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('participantName', showAssignModal.fullName);
      if (showAssignModal.email) formData.append('participantEmail', showAssignModal.email);
      if (showAssignModal.internalDocument) formData.append('participantDocument', showAssignModal.internalDocument);
      formData.append('courseEventId', assignForm.courseEventId);

      if (!assignForm.autoGenerate && selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetchApi('/admin/certificates/issue', {
        method: 'POST',
        body: formData,
      });

      const assignedCourse = courses.find((c) => c.id === assignForm.courseEventId);

      setShowAssignModal(null);
      setAssignForm({ courseEventId: '', autoGenerate: true });
      setSelectedFile(null);

      // Mostrar confirmación limpia sin criptografía confusa
      setShowSuccessModal({
        publicId: res.certificate.publicId,
        id: res.certificate.id,
        participantName: showAssignModal.fullName,
        courseName: assignedCourse?.name || 'Capacitación Oficial',
        email: showAssignModal.email,
      });

      loadParticipants();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al generar el certificado.');
    } finally {
      setAssigning(false);
    }
  };

  const handleSendEmail = async (id: string, currentEmail?: string) => {
    const targetEmail = prompt('Ingrese el correo al que desea enviar el certificado:', currentEmail || '');
    if (!targetEmail || !targetEmail.trim()) return;

    try {
      await fetchApi(`/admin/certificates/${id}/send-email`, {
        method: 'POST',
        body: JSON.stringify({ email: targetEmail.trim() }),
      });
      alert(`✅ Correo de notificación enviado con éxito a ${targetEmail.trim()}.`);
    } catch (err: any) {
      alert(err.message || 'Error al enviar el correo.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header General con Switcher de Vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Expedientes de Alumnos
            </span>
            <span className="text-[10px] font-bold text-amber-400/90 flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>CONSULTANCY ORGANIZATIONAL LLC</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center space-x-2">
            <Folder className="w-7 h-7 text-amber-400 fill-amber-400/20" />
            <span>Carpetas & Expedientes de Estudiantes</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión modular de estudiantes: revise qué cursos cursan, cuáles han completado y acceda directamente a sus diplomas oficiales.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {/* Switcher de Vista */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center space-x-1">
            <button
              onClick={() => setViewMode('folders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === 'folders'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vista en Carpetas"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Carpetas</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vista en Tabla"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Estudiante</span>
          </button>
        </div>
      </div>

      {/* 2. Buscador y Filtros Rápidos */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre, CI / DNI o correo..."
            className="w-full px-4 py-2.5 pl-10 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="text-xs text-slate-400 flex items-center space-x-2">
          <span>Total registrados:</span>
          <span className="font-mono font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            {total} alumnos
          </span>
        </div>
      </div>

      {/* 3. VISTA EN CARPETAS / EXPEDIENTES (MODULAR) */}
      {viewMode === 'folders' && (
        <>
          {loading ? (
            <div className="p-16 text-center text-slate-500 bg-slate-900/60 border border-slate-800 rounded-3xl">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
              <p className="font-semibold text-slate-300 text-sm">Cargando carpetas de estudiantes...</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="p-16 text-center text-slate-500 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
              <Folder className="w-12 h-12 text-slate-600 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-slate-300">No se encontraron expedientes</h3>
                <p className="text-xs text-slate-500 mt-1">Registra tu primer estudiante para organizar sus cursos y diplomas.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Primer Estudiante</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {participants.map((p) => {
                const certs = p.certificates || [];
                const certCount = p._count?.certificates ?? certs.length;
                const initials = p.fullName
                  .split(' ')
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <div
                    key={p.id}
                    className="relative bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-6 flex flex-col justify-between space-y-5 transition-all shadow-xl hover:shadow-blue-900/10 group cursor-pointer"
                    onClick={() => {
                      setSelectedFolder(p);
                      setFolderTab('courses');
                    }}
                  >
                    {/* Estilo Pestaña de Carpeta Superior */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
                          {initials || 'AL'}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-blue-400 transition-colors line-clamp-1">
                            {p.fullName}
                          </h3>
                          <p className="text-xs font-mono text-slate-400">
                            CI / DNI: <span className="text-slate-300 font-semibold">{p.internalDocument || 'N/A'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Correo y Fecha de Registro */}
                    <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                      <div className="flex items-center space-x-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{p.email || <span className="italic text-slate-600">Sin correo</span>}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-[11px] text-slate-500">
                          Registrado el {new Date(p.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>

                    {/* Resumen Académico del Alumno */}
                    <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-semibold flex items-center space-x-1">
                          <Award className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Certificados Emitidos:</span>
                        </span>
                        <span className="font-bold text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          {certCount} oficial{certCount === 1 ? '' : 'es'}
                        </span>
                      </div>

                      {/* Vista previa de cursos cursados */}
                      {certs.length > 0 ? (
                        <div className="space-y-1 pt-1 border-t border-slate-800/60">
                          {certs.slice(0, 2).map((c: any) => (
                            <div key={c.id} className="text-[11px] text-slate-300 flex items-center space-x-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              <span className="truncate">{c.courseEvent?.name || 'Curso Acreditado'}</span>
                            </div>
                          ))}
                          {certs.length > 2 && (
                            <p className="text-[10px] text-slate-500 italic pl-3">
                              +{certs.length - 2} capacitaciones más en expediente...
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">Sin cursos certificados todavía.</p>
                      )}
                    </div>

                    {/* Acciones Rápidas de Carpeta */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFolder(p);
                          setFolderTab('courses');
                        }}
                        className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs transition-colors border border-blue-500/30"
                      >
                        <Folder className="w-3.5 h-3.5 text-amber-400" />
                        <span>Abrir Expediente</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAssignModal(p);
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold text-xs transition-colors border border-emerald-500/30"
                        title="Asignar clase y emitir certificado digital"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Asignar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 4. VISTA EN TABLA CLÁSICA */}
      {viewMode === 'table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Estudiante</th>
                <th className="px-4 py-3">Documento (CI / DNI)</th>
                <th className="px-4 py-3">Correo Electrónico</th>
                <th className="px-4 py-3">Cursos Aprobados</th>
                <th className="px-4 py-3">Fecha Alta</th>
                <th className="px-4 py-3 text-right">Expediente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                    Cargando estudiantes...
                  </td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No se encontraron estudiantes.
                  </td>
                </tr>
              ) : (
                participants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-white">{p.fullName}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{p.internalDocument || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-400">{p.email || 'Sin correo'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                        {p._count?.certificates ?? 0} cert.
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedFolder(p);
                          setFolderTab('courses');
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/30"
                      >
                        <Folder className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ver Carpetita</span>
                      </button>

                      <button
                        onClick={() => setShowAssignModal(p)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold border border-emerald-500/30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Asignar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Mostrando {participants.length} de {total} expedientes</span>
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
            disabled={page * 24 >= total}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* 5. MODAL DE LA CARPETITA / EXPEDIENTE COMPLETO DEL ALUMNO */}
      {selectedFolder && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Cabecera del Expediente (Estilo Folder Tab Ejecutivo) */}
            <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-amber-600/30">
                  <Folder className="w-6 h-6 fill-white/20" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Expediente Académico
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      CI: <strong className="text-white">{selectedFolder.internalDocument || 'N/A'}</strong>
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white leading-tight mt-0.5">
                    {selectedFolder.fullName}
                  </h2>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAssignModal(selectedFolder)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Asignar a Clase</span>
                </button>

                <button
                  onClick={() => setSelectedFolder(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Pestañas de la Carpetita */}
            <div className="px-6 pt-3 pb-3 border-b border-slate-800 bg-slate-950/30 flex items-center gap-2 shrink-0">
              <button
                onClick={() => setFolderTab('courses')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  folderTab === 'courses'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>1. Cursos & Historial Académico</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
                  {selectedFolder.certificates?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setFolderTab('certificates')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  folderTab === 'certificates'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>2. Diplomas & Certificados Emitidos</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
                  {selectedFolder.certificates?.length || 0}
                </span>
              </button>
            </div>

            {/* Contenido de la Carpetita */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: CURSOS & HISTORIAL ACADÉMICO */}
              {folderTab === 'courses' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Capacitaciones & Clases Cursadas</h4>
                      <p className="text-xs text-slate-400">
                        Historial de programas en los que el alumno ha sido matriculado y su estado de aprobación.
                      </p>
                    </div>
                  </div>

                  {(!selectedFolder.certificates || selectedFolder.certificates.length === 0) ? (
                    <div className="p-12 text-center bg-slate-950/40 border border-slate-800 rounded-2xl space-y-3">
                      <GraduationCap className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400">
                        El estudiante aún no tiene cursos ni certificados registrados en su carpeta.
                      </p>
                      <button
                        onClick={() => setShowAssignModal(selectedFolder)}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Asignar Primera Clase</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedFolder.certificates.map((cert: any) => {
                        const course = cert.courseEvent;
                        return (
                          <div
                            key={cert.id}
                            className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  ✓ APROBADO & CERTIFICADO
                                </span>
                                <span className="text-[10px] font-mono text-blue-400">
                                  ID: {cert.publicId}
                                </span>
                              </div>

                              <h5 className="font-extrabold text-white text-sm">
                                {course?.name || 'Programa de Capacitación'}
                              </h5>

                              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                                  <span>{course?.duration || '12 Horas Académicas'}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Emitido: {new Date(cert.issuedAt).toLocaleDateString('es-ES')}</span>
                                </span>
                                <span>{course?.institution || 'CONSULTANCY ORGANIZATIONAL LLC'}</span>
                              </div>
                            </div>

                            {/* Acciones Rápidas del Curso */}
                            <div className="flex items-center space-x-2 shrink-0">
                              <a
                                href={`http://localhost:4000/api/v1/certificates/download?publicId=${cert.publicId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-semibold text-xs flex items-center space-x-1.5 border border-blue-500/30"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Descargar PDF</span>
                              </a>

                              <button
                                onClick={() => {
                                  setShowQrModal({
                                    id: cert.id,
                                    publicId: cert.publicId,
                                    participant: { fullName: selectedFolder.fullName },
                                    courseEvent: course,
                                  });
                                }}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                                title="Ver QR"
                              >
                                <QrCode className="w-4 h-4 text-amber-400" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CERTIFICADOS DIGITALES EMITIDOS */}
              {folderTab === 'certificates' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Diplomas Oficiales Verificables</h4>
                      <p className="text-xs text-slate-400">
                        Cada diploma cuenta con firma institucional y código QR de verificación pública sin claves secretas.
                      </p>
                    </div>
                  </div>

                  {(!selectedFolder.certificates || selectedFolder.certificates.length === 0) ? (
                    <div className="p-12 text-center bg-slate-950/40 border border-slate-800 rounded-2xl">
                      <p className="text-xs text-slate-500">No hay certificados emitidos para este estudiante.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedFolder.certificates.map((cert: any) => (
                        <div
                          key={cert.id}
                          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 space-y-3 shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                              {cert.publicId}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400">ACTIVO & VERIFICABLE</span>
                          </div>

                          <div>
                            <h5 className="font-bold text-white text-xs leading-snug line-clamp-2">
                              {cert.courseEvent?.name || 'Certificado de Acreditación'}
                            </h5>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {cert.courseEvent?.institution || 'CONSULTANCY ORGANIZATIONAL LLC'}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                            <a
                              href={`http://localhost:4000/api/v1/certificates/download?publicId=${cert.publicId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-semibold text-[11px] flex items-center justify-center space-x-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Descargar PDF</span>
                            </a>

                            <button
                              onClick={() => {
                                setShowQrModal({
                                  id: cert.id,
                                  publicId: cert.publicId,
                                  participant: { fullName: selectedFolder.fullName },
                                  courseEvent: cert.courseEvent,
                                });
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title="Ver Código QR"
                            >
                              <QrCode className="w-3.5 h-3.5 text-amber-400" />
                            </button>

                            <button
                              onClick={() => handleSendEmail(cert.id, selectedFolder.email)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400"
                              title="Enviar por Correo Electrónico"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer de la Carpetita */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Expediente protegido institucionalmente</span>
              </span>
              <button
                onClick={() => setSelectedFolder(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL CREAR NUEVO ESTUDIANTE */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Registrar Nuevo Estudiante</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Nombre Completo del Estudiante *</label>
                <input
                  type="text"
                  required
                  value={studentForm.fullName}
                  onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                  placeholder="Ej. Ana Lucía Ramírez"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Documento de Identificación / Cédula / DNI *</label>
                <input
                  type="text"
                  required
                  value={studentForm.internalDocument}
                  onChange={(e) => setStudentForm({ ...studentForm, internalDocument: e.target.value })}
                  placeholder="Ej. 1726394820"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Correo Electrónico Oficial</label>
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  placeholder="ana.ramirez@ejemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Crear Expediente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL ASIGNAR CLASE Y EMITIR CERTIFICADO */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>Asignar Clase & Emitir Diploma Digital</span>
              </h3>
              <button onClick={() => setShowAssignModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Expediente del Alumno:</span>
              <p className="text-sm font-bold text-white">{showAssignModal.fullName}</p>
              <p className="text-slate-400 text-xs">
                CI / DNI: <span className="text-slate-200 font-mono">{showAssignModal.internalDocument || 'N/A'}</span>
                {showAssignModal.email && ` • ${showAssignModal.email}`}
              </p>
            </div>

            <form onSubmit={handleAssignClassSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Seleccionar Clase / Curso *</label>
                <select
                  required
                  value={assignForm.courseEventId}
                  onChange={(e) => setAssignForm({ ...assignForm, courseEventId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-medium focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Seleccione una clase del catálogo --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.duration || '12 Horas Académicas'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle Generación Automática */}
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 space-y-1.5">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignForm.autoGenerate}
                    onChange={(e) => setAssignForm({ ...assignForm, autoGenerate: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-950 border-slate-700"
                  />
                  <span className="font-bold text-blue-200 text-xs">
                    Generar diseño de certificado PDF automáticamente (Recomendado)
                  </span>
                </label>
                <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                  El sistema generará el PDF apaisado institucional con sellos oficiales, firma de Deisy Barrera y código QR verificable.
                </p>
              </div>

              {!assignForm.autoGenerate && (
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <label className="text-xs font-bold text-slate-200">Subir Archivo PDF del Certificado *</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    required={!assignForm.autoGenerate}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white file:text-xs file:font-semibold hover:file:bg-blue-500"
                  />
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-2 disabled:opacity-50"
                >
                  {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                  <span>Emitir Diploma Oficial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL CONFIRMACIÓN DE EMISIÓN EXITOSA */}
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
              <h3 className="text-xl font-bold text-white pt-1">¡Diploma Guardado en Expediente!</h3>
              <p className="text-xs text-slate-400">
                El certificado ha sido emitido con validez institucional permanente.
              </p>
            </div>

            {/* Resumen */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Estudiante:</span>
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
                    alert('ID copiado');
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copiar ID</span>
                </button>
              </div>
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`http://localhost:4000/api/v1/certificates/download?publicId=${showSuccessModal.publicId}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/25 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF</span>
              </a>

              <button
                onClick={() => {
                  setShowQrModal({
                    id: showSuccessModal.id,
                    publicId: showSuccessModal.publicId,
                    participant: { fullName: showSuccessModal.participantName },
                    courseEvent: { name: showSuccessModal.courseName },
                  });
                  setShowSuccessModal(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 border border-slate-700"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Ver Código QR</span>
              </button>
            </div>

            {showSuccessModal.email && (
              <button
                onClick={() => handleSendEmail(showSuccessModal.id, showSuccessModal.email)}
                className="w-full py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-blue-500/20"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Enviar Notificación por Correo</span>
              </button>
            )}

            <button
              onClick={() => setShowSuccessModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
            >
              Finalizar
            </button>
          </div>
        </div>
      )}

      {/* 9. MODAL VER CÓDIGO QR */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-white">Código QR de Autenticidad</h3>
            <p className="text-xs text-slate-400">
              {showQrModal.participant?.fullName} — {showQrModal.courseEvent?.name}
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mx-auto">
              <img
                src={`http://localhost:4000/api/v1/admin/certificates/${showQrModal.id}/qr`}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
                onError={(e) => {
                  (e.target as any).src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `http://localhost:3000/verify/${showQrModal.publicId}`
                  )}`;
                }}
              />
            </div>

            <p className="text-[11px] font-mono text-blue-400 font-semibold">
              ID: {showQrModal.publicId}
            </p>

            <button
              onClick={() => setShowQrModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
