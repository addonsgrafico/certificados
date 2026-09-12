'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import CourseCard from '@/components/courses/CourseCard';
import CertificateDownloadForm from '@/components/courses/CertificateDownloadForm';
import { Sparkles, BookOpen, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de Descarga de Certificado por Clase
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  useEffect(() => {
    fetchApi('/courses')
      .then((data) => setCourses(data))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.institution && c.institution.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-900 text-xs font-bold uppercase tracking-wider border border-blue-200">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>CONSULTANCY ORGANIZATIONAL LLC</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Catálogo de Clases, Tutorías & Certificación
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Si participaste en alguna de nuestras clases impartidas por Deisy Barrera, puedes descargar tu certificado digital oficial ingresando tu <strong>Código de Estudiante</strong> y tu <strong>Cédula de Identidad (CI / DNI)</strong>.
        </p>

        {/* Buscador */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar clase o taller..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>
      </motion.div>

      {/* Grid de Cursos */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 font-medium">Cargando catálogo...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-700 font-bold">No se encontraron clases con el término ingresado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onOpenDownloadModal={(c) => setSelectedCourse(c)}
            />
          ))}
        </div>
      )}

      {/* Modal de Descarga de Certificado */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg"
            >
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <CertificateDownloadForm
                courseId={selectedCourse.id}
                courseTitle={selectedCourse.name}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
