'use client';

import React from 'react';
import { ShieldCheck, Award, Lock, CheckCircle2, Server, Eye, FileSpreadsheet, Sparkles, Building2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NosotrosPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-pill border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Institución Emisora Oficial</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Excelencia y Rigor en Acreditaciones Digitales
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Garantizamos la autenticidad, custodia e inviolabilidad de las certificaciones entregadas a estudiantes y profesionales de nuestros programas académicos.
        </p>
      </motion.div>

      {/* Tarjetas de Estándar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card glass-card-hover border border-slate-800/80 rounded-3xl p-8 space-y-5"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Seguridad Criptográfica Inalterable</h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            Cada documento digital se respalda en la base de datos con un digest HMAC-SHA256 y un código Crockford Base32 de alta entropía. Las claves nunca se guardan en texto plano, imposibilitando alteraciones o suplantaciones.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card glass-card-hover border border-slate-800/80 rounded-3xl p-8 space-y-5"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Verificación Pública Desacoplada</h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            Los empleadores e instituciones pueden verificar en segundos el estado activo de la acreditación escaneando el QR, sin exponer los archivos privados o la privacidad del graduado.
          </p>
        </motion.div>

      </div>

      {/* Compromisos de Calidad */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card border border-slate-800/80 rounded-3xl p-8 sm:p-12 space-y-8 text-center"
      >
        <h3 className="text-2xl font-black text-white">Compromisos de Calidad e Infraestructura</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="space-y-2">
            <span className="block text-4xl font-black text-blue-400">0%</span>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">Rutas Públicas Expuestas</span>
            <p className="text-[11px] text-slate-400">Descargas únicamente con tickets temporales</p>
          </div>
          <div className="space-y-2">
            <span className="block text-4xl font-black text-emerald-400">100%</span>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">Auditoría & Trazabilidad</span>
            <p className="text-[11px] text-slate-400">Registro inmutable de emisión y descargas</p>
          </div>
          <div className="space-y-2">
            <span className="block text-4xl font-black text-cyan-300">99.99%</span>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">Disponibilidad del Servicio</span>
            <p className="text-[11px] text-slate-400">Validación instantánea las 24 horas</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
