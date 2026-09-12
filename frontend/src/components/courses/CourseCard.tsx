'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Calendar, Building2, User, Download, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface CourseCardProps {
  course: any;
  onOpenDownloadModal: (course: any) => void;
}

export default function CourseCard({ course, onOpenDownloadModal }: CourseCardProps) {
  const formattedDate = new Date(course.date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-light glass-card-hover rounded-3xl p-6 flex flex-col justify-between space-y-5 border border-slate-200 shadow-md hover:shadow-xl transition-all overflow-hidden"
    >
      <div className="space-y-4">
        {/* Banner / Foto de la Coach Deisy Barrera y la Institución */}
        <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
          <Image
            src="/deisy-barrera.jpg"
            alt={course.name}
            fill
            className="object-cover object-top hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-900/90 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider border border-blue-400/30">
              <Building2 className="w-3 h-3 text-amber-400" />
              <span>CONSULTANCY ORGANIZATIONAL LLC</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/cursos/${course.id}`} className="group block">
          <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
            {course.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
          {course.description || 'Programa de formación y capacitación ejecutiva con certificación oficial.'}
        </p>

        {/* Meta Info con Avatar de Deisy Barrera */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center space-x-2">
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-blue-900/30 flex-shrink-0">
              <Image
                src="/deisy-barrera.jpg"
                alt="Deisy Barrera"
                fill
                className="object-cover object-top"
              />
            </div>
            <span className="font-bold text-slate-900 text-xs">{course.instructor || 'Deisy Barrera'}</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
        <Link
          href={`/cursos/${course.id}`}
          className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Ver Temario</span>
        </Link>
        <button
          onClick={() => onOpenDownloadModal(course)}
          className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Descargar PDF</span>
        </button>
      </div>
    </motion.div>
  );
}
