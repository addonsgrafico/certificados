'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import HeroSection from '@/components/home/HeroSection';
import AboutCoach from '@/components/home/AboutCoach';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import SecurityBanner from '@/components/home/SecurityBanner';
import CertificateDownloadForm from '@/components/courses/CertificateDownloadForm';
import { ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Modal de descarga por curso seleccionado
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<any | null>(null);

  useEffect(() => {
    Promise.all([
      fetchApi('/courses').catch(() => []),
      fetchApi('/settings').catch(() => null),
    ])
      .then(([coursesData, settingsData]) => {
        setCourses(coursesData || []);
        setSettings(settingsData);
      })
      .finally(() => setLoading(false));
  }, []);

  const faqs = [
    {
      q: '¿Cómo obtengo y descargo mi certificado de una clase realizada?',
      a: 'Puedes ir a la sección "Cursos & Clases", seleccionar tu clase finalizada e ingresar tu Código de Estudiante y tu Cédula de Identidad (CI / DNI) en el formulario de descarga.',
    },
    {
      q: '¿Cómo se verifica si un certificado de CONSULTANCY ORGANIZATIONAL LLC es auténtico?',
      a: 'Cualquier persona o empresa puede validar un certificado ingresando el código único de 24 caracteres en nuestro verificador público o escaneando el código QR impreso en el PDF.',
    },
    {
      q: '¿Los certificados emitidos por Deisy Barrera tienen validez digital permanente?',
      a: 'Sí, la acreditación digital firmada posee validez inmutable y registro histórico en nuestra base de datos institucional.',
    },
    {
      q: '¿Qué hacer si no recuerdo mi Código de Estudiante?',
      a: 'Puedes ingresar tu Cédula de Identidad (CI/DNI) o tu correo electrónico registrado al momento de realizar la capacitación.',
    },
  ];

  return (
    <div className="space-y-20 pb-24">
      {/* 1. Hero Principal con Foto de Deisy Barrera */}
      <HeroSection settings={settings} />

      {/* 2. Sección Sobre Deisy Barrera */}
      <AboutCoach settings={settings} />

      {/* 3. Catálogo de Clases & Cursos Destacados */}
      <FeaturedCourses
        courses={courses}
        loading={loading}
        onOpenDownloadModal={(c) => setSelectedCourseForModal(c)}
      />

      {/* 4. Sección de Seguridad QR & Firma Digital */}
      <SecurityBanner />

      {/* 5. Preguntas Frecuentes FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900">Preguntas Frecuentes</h2>
          <p className="text-slate-600 text-sm">Resuelve tus dudas sobre la descarga y validez de certificados.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-slate-900 text-sm hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Sección de Contacto Institucional */}
      <section id="contacto" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Atención Personalizada</span>
            <h2 className="text-2xl sm:text-3xl font-black">¿Deseas Asesoría o Tienes Dudas sobre tus Certificados?</h2>
            <p className="text-slate-300 text-sm">
              Comunícate directamente con el equipo directivo de <strong>CONSULTANCY ORGANIZATIONAL LLC</strong> y la Coach Deisy Barrera.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link
              href="/contacto"
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm text-center transition-all shadow-lg shadow-amber-500/20"
            >
              Ir al Formulario de Contacto
            </Link>
          </div>
        </div>
      </section>

      {/* Modal de Descarga de Certificado por Clase */}
      <AnimatePresence>
        {selectedCourseForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg"
            >
              <button
                onClick={() => setSelectedCourseForModal(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
              <CertificateDownloadForm
                courseId={selectedCourseForModal.id}
                courseTitle={selectedCourseForModal.name}
                onSuccess={() => {}}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
