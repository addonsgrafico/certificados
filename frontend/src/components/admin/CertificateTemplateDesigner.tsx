'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fetchApi } from '@/lib/api';
import {
  Sliders,
  Upload,
  FileUp,
  Save,
  Eye,
  Loader2,
  Trash2,
  Sparkles,
  CheckCircle2,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface CertificateTemplateDesignerProps {
  courses: any[];
  onRefreshCourses?: () => void;
}

export default function CertificateTemplateDesigner({
  courses,
  onRefreshCourses,
}: CertificateTemplateDesignerProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses.length > 0 ? courses[0].id : ''
  );

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const [editorConfig, setEditorConfig] = useState({
    nameYPercent: 52,
    nameFontSize: 26,
    fontColorHex: '#0f2c59',
    accreditationText: 'Por haber completado y aprobado satisfactoriamente los módulos de:',
  });

  const [savingConfig, setSavingConfig] = useState(false);
  const [testingPdf, setTestingPdf] = useState(false);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sincronizar configuración al cambiar de curso
  useEffect(() => {
    if (selectedCourse?.templateConfig) {
      setEditorConfig({
        nameYPercent: selectedCourse.templateConfig.nameYPercent || 52,
        nameFontSize: selectedCourse.templateConfig.nameFontSize || 26,
        fontColorHex: selectedCourse.templateConfig.fontColorHex || '#0f2c59',
        accreditationText:
          selectedCourse.templateConfig.accreditationText ||
          'Por haber completado y aprobado satisfactoriamente los módulos de:',
      });
    } else {
      setEditorConfig({
        nameYPercent: 52,
        nameFontSize: 26,
        fontColorHex: '#0f2c59',
        accreditationText: 'Por haber completado y aprobado satisfactoriamente los módulos de:',
      });
    }
  }, [selectedCourseId, selectedCourse]);

  // Dibujado en Canvas interactivo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedCourse) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Proporción estándar diploma apaisado
    canvas.width = 760;
    canvas.height = 500;

    // Fondo elegante marfil / crema corporativo
    ctx.fillStyle = '#FAFAF9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Doble marco ornamental dorado
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

    ctx.strokeStyle = '#0F2C59';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(26, 26, canvas.width - 52, canvas.height - 52);

    // Decoración de esquinas
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(14, 14, 12, 12);
    ctx.fillRect(canvas.width - 26, 14, 12, 12);
    ctx.fillRect(14, canvas.height - 26, 12, 12);
    ctx.fillRect(canvas.width - 26, canvas.height - 26, 12, 12);

    // Encabezado institucional
    ctx.fillStyle = '#0F2C59';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((selectedCourse.institution || 'CONSULTANCY ORGANIZATIONAL LLC').toUpperCase(), canvas.width / 2, 65);

    ctx.fillStyle = '#B45309';
    ctx.font = 'bold 22px serif';
    ctx.fillText('CERTIFICADO DE ACREDITACIÓN PROFESIONAL', canvas.width / 2, 100);

    ctx.fillStyle = '#64748B';
    ctx.font = '12px sans-serif';
    ctx.fillText('El comité académico y evaluador otorga la presente distinción a:', canvas.width / 2, 135);

    // Nombre interactivo del estudiante (según sliders)
    const nameY = (editorConfig.nameYPercent / 100) * canvas.height;
    ctx.fillStyle = editorConfig.fontColorHex;
    ctx.font = `bold ${editorConfig.nameFontSize}px serif`;
    ctx.fillText('María Fernanda Gómez (Ejemplo)', canvas.width / 2, nameY);

    // Subrayado estilizado bajo el nombre
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 160, nameY + 8);
    ctx.lineTo(canvas.width / 2 + 160, nameY + 8);
    ctx.stroke();

    // Texto de acreditación
    ctx.fillStyle = '#475569';
    ctx.font = '12px sans-serif';
    ctx.fillText(editorConfig.accreditationText, canvas.width / 2, nameY + 38);

    // Nombre del curso seleccionado
    ctx.fillStyle = '#0F2C59';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`"${selectedCourse.name}"`, canvas.width / 2, nameY + 68);

    // Duración y fecha
    ctx.fillStyle = '#64748B';
    ctx.font = '11px sans-serif';
    const dur = selectedCourse.duration ? `Con una duración acreditada de ${selectedCourse.duration}. ` : '';
    ctx.fillText(`${dur}Registrado en la nómina oficial el ${new Date().toLocaleDateString('es-ES')}.`, canvas.width / 2, nameY + 92);

    // Firma Coach Deisy Barrera (Izquierda)
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, canvas.height - 75);
    ctx.lineTo(260, canvas.height - 75);
    ctx.stroke();

    ctx.fillStyle = '#0F2C59';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(selectedCourse.instructor || 'Coach Deisy Barrera', 170, canvas.height - 58);
    ctx.fillStyle = '#64748B';
    ctx.font = '10px sans-serif';
    ctx.fillText('Executive Coach & Mentora Organizacional', 170, canvas.height - 42);

    // Sello QR Oficial y Hash Crockford (Derecha)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(canvas.width - 150, canvas.height - 110, 80, 80);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.strokeRect(canvas.width - 150, canvas.height - 110, 80, 80);

    ctx.fillStyle = '#0F2C59';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[ SELLO QR ]', canvas.width - 110, canvas.height - 65);

    ctx.fillStyle = '#64748B';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VALIDACIÓN OFICIAL', canvas.width - 110, canvas.height - 20);
  }, [selectedCourse, editorConfig]);

  // Guardar configuración de plantilla
  const handleSaveConfig = async () => {
    if (!selectedCourse) return;
    setSavingConfig(true);
    setStatusMsg(null);
    try {
      await fetchApi(`/admin/courses/${selectedCourse.id}/template-config`, {
        method: 'PUT',
        body: JSON.stringify(editorConfig),
      });
      setStatusMsg({ type: 'success', text: '✅ Calibración de la plantilla guardada con éxito.' });
      if (onRefreshCourses) onRefreshCourses();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error al guardar calibración.' });
    } finally {
      setSavingConfig(false);
    }
  };

  // Subir plantilla PDF personalizada
  const handleUploadTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !templateFile) return;

    setUploadingTemplate(true);
    setStatusMsg(null);
    const formData = new FormData();
    formData.append('template', templateFile);

    try {
      await fetchApi(`/admin/courses/${selectedCourse.id}/template`, {
        method: 'POST',
        body: formData,
      });
      setStatusMsg({ type: 'success', text: '✅ Plantilla PDF/PNG subida y vinculada al curso.' });
      setTemplateFile(null);
      if (onRefreshCourses) onRefreshCourses();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error al subir la plantilla.' });
    } finally {
      setUploadingTemplate(false);
    }
  };

  // Restablecer plantilla estándar
  const handleRemoveTemplate = async () => {
    if (!selectedCourse) return;
    if (!confirm('¿Desea restablecer a la plantilla estándar institucional?')) return;

    try {
      await fetchApi(`/admin/courses/${selectedCourse.id}/template`, { method: 'DELETE' });
      setStatusMsg({ type: 'success', text: '✅ Se restauró la plantilla estándar institucional.' });
      if (onRefreshCourses) onRefreshCourses();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error al restablecer.' });
    }
  };

  // Generar y descargar PDF de muestra
  const handleTestPdf = async () => {
    if (!selectedCourse) return;
    setTestingPdf(true);
    setStatusMsg(null);
    try {
      // 1. Guardar primero la calibración actual
      await fetchApi(`/admin/courses/${selectedCourse.id}/template-config`, {
        method: 'PUT',
        body: JSON.stringify(editorConfig),
      });

      // 2. Emitir muestra de prueba
      const formData = new FormData();
      formData.append('participantName', 'María Fernanda Gómez (Muestra Oficial)');
      formData.append('courseEventId', selectedCourse.id);

      const res = await fetchApi('/admin/certificates/issue', {
        method: 'POST',
        body: formData,
      });

      if (res.secretCode) {
        const searchRes = await fetchApi('/certificates/search', {
          method: 'POST',
          body: JSON.stringify({ code: res.secretCode }),
        });

        if (searchRes.downloadTicket) {
          const downloadUrl = `http://localhost:4000/api/v1/certificates/download?ticket=${searchRes.downloadTicket}`;
          window.open(downloadUrl, '_blank');
          setStatusMsg({ type: 'success', text: '✅ Muestra PDF generada en nueva pestaña.' });
        }
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error al generar muestra PDF.' });
    } finally {
      setTestingPdf(false);
    }
  };

  if (!courses || courses.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
        No hay cursos registrados para editar sus plantillas de certificados.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Selector de Clase */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Diseño de Certificados & Calibración Visual</span>
          </div>
          <h2 className="text-xl font-bold text-white">Editor de Diplomas por Curso / Clase</h2>
          <p className="text-xs text-slate-400">
            Ajuste el diseño visual, calibre la posición del nombre del estudiante y suba plantillas gráficas.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs text-slate-400 font-semibold shrink-0">Clase / Curso:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-3 border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
              : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Grid: Canvas Preview + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Columna Izquierda: Vista Previa Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Vista Previa en Vivo del Diploma
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {selectedCourse?.templateStoragePath ? '🎨 Plantilla PDF Personalizada' : '📜 Plantilla Estándar CONSULTANCY'}
            </span>
          </div>

          <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-center p-2 shadow-inner">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto rounded-xl shadow-md border border-slate-300/40"
            />
          </div>

          {/* Subir archivo de plantilla */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <form onSubmit={handleUploadTemplate} className="flex items-center space-x-2 w-full sm:w-auto">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
              <button
                type="submit"
                disabled={!templateFile || uploadingTemplate}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {uploadingTemplate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Subir PDF</span>
              </button>
            </form>

            {selectedCourse?.templateStoragePath && (
              <button
                onClick={handleRemoveTemplate}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/50 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Restaurar Estándar</span>
              </button>
            )}
          </div>
        </div>

        {/* Columna Derecha: Panel de Calibración y Textos (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Controles de Calibración Visual
            </h3>
          </div>

          <div className="space-y-5">
            {/* Control: Posición Vertical */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Posición Vertical del Nombre:</span>
                <span className="text-blue-400 font-mono">{editorConfig.nameYPercent}%</span>
              </div>
              <input
                type="range"
                min={25}
                max={75}
                value={editorConfig.nameYPercent}
                onChange={(e) =>
                  setEditorConfig({ ...editorConfig, nameYPercent: parseInt(e.target.value) })
                }
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Mueva la barra para subir o bajar el nombre sobre la línea del diploma.
              </span>
            </div>

            {/* Control: Tamaño de Fuente */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Tamaño de Letra del Alumno:</span>
                <span className="text-blue-400 font-mono">{editorConfig.nameFontSize}px</span>
              </div>
              <input
                type="range"
                min={18}
                max={46}
                value={editorConfig.nameFontSize}
                onChange={(e) =>
                  setEditorConfig({ ...editorConfig, nameFontSize: parseInt(e.target.value) })
                }
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Control: Color de Fuente */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Color del Nombre:</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={editorConfig.fontColorHex}
                  onChange={(e) =>
                    setEditorConfig({ ...editorConfig, fontColorHex: e.target.value })
                  }
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={editorConfig.fontColorHex}
                  onChange={(e) =>
                    setEditorConfig({ ...editorConfig, fontColorHex: e.target.value })
                  }
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs w-28 uppercase focus:outline-none"
                />
                <div className="flex space-x-1.5">
                  {['#0F2C59', '#D4AF37', '#0F172A', '#1E3A8A'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditorConfig({ ...editorConfig, fontColorHex: c })}
                      className="w-6 h-6 rounded-full border border-slate-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Texto de Acreditación */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Texto de Acreditación Institucional:
              </label>
              <textarea
                rows={2}
                value={editorConfig.accreditationText}
                onChange={(e) =>
                  setEditorConfig({ ...editorConfig, accreditationText: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Por haber completado y aprobado satisfactoriamente..."
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>GUARDAR CALIBRACIÓN DE PLANTILLA</span>
            </button>

            <button
              onClick={handleTestPdf}
              disabled={testingPdf}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {testingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4 text-amber-400" />}
              <span>Descargar PDF de Muestra</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
