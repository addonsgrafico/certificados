'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Award, BookOpen, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection({ settings }: { settings?: any }) {
  const orgName = settings?.orgName || 'CONSULTANCY ORGANIZATIONAL LLC';
  const coachName = settings?.coachName || 'Deisy Barrera';
  const coachTitle = settings?.coachTitle || 'Executive Coach & Mentora Organizacional';
  const coachAvatarUrl = settings?.coachAvatarUrl || '/deisy-barrera-nobg.png';

  return (
    <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 bg-radial-gradient-light bg-grid-pattern overflow-hidden">
      {/* Light Ambient Lighting Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-100/60 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-amber-100/60 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text & Value Proposition */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Institution Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-pill-light border border-blue-200 text-blue-950 text-xs font-bold uppercase tracking-wider shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>{orgName}</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight"
            >
              Potencia tu Liderazgo con{' '}
              <span className="gradient-text-navy block sm:inline">{coachName}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Programas ejecutivos, talleres de desarrollo organizacional e inteligencia de comunicación. Emite y descarga tu certificado digital avalado institucionalmente con código QR de verificación.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                href="/cursos"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl bg-blue-900 text-white font-bold text-sm hover:bg-blue-950 transition-all shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explorar Clases y Cursos</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/#sobre-deisy"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl bg-white text-slate-800 font-bold text-sm hover:bg-slate-50 transition-all border border-slate-200 shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <Award className="w-4 h-4 text-amber-600" />
                <span>Sobre {coachName}</span>
              </Link>
            </motion.div>

            {/* Quick Metrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-xl mx-auto lg:mx-0"
            >
              <div className="space-y-1 text-center lg:text-left">
                <p className="text-2xl font-black text-blue-900">+1,500</p>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Estudiantes</p>
              </div>
              <div className="space-y-1 text-center lg:text-left">
                <p className="text-2xl font-black text-blue-900">100%</p>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Validez QR</p>
              </div>
              <div className="space-y-1 text-center lg:text-left">
                <p className="text-2xl font-black text-blue-900">+50</p>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Talleres Exec.</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Coach Deisy Barrera Cutout Portrait (Teresa Baró style) */}
          <div className="lg:col-span-5 flex justify-center relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-md flex flex-col items-center"
            >
              {/* Elegant Aura Circular Backdrop */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] sm:w-[440px] sm:h-[440px] rounded-full bg-gradient-to-tr from-blue-200/60 via-amber-100/50 to-blue-50/40 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] sm:w-[480px] sm:h-[480px] rounded-full border border-blue-200/60 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] sm:w-[520px] sm:h-[520px] rounded-full border border-amber-200/40 pointer-events-none border-dashed" />

              {/* Floating Top Badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute top-4 -right-2 sm:right-2 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-200 shadow-xl text-xs font-bold text-slate-900 flex items-center space-x-2 z-20"
              >
                <div className="p-1 rounded-lg bg-amber-50 text-amber-600">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-[11px] text-slate-900">Mentora Certificada</p>
                  <p className="text-[9px] text-amber-700 font-semibold uppercase tracking-wider">Metodología Ejecutiva</p>
                </div>
              </motion.div>

              {/* Cutout Photo without background */}
              <div className="relative w-[340px] h-[450px] sm:w-[380px] sm:h-[500px] z-10 flex items-end justify-center">
                <Image
                  src={coachAvatarUrl}
                  alt={`${coachName} - Coach Organizacional`}
                  fill
                  className="object-contain object-bottom drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
                  priority
                />
              </div>

              {/* Floating Bottom Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute -bottom-4 left-0 sm:left-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl space-y-1 z-20 max-w-[280px]"
              >
                <p className="text-slate-900 font-extrabold text-sm">{coachName}</p>
                <p className="text-blue-900 text-[11px] font-bold uppercase tracking-wider leading-tight">
                  {coachTitle}
                </p>
                <div className="flex items-center space-x-1.5 pt-1 text-[10px] text-slate-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">{orgName}</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
