'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Lock, Mail, KeyRound, ShieldCheck, AlertTriangle, QrCode, ArrowRight, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados MFA
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaSetupRequired, setMfaSetupRequired] = useState(false);
  const [mfaQrData, setMfaQrData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, pass: password, totpCode: totpCode || undefined }),
      });

      if (res.mfaRequired) {
        setMfaRequired(true);
        if (res.mfaSetupRequired) {
          setMfaSetupRequired(true);
          setMfaQrData(res.mfaQrData);
        }
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaQrData || !totpCode) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      await fetchApi('/auth/mfa/enable', {
        method: 'POST',
        body: JSON.stringify({ secret: mfaQrData.secret, totpCode }),
      });
      router.push('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'El código TOTP ingresado es incorrecto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-950 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-600/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Acceso Institucional</h1>
          <p className="text-xs text-slate-400">
            Portal administrativo seguro de gestión y emisión de certificados.
          </p>
        </div>

        {/* SETUP MFA OBLIGATORIO */}
        {mfaSetupRequired && mfaQrData ? (
          <form onSubmit={handleEnableMfaSubmit} className="space-y-6">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center space-y-3">
              <div className="inline-flex items-center space-x-1.5 text-blue-400 text-xs font-semibold">
                <QrCode className="w-4 h-4" />
                <span>Configuración Obligatoria TOTP MFA</span>
              </div>
              <p className="text-xs text-slate-300">
                Escanee este código con Google Authenticator o Authy para vincular su cuenta SuperAdmin.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mfaQrData.qrCodeDataUrl}
                alt="QR TOTP Setup"
                className="w-44 h-44 mx-auto rounded-xl border border-slate-700 bg-white p-2"
              />
              <p className="text-[10px] font-mono text-slate-500">Clave Manual: {mfaQrData.secret}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-200">Ingrese el código de 6 dígitos</label>
              <input
                type="text"
                required
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-lg tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="123456"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg transition-all"
            >
              ACTIVAR MFA E INICIAR SESIÓN
            </button>
          </form>
        ) : (
          /* FORMULARIO ESTÁNDAR LOGIN */
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200">Correo Electrónico</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="admin@organizacion.org"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200">Contraseña</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="••••••••••••"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {mfaRequired && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="block text-xs font-semibold text-blue-400">Código TOTP MFA (6 dígitos)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-950 border border-blue-500/50 text-white font-mono text-base tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="000000"
                    />
                    <KeyRound className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>INGRESAR AL PANEL</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
