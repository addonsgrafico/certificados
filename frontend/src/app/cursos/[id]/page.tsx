'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import CertificateDownloadForm from '@/components/courses/CertificateDownloadForm';
import {
  BookOpen,
  Calendar,
  Building2,
  User,
  CheckCircle2,
  ArrowLeft,
  Award,
  Clock,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    fetchApi(`/courses/${courseId}`)
      .then((data) => setCourse(data))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-500 font-medium">
        Cargando información del curso...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Curso no encontrado</h2>
        <p className="text-slate-600 text-sm">El curso solicitado no existe o ha sido archivado.</p>
        <button
          onClick={() => router.push('/cursos')}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-900 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </button>
      </div>
    );
  }

  const formattedDate = new Date(course.date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const modules = [
    'Módulo 1: Fundamentos de Comunicación Estratégica & Inteligencia Emocional',
    'Módulo 2: Liderazgo Ejecutivo, Negociación y Gestión de Conflictos',
    'Módulo 3: Presentaciones de Alto Impacto e Influencia en Equipos de Trabajo',
    'Módulo 4: Evaluación Práctica, Acreditación y Emisión de Certificado Digital',
  ];

  return (
    <div className="pb-24 space-y-12">
      {/* 1. Header Banner del Curso (Estilo Teresa Baró) */}
      <section className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <button
            onClick={() => router.push('/cursos')}
            className="inline-flex items-center space-x-2 text-xs font-bold text-blue-200 hover:text-white transition-colors bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Cursos</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{course.institution || 'CONSULTANCY ORGANIZATIONAL LLC'}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {course.name}
              </h1>
              <p className="text-slate-300 text-base leading-relaxed max-w-3xl">
                {course.description ||
                  'Capacitación intensiva orientada a potenciar habilidades ejecutivas, comunicación de alto impacto e inteligencia organizacional.'}
              </p>

              <div className="pt-4 flex flex-wrap gap-6 text-xs text-slate-300 border-t border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-amber-400 flex-shrink-0">
                    <Image
                      src="/deisy-barrera.jpg"
                      alt="Deisy Barrera"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <span>Impartido por: <strong className="text-amber-300">{course.instructor || 'Deisy Barrera'}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Fecha: <strong>{formattedDate}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Modalidad: <strong>Presencial / Online Certificado</strong></span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-center space-y-4">
              <Award className="w-12 h-12 text-amber-400 mx-auto" />
              <div>
                <p className="font-bold text-white text-base">Acreditación Oficial</p>
                <p className="text-xs text-slate-300">Con Código QR de Verificación</p>
              </div>
              <div className="pt-2">
                <a
                  href="#descargar-certificado"
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shadow-lg"
                >
                  <span>Descargar Certificado</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Cuerpo del Curso & Formulario de Descarga */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Columna Izquierda: Temario & Módulos */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-slate-900">Temario & Contenido del Programa</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Este programa fue estructurado pedagógicamente por Deisy Barrera para desarrollar competencias aplicables de inmediato en el entorno corporativo e institucional.
              </p>
            </div>

            <div className="space-y-4">
              {modules.map((mod, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start space-x-4"
                >
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-900 font-extrabold text-sm border border-blue-200">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{mod}</h4>
                    <p className="text-slate-500 text-xs mt-1">
                      Módulo teórico-práctico orientado a resultados y desarrollo de destrezas profesionales.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-3xl bg-blue-50 border border-blue-200 space-y-3">
              <h3 className="font-extrabold text-blue-950 text-base flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-900" />
                <span>Respaldo de CONSULTANCY ORGANIZATIONAL LLC</span>
              </h3>
              <p className="text-slate-700 text-xs leading-relaxed">
                Al culminar satisfactoriamente esta capacitación, el participante forma parte de nuestra nómina acreditada y puede validar la vigencia de su certificado en cualquier momento mediante su Cédula de Identidad (CI / DNI) o Código de Estudiante.
              </p>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Formulario de Descarga de Certificado */}
          <div id="descargar-certificado" className="lg:col-span-5">
            <div className="sticky top-28">
              <CertificateDownloadForm
                courseId={course.id}
                courseTitle={course.name}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
