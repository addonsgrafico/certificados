'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertOctagon, Building2, User, BookOpen, Calendar, ShieldAlert, Loader2 } from 'lucide-react';

export default function VerifyQrPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    fetchApi(`/verify/${token}`)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError('Ocurrió un error al verificar la autenticidad del documento.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <span className="text-sm text-slate-400">Verificando firma digital del QR...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Certificado No Encontrado</h1>
        <p className="text-slate-400 text-sm">{error || 'El código QR escaneado no coincide con ningún registro en la base de datos oficial.'}</p>
      </div>
    );
  }

  const isRevoked = data.status === 'REVOKED';
  const isExpired = data.status === 'EXPIRED';
  const isValid = data.isValid && data.status === 'ACTIVE';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      
      {/* BANNER PRINCIPAL DE VERIFICACIÓN */}
      <div
        className={`rounded-3xl p-8 border shadow-2xl text-center space-y-4 relative overflow-hidden ${
          isValid
            ? 'bg-emerald-950/40 border-emerald-500/30'
            : isRevoked
            ? 'bg-rose-950/40 border-rose-500/30'
            : 'bg-amber-950/40 border-amber-500/30'
        }`}
      >
        <div className="inline-flex items-center justify-center">
          {isValid && (
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          )}
          {isRevoked && (
            <div className="w-20 h-20 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <ShieldAlert className="w-12 h-12" />
            </div>
          )}
          {isExpired && (
            <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Clock className="w-12 h-12" />
            </div>
          )}
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-slate-400">Verificación Oficial por Código QR</span>
          <h1
            className={`text-3xl font-black uppercase tracking-tight mt-1 ${
              isValid ? 'text-emerald-400' : isRevoked ? 'text-rose-400' : 'text-amber-400'
            }`}
          >
            {isValid
              ? 'CERTIFICADO VERIFICADO'
              : isRevoked
              ? 'CERTIFICADO REVOCADO'
              : 'CERTIFICADO EXPIRADO'}
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-lg mx-auto">
            {isValid
              ? 'La autenticidad de esta credencial ha sido validada directamente en el registro oficial de la institución.'
              : isRevoked
              ? 'Este certificado fue revocado por la institución emisora y ha perdido toda validez oficial.'
              : 'Este certificado ha cumplido su fecha de vencimiento.'}
          </p>
        </div>

        {/* Motivo de Revocación si aplica */}
        {isRevoked && data.revocationReason && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium text-left max-w-xl mx-auto">
            <strong>Motivo de Revocación:</strong> {data.revocationReason}
          </div>
        )}
      </div>

      {/* INFORMACIÓN PERMITIDA DE AUTENTICIDAD */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-8 shadow-2xl space-y-8">
        <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <span>Detalles del Documento Validado</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Persona Beneficiaria</span>
            </span>
            <p className="text-xl font-bold text-white">{data.participantName}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Programa / Curso</span>
            </span>
            <p className="text-base font-semibold text-slate-200">{data.courseName}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Institución Emisora</span>
            </span>
            <p className="text-sm font-medium text-slate-300">{data.institution || 'Organización Emisora'}</p>
            <p className="text-xs text-slate-500">Instructor: {data.instructor}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Fecha de Emisión</span>
            </span>
            <p className="text-sm font-medium text-slate-300">
              {new Date(data.issuedAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="space-y-1 md:col-span-2 border-t border-slate-800 pt-4">
            <span className="text-xs text-slate-500 uppercase font-mono">Identificador Público del Certificado</span>
            <p className="text-base font-mono text-blue-400 font-bold">{data.publicId}</p>
          </div>

        </div>

        {/* NOTA DE SEGURIDAD EXPLICITA */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
          <span className="font-semibold text-slate-300 block">Nota de Privacidad y Seguridad:</span>
          <p>
            Esta página pública por QR confirma exclusivamente la validez del certificado. Por motivos de seguridad y protección de datos personales, el documento PDF original no es descargable desde este enlace.
          </p>
        </div>
      </div>
    </div>
  );
}
