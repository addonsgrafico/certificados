'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/api';
import { FileSpreadsheet, Upload, CheckCircle2, AlertTriangle, FileCheck, Loader2, ArrowRight } from 'lucide-react';

export default function BulkImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPreviewData(null);
      setImportResult(null);
      setErrorMsg(null);
    }
  };

  const handlePreviewSubmit = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetchApi('/admin/certificates/import/preview', {
        method: 'POST',
        body: formData,
      });
      setPreviewData(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar el archivo de importación.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!previewData || !previewData.validRecords || previewData.validRecords.length === 0) return;
    setExecuting(true);
    setErrorMsg(null);

    try {
      const res = await fetchApi('/admin/certificates/import/execute', {
        method: 'POST',
        body: JSON.stringify({ validRecords: previewData.validRecords }),
      });
      setImportResult(res);
      setPreviewData(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error durante la transacción de importación.');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-3">
          <FileSpreadsheet className="w-7 h-7 text-blue-400" />
          <span>Importación Masiva de Certificados (CSV / XLSX)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cargue listados masivos de alumnos y cursos. El sistema validará los registros antes de procesar la transacción.
        </p>
      </div>

      {/* Carga de Archivo */}
      {!importResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-200">
              Seleccionar archivo CSV o Excel (.xlsx)
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-950/60 transition-colors">
              <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer shadow"
              >
                <span>Examinar Archivos</span>
              </label>
              {selectedFile && (
                <span className="block text-xs font-mono text-blue-400 mt-3">
                  Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Columnas admitidas: <code className="text-slate-400">Nombre, Email, Documento, CursoID, FechaEmision</code>
            </p>
          </div>

          {selectedFile && !previewData && (
            <button
              onClick={handlePreviewSubmit}
              disabled={analyzing}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analizando Registros...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>ANALIZAR Y PREVISUALIZAR REGISTROS</span>
                </>
              )}
            </button>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* VISTA PREVIA DEL ANÁLISIS */}
      {previewData && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">Resultado del Análisis Previo</h2>
            <div className="flex space-x-3 text-xs">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                {previewData.validCount} Válidos
              </span>
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/30">
                {previewData.invalidCount} Con Errores
              </span>
            </div>
          </div>

          {/* Registros Inválidos */}
          {previewData.invalidRecords.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Registros Rechazados por Errores
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {previewData.invalidRecords.map((inv: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                    <span className="font-mono font-bold">Fila #{inv.rowNumber}:</span>
                    <span className="block">Errores: {inv.errors.join(' | ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registros Válidos */}
          {previewData.validCount > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Registros Listos para Emisión Transaccional ({previewData.validCount})
              </h3>
              <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold text-[10px] uppercase">
                    <tr>
                      <th className="px-3 py-2">Fila</th>
                      <th className="px-3 py-2">Participante</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Curso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {previewData.validRecords.map((rec: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="px-3 py-2 font-mono text-slate-500">#{rec.rowNumber}</td>
                        <td className="px-3 py-2 font-semibold text-white">{rec.participantName}</td>
                        <td className="px-3 py-2 text-slate-400">{rec.participantEmail || 'N/A'}</td>
                        <td className="px-3 py-2 text-blue-400">{rec.courseName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleExecuteImport}
                disabled={executing}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
              >
                {executing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Ejecutando Transacción Masiva...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>PROCESAR E IMPORTAR {previewData.validCount} CERTIFICADOS</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* REPORTE FINAL DE IMPORTACIÓN */}
      {importResult && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="flex items-center space-x-3 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold text-white">Importación Masiva Completada</h2>
              <span className="text-xs text-slate-400">
                Se emitieron {importResult.importedCount} certificados correctamente.
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase">
              Códigos Secretos Generados (Muestran UNA SOLA VEZ para entrega)
            </h3>
            <div className="max-h-64 overflow-y-auto border border-slate-800 rounded-xl p-4 bg-slate-950 space-y-2">
              {importResult.issuedCertificates.map((cert: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-900 pb-2">
                  <div>
                    <span className="font-semibold text-white">{cert.participantName}</span>
                    <span className="block text-[10px] text-slate-500">{cert.courseName} • ID: {cert.publicId}</span>
                  </div>
                  <span className="font-mono text-blue-400 font-bold bg-slate-900 px-2 py-1 rounded">
                    {cert.secretCode}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedFile(null);
              setImportResult(null);
              setPreviewData(null);
            }}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
          >
            Realizar Otra Importación Masiva
          </button>
        </div>
      )}
    </div>
  );
}
