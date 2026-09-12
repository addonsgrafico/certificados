'use client';

import React from 'react';
import Image from 'next/image';
import { Award, CheckCircle2, UserCheck, GraduationCap, Building2, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutCoach({ settings }: { settings?: any }) {
  const orgName = settings?.orgName || 'CONSULTANCY ORGANIZATIONAL LLC';
  const coachName = settings?.coachName || 'Deisy Barrera';
  const coachTitle = settings?.coachTitle || 'Executive Coach & Mentora Organizacional';
  const coachBio =
    settings?.coachBio ||
    'Deisy Barrera es fundadora y mentora principal en CONSULTANCY ORGANIZATIONAL LLC. Especialista en la transformación de competencias ejecutivas, comunicación asertiva y desarrollo de liderazgo estratégico.';
  const coachAvatarUrl = settings?.coachAvatarUrl || '/deisy-barrera-nobg.png';

  const highlights = [
    'Consultoría en Desarrollo y Transformación Organizacional',
    'Coaching Ejecutivo y Mentoring para Líderes e Instituciones',
    'Inteligencia Comunicacional y Presentaciones de Alto Impacto',
    'Acreditación y Certificación Digital Verificable para Alumnos',
  ];

  return (
    <section id="sobre-deisy" className="py-20 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 bg-gradient-to-tr from-slate-100 via-blue-50/60 to-amber-50/40 aspect-[4/5] min-h-[460px] w-full flex items-end justify-center p-4">
              <Image
                src={coachAvatarUrl}
                alt={`${coachName} - Mentora Institucional`}
                fill
                className="object-contain object-bottom hover:scale-105 transition-transform duration-700 drop-shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1 z-10">
                <p className="text-xl font-bold">{coachName}</p>
                <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest">
                  {orgName}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Bio & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-900 text-xs font-bold uppercase tracking-wider border border-blue-200">
              <UserCheck className="w-4 h-4 text-blue-900" />
              <span>Sobre la Coach</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Excelencia en Comunicación, Liderazgo y Desarrollo Institucional
            </h2>

            <p className="text-slate-600 text-base leading-relaxed">
              {coachBio}
            </p>

            <p className="text-slate-600 text-base leading-relaxed">
              Con años de trayectoria acompañando a profesionales, empresas e instituciones académicas, su metodología práctica garantiza un aprendizaje transformador y acreditación oficial respaldada digitalmente.
            </p>

            {/* Bullet points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-slate-800 leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
