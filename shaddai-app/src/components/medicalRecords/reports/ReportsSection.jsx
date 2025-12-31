import React, { useEffect, useRef, useState } from 'react';
import { FileText, Plus, Download, Trash2, Edit3, Save, X, Printer, FileCheck, FileEdit, ChevronRight } from 'lucide-react';
import medicalRecordsApi from '../../../api/medicalRecords';
import { useToast } from '../../../context/ToastContext';
import RichTextEditor from '../../common/RichTextEditor';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import userApi from '../../../api/userApi';
import { useConfirm } from '../../../context/ConfirmContext';

export default function ReportsSection({ recordId, record, token, user, condensed = false }) {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null); // report object
  const [form, setForm] = useState({ report_type: 'Informe médico', content: '', status: 'draft' });
  const [newContent, setNewContent] = useState('');
  const isDoctorOrAdmin = Array.isArray(user?.roles) && (user.roles.includes('medico') || user.roles.includes('admin'));
  const [doctorExtras, setDoctorExtras] = useState({ specialties: '', mpps: '', college: '' });
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'view'

  const load = async () => {
    try {
      const res = await medicalRecordsApi.listReports(recordId, token);
      setItems(res.data || []);
    } catch (e) {
      setItems([]);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [recordId]);

  // Load doctor's specialties and codes for headers
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (user?.id && user?.roles?.includes('medico')) {
          const [specsRes] = await Promise.all([
            userApi.getSpecialtiesByDoctorId(user.id, token)
          ]);
          const specs = (specsRes?.data || []).map(s => s.name || s.specialty_name || s).filter(Boolean);
          const specialties = specs.join(', ');
          const mpps = user?.mpps_code || user?.mpps || '';
          const collegeCode = user?.medical_college_code || user?.college_code || '';
          const collegeSig = user?.medical_college_siglas || user?.college_acronym || user?.college_siglas || '';
          const college = collegeCode ? `${collegeCode}${collegeSig ? ' · ' + collegeSig : ''}` : (collegeSig || '');
          if (!cancelled) setDoctorExtras({ specialties, mpps, college });
        }
      } catch (e) {
        // Silently ignore; extras are optional
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, token]);

  const openReport = async (id) => {
    try {
      const res = await medicalRecordsApi.getReport(id, token);
      setSelected(res.data);
      setViewMode('view');
    } catch (e) { toast.error('No se pudo abrir el informe'); }
  };

  const canEditReport = (r) => {
    const uid = user?.id;
    const owner = r?.doctor_id ?? r?.created_by ?? r?.user_id ?? r?.author_id;
    return !!uid && !!owner && String(uid) === String(owner);
  };

  const createWithStatus = async (status) => {
    try {
      await medicalRecordsApi.createReportForRecord(recordId, { report_type: form.report_type, content: newContent, status }, token);
      toast.success(status === 'final' ? 'Informe guardado como final' : 'Informe guardado como borrador');
      setForm({ report_type: form.report_type, content: '', status: 'draft' });
      setNewContent('');
      load();
      setViewMode('list');
    } catch (e) { toast.error('No se pudo crear'); }
  };

  const update = async (status = null) => {
    if (!selected?.id) return;
    try {
      const payload = { report_type: selected.report_type, content: selected.content, status: status || selected.status };
      await medicalRecordsApi.updateReport(selected.id, payload, token);
      toast.success(status === 'final' ? 'Informe guardado como final' : 'Informe actualizado');
      load();
    } catch (e) { toast.error('No se pudo actualizar'); }
  };

  const remove = async (id) => {
    const ok = await confirm({
      title: 'Eliminar informe',
      message: '¿Seguro que deseas eliminar este informe? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await medicalRecordsApi.deleteReport(id, token);
      toast.success('Informe eliminado');
      if (selected?.id === id) {
        setSelected(null);
        setViewMode('list');
      }
      load();
    } catch (e) { toast.error('No se pudo eliminar'); }
  };

  const buildExportHtml = (contentHtml, reportForHeader = null) => {
    const p = record || {};
    const doctorName = reportForHeader?.doctor_name || selected?.doctor_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    const useExtras = reportForHeader?.doctor_id && String(reportForHeader.doctor_id) === String(user?.id);
    const header = `
      <div style="font-family: Arial, sans-serif;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div>
            <div style="font-size:14px;color:#555;">Paciente</div>
            <div style="font-weight:bold;font-size:16px;">${p.patient_name || ''}</div>
            <div style="font-size:12px;color:#555;">C.I: ${p.patient_cedula || ''}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:14px;color:#555;">Médico tratante</div>
            <div style="font-weight:bold;font-size:16px;">${doctorName || ''}</div>
            ${useExtras && doctorExtras.specialties ? `<div style=\"font-size:12px;color:#555;\">${doctorExtras.specialties}</div>` : ''}
            ${useExtras && (doctorExtras.mpps || doctorExtras.college) ? `<div style=\"font-size:12px;color:#555;\">${doctorExtras.mpps ? `MPPS: ${doctorExtras.mpps}` : ''}${(doctorExtras.mpps && doctorExtras.college) ? ' · ' : ''}${doctorExtras.college ? `Colegio: ${doctorExtras.college}` : ''}</div>` : ''}
            <div style="font-size:12px;color:#555;">Fecha: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>
        <hr />
      </div>
    `;
    return `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body>${header}<div>${contentHtml || ''}</div></body></html>`;
  };

  const exportSelectedToPDF = async () => {
    if (!selected) return;
    const html = buildExportHtml(selected.content || '');
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '800px';
    container.innerHTML = html;
    document.body.appendChild(container);
    try {
      const canvas = await html2canvas(container, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let y = 20;
      if (imgHeight < pageHeight) {
        pdf.addImage(imgData, 'PNG', 20, y, imgWidth, imgHeight);
      } else {
        let heightLeft = imgHeight;
        let position = 20;
        pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          pdf.addPage();
          position = -imgHeight + (pageHeight * (Math.ceil((imgHeight - heightLeft) / pageHeight)));
          pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }
      pdf.save(`${selected.report_type || 'informe'}.pdf`);
    } catch (e) {
      toast.error('Error al exportar a PDF');
    } finally {
      container.remove();
    }
  };

  const exportSelectedToWord = () => {
    if (!selected) return;
    try {
      const content = buildExportHtml(selected.content || '');
      const wordHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:w="urn:schemas-microsoft-com:office:word"
              xmlns="http://www.w3.org/TR/REC-html40">
          <head><meta charset="utf-8" /></head>
          <body>${content}</body>
        </html>`;
      const blob = new Blob([wordHtml], { type: 'application/msword' });
      saveAs(blob, `${selected.report_type || 'informe'}.doc`);
    } catch (e) {
      console.error(e);
      toast.error('Error al exportar a Word');
    }
  };

  const exportHtmlToPDF = async (html) => {
    try {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-10000px';
      container.style.top = '0';
      container.style.width = '800px';
      container.innerHTML = html;
      document.body.appendChild(container);
      const canvas = await html2canvas(container, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let y = 20;
      if (imgHeight < pageHeight) {
        pdf.addImage(imgData, 'PNG', 20, y, imgWidth, imgHeight);
      } else {
        let heightLeft = imgHeight;
        let position = 20;
        pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          pdf.addPage();
          position = -imgHeight + (pageHeight * (Math.ceil((imgHeight - heightLeft) / pageHeight)));
          pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }
      pdf.save('informe.pdf');
      container.remove();
    } catch (e) {
      toast.error('Error al exportar a PDF');
    }
  };

  const viewReportAsPDF = async (id) => {
    try {
      const res = await medicalRecordsApi.getReport(id, token);
      const rpt = res.data;
      const html = buildExportHtml(rpt?.content || '', rpt);
      await exportHtmlToPDF(html);
    } catch (e) {
      toast.error('No se pudo generar el PDF');
    }
  };

  if (condensed) {
    return (
      <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-xl shadow-sm">
        <div className="p-4 text-slate-800 font-medium">Informes y constancias</div>
        <div className="divide-y">
          {items?.length ? items.map(r => (
            <button key={r.id} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50/80 transition" onClick={() => {
              if (r.status !== 'draft') viewReportAsPDF(r.id);
              else toast.info('Este informe es un borrador. Edítalo desde la pestaña Informes.');
            }}>
              <div className="font-medium truncate">{r.report_type || 'Informe'}</div>
              <div className="text-xs text-slate-500">{r.doctor_name} · {r.report_date} · {r.status}</div>
            </button>
          )) : <div className="px-4 py-6 text-sm text-slate-500">Sin informes</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-start gap-4">
        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <FileText className="w-6 h-6" />
        </div>
        <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800">Informes Médicos</h3>
            <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Genere, edite y exporte informes médicos, constancias y referencias.
            </p>
        </div>
        {viewMode === 'list' && isDoctorOrAdmin && (
            <button 
                onClick={() => setViewMode('create')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
                <Plus className="w-4 h-4" /> Nuevo Informe
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List Column */}
        <div className={`lg:col-span-1 ${viewMode !== 'list' ? 'hidden lg:block' : ''}`}>
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden sticky top-6">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Historial de Informes</h4>
                </div>
                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                    {items?.length ? items.map(r => (
                        <button 
                            key={r.id} 
                            onClick={() => openReport(r.id)}
                            className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start gap-3 ${selected?.id === r.id ? 'bg-indigo-50/50 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
                        >
                            <div className={`p-2 rounded-lg shrink-0 ${r.status === 'final' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {r.status === 'final' ? <FileCheck className="w-5 h-5" /> : <FileEdit className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-slate-800 text-sm truncate">{r.report_type}</h5>
                                <p className="text-xs text-slate-500 mt-0.5">{new Date(r.created_at).toLocaleDateString()}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${r.status === 'final' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {r.status === 'final' ? 'Finalizado' : 'Borrador'}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 mt-2" />
                        </button>
                    )) : (
                        <div className="p-8 text-center">
                            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                            <p className="text-sm text-slate-500">No hay informes registrados</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Editor/Viewer Column */}
        <div className="lg:col-span-2">
            {viewMode === 'create' && (
                <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <Plus className="w-4 h-4 text-indigo-600" /> Nuevo Informe
                        </h4>
                        <button onClick={() => setViewMode('list')} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Tipo de Informe</label>
                            <select 
                                className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                                value={form.report_type}
                                onChange={(e) => setForm({...form, report_type: e.target.value})}
                            >
                                <option>Informe médico</option>
                                <option>Constancia médica</option>
                                <option>Referencia</option>
                                <option>Epicrisis</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Contenido</label>
                            <div className="rounded-xl border border-slate-200 overflow-hidden ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                                <RichTextEditor value={newContent} onChange={setNewContent} placeholder="Escriba el contenido del informe aquí..." />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button 
                                onClick={() => createWithStatus('draft')}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm"
                            >
                                Guardar Borrador
                            </button>
                            <button 
                                onClick={() => createWithStatus('final')}
                                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 text-sm flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Finalizar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'view' && selected && (
                <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setViewMode('list')} className="lg:hidden p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors">
                                <ChevronRight className="w-4 h-4 rotate-180" />
                            </button>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{selected.report_type}</h4>
                                <p className="text-xs text-slate-500">Por: {selected.doctor_name || 'Desconocido'} · {new Date(selected.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={exportSelectedToPDF} className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Exportar PDF">
                                <FileText className="w-4 h-4" />
                            </button>
                            <button onClick={exportSelectedToWord} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Exportar Word">
                                <FileEdit className="w-4 h-4" />
                            </button>
                            {canEditReport(selected) && (
                                <button onClick={() => remove(selected.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="p-8 bg-white min-h-[500px]">
                        {canEditReport(selected) && selected.status !== 'final' ? (
                            <div className="space-y-4">
                                <RichTextEditor 
                                    value={selected.content} 
                                    onChange={(val) => setSelected({...selected, content: val})} 
                                />
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button onClick={() => update('draft')} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
                                        Guardar Cambios
                                    </button>
                                    <button onClick={() => update('final')} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-lg shadow-emerald-200 hover:bg-emerald-700">
                                        Finalizar Informe
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: selected.content }} />
                        )}
                    </div>
                </div>
            )}

            {viewMode === 'list' && !selected && (
                <div className="hidden lg:flex flex-col items-center justify-center h-full min-h-[400px] rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center p-8">
                    <FileText className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">Seleccione un informe</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-2">
                        Seleccione un informe de la lista para ver sus detalles o cree uno nuevo si tiene los permisos necesarios.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

