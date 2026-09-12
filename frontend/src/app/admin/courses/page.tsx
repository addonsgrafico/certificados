'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Calendar,
  Building2,
  FileText,
  Sparkles,
  Award,
  Layers,
  CheckCircle2,
  Clock,
  User,
  Image as ImageIcon,
  ChevronRight,
  ArrowRight,
  Check,
  AlertCircle,
  Info,
  Target,
} from 'lucide-react';
import SiteContentEditor from '@/components/admin/SiteContentEditor';

interface SyllabusModule {
  title: string;
  description: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'cms'>('courses');

  // Modal Crear / Editar Curso
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<'general' | 'syllabus' | 'objectives'>('general');

  const [form, setForm] = useState({
    name: '',
    subtitle: '',
    description: '',
    duration: '12 Horas Académicas',
    institution: 'CONSULTANCY ORGANIZATIONAL LLC',
    instructor: 'Deisy Barrera',
    date: '',
    imageUrl: '/deisy-barrera.jpg',
    isActive: true,
  });

  const [syllabus, setSyllabus] = useState<SyllabusModule[]>([
    {
      title: 'Módulo 1: Fundamentos de Comunicación Estratégica & Inteligencia Emocional',
      description: 'Módulo teórico-práctico orientado a resultados y desarrollo de destrezas profesionales.',
    },
    {
      title: 'Módulo 2: Liderazgo Ejecutivo, Negociación y Gestión de Conflictos',
      description: 'Estrategias aplicadas a negociaciones corporativas complejas y acuerdos interdepartamentales.',
    },
  ]);

  const [objectives, setObjectives] = useState<string[]>([
    'Dominar técnicas avanzadas de comunicación persuasiva y lenguaje corporal.',
    'Aprender a resolver objeciones y negociar con asertividad en mesas de directivos.',
  ]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadCourses = () => {
    setLoading(true);
    fetchApi('/admin/courses')
      .then((data) => setCourses(data))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const openCreate = () => {
    setEditingCourse(null);
    setForm({
      name: '',
      subtitle: '',
      description: '',
      duration: '12 Horas Académicas',
      institution: 'CONSULTANCY ORGANIZATIONAL LLC',
      instructor: 'Deisy Barrera',
      date: new Date().toISOString().split('T')[0],
      imageUrl: '/deisy-barrera.jpg',
      isActive: true,
    });
    setSyllabus([
      {
        title: 'Módulo 1: Fundamentos & Metodología de Alto Rendimiento',
        description: 'Bases teóricas y prácticas para el desarrollo de competencias directivas.',
      },
      {
        title: 'Módulo 2: Aplicación Práctica y Casos Reales',
        description: 'Simulaciones, análisis de escenarios ejecutivos y resolución de problemas.',
      },
    ]);
    setObjectives([
      'Desarrollar habilidades de liderazgo y comunicación de impacto.',
      'Obtener acreditación y certificación oficial verificable.',
    ]);
    setErrorMsg(null);
    setModalTab('general');
    setShowModal(true);
  };

  const openEdit = (course: any) => {
    setEditingCourse(course);
    setForm({
      name: course.name || '',
      subtitle: course.subtitle || '',
      description: course.description || '',
      duration: course.duration || '12 Horas Académicas',
      institution: course.institution || 'CONSULTANCY ORGANIZATIONAL LLC',
      instructor: course.instructor || 'Deisy Barrera',
      date: course.date ? course.date.split('T')[0] : '',
      imageUrl: course.imageUrl || '/deisy-barrera.jpg',
      isActive: course.isActive,
    });

    // Cargar temario existente o inicializar
    if (Array.isArray(course.syllabus) && course.syllabus.length > 0) {
      setSyllabus(course.syllabus);
    } else {
      setSyllabus([
        {
          title: 'Módulo 1: Fundamentos de Comunicación & Liderazgo',
          description: 'Módulo teórico-práctico orientado a resultados y desarrollo de destrezas profesionales.',
        },
      ]);
    }

    // Cargar objetivos existentes o inicializar
    if (Array.isArray(course.objectives) && course.objectives.length > 0) {
      setObjectives(course.objectives);
    } else {
      setObjectives(['Completar satisfactoriamente las evaluaciones y horas de capacitación práctica.']);
    }

    setErrorMsg(null);
    setModalTab('general');
    setShowModal(true);
  };

  const handleAddModule = () => {
    setSyllabus([
      ...syllabus,
      {
        title: `Módulo ${syllabus.length + 1}: Nuevo Tema del Programa`,
        description: 'Descripción detallada de los contenidos y habilidades abordadas en este módulo.',
      },
    ]);
  };

  const handleUpdateModule = (idx: number, field: keyof SyllabusModule, value: string) => {
    const updated = [...syllabus];
    updated[idx] = { ...updated[idx], [field]: value };
    setSyllabus(updated);
  };

  const handleRemoveModule = (idx: number) => {
    if (syllabus.length <= 1) {
      alert('El programa debe contener al menos un módulo temático.');
      return;
    }
    setSyllabus(syllabus.filter((_, i) => i !== idx));
  };

  const handleAddObjective = () => {
    setObjectives([...objectives, 'Nuevo objetivo alcanzado al culminar el programa.']);
  };

  const handleUpdateObjective = (idx: number, value: string) => {
    const updated = [...objectives];
    updated[idx] = value;
    setObjectives(updated);
  };

  const handleRemoveObjective = (idx: number) => {
    setObjectives(objectives.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const payload = {
      ...form,
      syllabus,
      objectives,
    };

    try {
      if (editingCourse) {
        await fetchApi(`/admin/courses/${editingCourse.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi('/admin/courses', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      loadCourses();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el curso.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la clase "${name}"? Solo se puede si no tiene certificados emitidos.`)) return;
    try {
      await fetchApi(`/admin/courses/${id}`, { method: 'DELETE' });
      loadCourses();
    } catch (err: any) {
      alert(err.message || 'No se puede eliminar. Puede tener certificados asociados.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header General */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Gestión de Contenido Web & Clases
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administre la información pública de las clases, temarios completos (estilo Teresa Baró) y los textos institucionales del portal.
          </p>
        </div>

        {activeTab === 'courses' && (
          <button
            onClick={openCreate}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Clase / Curso</span>
          </button>
        )}
      </div>

      {/* Tabs Principales: Cursos vs CMS del Sitio */}
      <div className="flex border-b border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center space-x-2 pb-3 px-1 border-b-2 text-sm font-semibold transition-all ${
            activeTab === 'courses'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Clases, Cursos & Temarios (Programas)</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
            {courses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cms')}
          className={`flex items-center space-x-2 pb-3 px-1 border-b-2 text-sm font-semibold transition-all ${
            activeTab === 'cms'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Textos del Sitio Web (CMS Institucional)</span>
        </button>
      </div>

      {/* PESTAÑA 2: GESTOR DE CONTENIDO WEB (CMS) */}
      {activeTab === 'cms' && <SiteContentEditor />}

      {/* PESTAÑA 1: CATÁLOGO DE CLASES & CURSOS */}
      {activeTab === 'courses' && (
        <>
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Cargando catálogo de clases...</div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <BookOpen className="w-10 h-10 mx-auto text-slate-600" />
              <p className="font-semibold text-sm text-white">No hay clases o cursos registrados</p>
              <p className="text-xs text-slate-400">Cree una nueva clase para publicarla en el portal web.</p>
              <button
                onClick={openCreate}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Primera Clase</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const moduleCount = Array.isArray(course.syllabus) ? course.syllabus.length : 0;
                return (
                  <div
                    key={course.id}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:border-slate-700 transition-all shadow-xl group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <BookOpen className="w-4 h-4" />
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            course.isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {course.isActive ? 'Activo en Web' : 'Borrador'}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-base leading-snug group-hover:text-blue-400 transition-colors">
                        {course.name}
                      </h3>

                      {course.subtitle && (
                        <p className="text-xs font-semibold text-amber-400/90 leading-tight">
                          {course.subtitle}
                        </p>
                      )}

                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {course.description || 'Sin descripción ingresada.'}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                        <div className="flex items-center space-x-2">
                          <User className="w-3.5 h-3.5 text-blue-400" />
                          <span>Coach: {course.instructor || 'Deisy Barrera'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>Duración: {course.duration || 'Por definir'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Layers className="w-3.5 h-3.5 text-amber-400" />
                          <span>Temario: {moduleCount} módulos detallados</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones de Clase */}
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openEdit(course)}
                        className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-semibold text-xs transition-colors border border-blue-500/30"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar Contenido & Temario</span>
                      </button>

                      <button
                        onClick={() => handleDelete(course.id, course.name)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        title="Eliminar Clase"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* MODAL CREAR / EDITAR CLASE COMPLETA (REDESISEÑADO CON ALTA UX/UI) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* 1. Encabezado del Modal con Badge Ejecutivo */}
            <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {editingCourse ? 'Edición de Contenido' : 'Nueva Oferta Académica'}
                    </span>
                    <span className="text-[10px] font-bold text-amber-400/90 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Estilo Teresa Baró</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white leading-tight mt-0.5">
                    {editingCourse ? 'Editar Programa & Temario de la Clase' : 'Crear Nueva Clase Ejecutiva'}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Barra de Navegación por Pestañas / Pasos (UX Fluida) */}
            <div className="px-6 pt-3 pb-3 border-b border-slate-800/80 bg-slate-950/30 flex items-center gap-2 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setModalTab('general')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  modalTab === 'general'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1. Datos del Programa</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('syllabus')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  modalTab === 'syllabus'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2. Temario Modular</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  modalTab === 'syllabus' ? 'bg-blue-800 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {syllabus.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('objectives')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  modalTab === 'objectives'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>3. Objetivos & Metas</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  modalTab === 'objectives' ? 'bg-blue-800 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {objectives.length}
                </span>
              </button>
            </div>

            {/* 3. Contenido del Formulario */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: DATOS GENERALES */}
              {modalTab === 'general' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Título & Subtítulo */}
                  <div className="space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          <span>Nombre de la Clase / Programa *</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">Obligatorio • Se imprime en el certificado</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-semibold text-sm placeholder-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
                        placeholder="Ej. Masterclass de Marca Personal & Networking Ejecutivo"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Subtítulo Informativo / Frase de Impacto</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">Visible en catálogo y cabecera</span>
                      </label>
                      <input
                        type="text"
                        value={form.subtitle}
                        onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 text-xs placeholder-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                        placeholder="Ej. Técnicas aplicadas para hablar en público, convencer y proyectar autoridad directiva."
                      />
                    </div>
                  </div>

                  {/* Duración, Fecha, Coach e Institución */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
                      <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>Duración Acreditada *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-medium text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                        placeholder="Ej. 12 Horas Académicas"
                      />
                      <p className="text-[10px] text-slate-500">Aparece en el reverso/anverso del certificado.</p>
                    </div>

                    <div className="space-y-1.5 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
                      <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>Fecha del Programa / Emisión *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-medium text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                      />
                      <p className="text-[10px] text-slate-500">Fecha oficial de certificación institucional.</p>
                    </div>

                    <div className="space-y-1.5 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
                      <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        <span>Coach / Instructora *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.instructor}
                        onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-medium text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                        placeholder="Deisy Barrera"
                      />
                    </div>

                    <div className="space-y-1.5 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
                      <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Institución Emisora *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.institution}
                        onChange={(e) => setForm({ ...form, institution: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-medium text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                        placeholder="CONSULTANCY ORGANIZATIONAL LLC"
                      />
                    </div>
                  </div>

                  {/* Imagen de Portada con Previsualización en Vivo */}
                  <div className="space-y-3 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
                    <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>Imagen de Portada del Curso</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">URL directa o recurso local</span>
                    </label>

                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="flex-1 w-full space-y-2">
                        <input
                          type="text"
                          value={form.imageUrl}
                          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-mono text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                          placeholder="/deisy-barrera-nobg.png o https://..."
                        />
                        {/* Botones de Presets Rápidos */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-slate-500 font-semibold mr-1">Preajustes:</span>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, imageUrl: '/deisy-barrera-nobg.png' })}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 transition-colors"
                          >
                            👤 Foto Deisy Barrera
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setForm({
                                ...form,
                                imageUrl:
                                  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
                              })
                            }
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 transition-colors"
                          >
                            💼 Oratoria Ejecutiva
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setForm({
                                ...form,
                                imageUrl:
                                  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
                              })
                            }
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 transition-colors"
                          >
                            👥 Negociación & Liderazgo
                          </button>
                        </div>
                      </div>

                      {/* Vista Previa Thumbnail */}
                      <div className="w-28 h-20 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden relative shrink-0 flex items-center justify-center group shadow-md">
                        {form.imageUrl ? (
                          <img
                            src={form.imageUrl}
                            alt="Preview Portada"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as any).src = '/deisy-barrera-nobg.png';
                            }}
                          />
                        ) : (
                          <div className="text-[10px] text-slate-500 text-center p-1">Sin imagen</div>
                        )}
                        <span className="absolute bottom-1 right-1 text-[8px] bg-black/80 px-1 py-0.5 rounded text-slate-300 font-bold">
                          PREVIEW
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Descripción Detallada */}
                  <div className="space-y-1.5 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
                    <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>Descripción Detallada del Curso *</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">Explicación del programa</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 text-xs leading-relaxed placeholder-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                      placeholder="Resumen del contenido, metodología práctica y competencias directivas impartidas..."
                    />
                  </div>

                  {/* Switch Publicado / Borrador */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-950/20 border border-blue-800/40">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white flex items-center space-x-2">
                        <span>Estado de Publicación en la Web</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          form.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {form.isActive ? 'PÚBLICO' : 'BORRADOR PRIVADO'}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {form.isActive
                          ? 'Los estudiantes podrán ver el programa en /cursos y solicitar su certificado digital.'
                          : 'Oculto en el sitio público; accesible solo por administradores.'}
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: TEMARIO MODULAR (SYLLABUS) */}
              {modalTab === 'syllabus' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-950/20 border border-amber-800/40 p-4 rounded-2xl">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                        <Layers className="w-4 h-4" />
                        <span>Estructura del Temario por Módulos ({syllabus.length})</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Organice los temas con metodología ejecutiva estilo Teresa Baró. Se desplegarán como módulos desplegables en el sitio.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddModule}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all shrink-0 self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Añadir Módulo</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {syllabus.map((mod, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/70 border border-slate-800 hover:border-slate-700/90 rounded-2xl p-5 space-y-3 transition-all shadow-md group"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-blue-600 text-white font-mono shadow-sm">
                              MÓDULO 0{idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-300 truncate max-w-xs sm:max-w-md">
                              {mod.title || 'Módulo sin título'}
                            </span>
                          </div>

                          {syllabus.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveModule(idx)}
                              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors flex items-center space-x-1 text-xs"
                              title="Eliminar este módulo"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline text-[10px]">Eliminar</span>
                            </button>
                          )}
                        </div>

                        <div className="space-y-3 pt-1">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-400">Título del Módulo *</label>
                            <input
                              type="text"
                              required
                              value={mod.title}
                              onChange={(e) => handleUpdateModule(idx, 'title', e.target.value)}
                              placeholder="Ej. Módulo 1: Fundamentos de Comunicación & Lenguaje Corporal"
                              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-semibold text-xs focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-400">Temas y Contenidos Desarrollados</label>
                            <textarea
                              rows={2}
                              value={mod.description}
                              onChange={(e) => handleUpdateModule(idx, 'description', e.target.value)}
                              placeholder="Puntos clave, conceptos y ejercicios prácticos impartidos en este módulo..."
                              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 text-xs leading-relaxed focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: OBJETIVOS & METAS */}
              {modalTab === 'objectives' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-950/20 border border-emerald-800/40 p-4 rounded-2xl">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Objetivos & Competencias del Programa ({objectives.length})</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Metas de aprendizaje que el estudiante alcanzará y que respaldan la validez institucional del certificado.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddObjective}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all shrink-0 self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Añadir Objetivo</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {objectives.map((obj, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all group"
                      >
                        <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4" />
                        </span>

                        <input
                          type="text"
                          value={obj}
                          onChange={(e) => handleUpdateObjective(idx, e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-medium text-xs focus:border-blue-500 focus:outline-none"
                          placeholder="Ej. Dominar técnicas avanzadas de persuasión y negociación en entornos ejecutivos."
                        />

                        {objectives.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveObjective(idx)}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0"
                            title="Eliminar objetivo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 p-3.5 rounded-2xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 4. Barra de Acciones y Guardado (Footer del Modal) */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                {/* Atajos de Navegación de Pasos */}
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  {modalTab !== 'general' && (
                    <button
                      type="button"
                      onClick={() => setModalTab(modalTab === 'objectives' ? 'syllabus' : 'general')}
                      className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors"
                    >
                      ← Paso Anterior
                    </button>
                  )}
                  {modalTab !== 'objectives' && (
                    <button
                      type="button"
                      onClick={() => setModalTab(modalTab === 'general' ? 'syllabus' : 'objectives')}
                      className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-semibold text-xs transition-colors border border-blue-500/30"
                    >
                      Siguiente Paso →
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center space-x-2 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{editingCourse ? 'Guardar Cambios de la Clase' : 'Crear y Publicar Clase'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
