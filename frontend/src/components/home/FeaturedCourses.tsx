'use client';

import React from 'react';
import Link from 'next/link';
import CourseCard from '@/components/courses/CourseCard';
import { BookOpen, ArrowRight } from 'lucide-react';

interface FeaturedCoursesProps {
  courses: any[];
  loading: boolean;
  onOpenDownloadModal: (course: any) => void;
}

export default function FeaturedCourses({
  courses,
  loading,
  onOpenDownloadModal,
}: FeaturedCoursesProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-900 text-xs font-bold uppercase tracking-wider border border-blue-200">
          <BookOpen className="w-4 h-4 text-blue-900" />
          <span>Oferta Académica & Capacitación</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Clases, Programas y Tutorías Ejecutivas
        </h2>
        <p className="text-slate-600 text-sm">
          Explora las clases impartidas por la Coach Deisy Barrera en CONSULTANCY ORGANIZATIONAL LLC y descarga tu certificado digital oficial.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Cargando catálogo de clases...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
          <p className="text-slate-600 font-medium">Próximamente se publicarán nuevas cohortes de clases.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.slice(0, 6).map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onOpenDownloadModal={onOpenDownloadModal}
            />
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/cursos"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-md"
        >
          <span>Ver Todas las Clases</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
