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
  const [viewMode, setViewMode] = useState('list');
  const [form, setForm] = useState({ report_type: 'Informe médico', content: '', status: 'draft' });
  const [newContent, setNewContent] = useState('');
  const isDoctorOrAdmin = Array.isArray(user?.roles) && (user.roles.includes('medico') || user.roles.includes('admin'));
  const [doctorExtras, setDoctorExtras] = useState({ specialties: '', mpps: '', college: '' });
  const [isEditing, setIsEditing] = useState(false);

  const load = async () => {
    try {
      const res = await medicalRecordsApi.listReports(recordId, token);
      setItems(res.data || []);
    } catch (e) {
      setItems([]);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [recordId]);

  // Helper for safe date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    // Ensure ISO format for better browser compatibility
    const safeDate = dateString.replace(' ', 'T');
    const d = new Date(safeDate);
    if (isNaN(d.getTime())) return 'Fecha inválida';
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getMonth = (dateString) => {
    if (!dateString) return '-';
    const safeDate = dateString.replace(' ', 'T');
    const d = new Date(safeDate);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
  };

  const getDay = (dateString) => {
    if (!dateString) return '-';
    const safeDate = dateString.replace(' ', 'T');
    const d = new Date(safeDate);
    if (isNaN(d.getTime())) return '-';
    return d.getDate();
  };

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
      setIsEditing(false);
    } catch (e) { toast.error('No se pudo abrir el informe'); }
  };

  const canEditReport = (r) => {
    const uid = user?.id;
    const owner = r?.doctor_id ?? r?.created_by ?? r?.user_id ?? r?.author_id;
    return !!uid && !!owner && String(uid) === String(owner);
  };

  const createWithStatus = async (status) => {
    try {
      const statusToSend = status || 'draft';
      const res = await medicalRecordsApi.createReportForRecord(recordId, { report_type: form.report_type, content: newContent, status: statusToSend }, token);
      toast.success(statusToSend === 'final' ? 'Informe guardado como final' : 'Informe guardado como borrador');
      
      // Reset form
      setForm({ report_type: form.report_type, content: '', status: 'draft' });
      setNewContent('');
      
      // Reload list and try to select the new report
      await load();
      
      // If we can identify the new report (e.g. it's the last one or returned by API), select it
      // Assuming API returns the created object or we pick the latest
      const created = res.data?.report || res.data;
      if (created && created.id) {
          setSelected(created);
          setViewMode('view');
          setIsEditing(false);
          
          // Workaround: If backend ignored 'final' status, force update
          if (statusToSend === 'final' && created.status !== 'final' && created.status !== 'finalized') {
              await medicalRecordsApi.updateReport(created.id, { ...created, status: 'final' }, token);
              setSelected({ ...created, status: 'final' });
              load(); // Reload again to reflect status in list
          }
      } else {
          setViewMode('list');
      }
    } catch (e) { toast.error('No se pudo crear'); }
  };

  const update = async (status = null) => {
    if (!selected?.id) return;
    try {
      const newStatus = status || selected.status || 'draft';
      const payload = { report_type: selected.report_type, content: selected.content, status: newStatus };
      await medicalRecordsApi.updateReport(selected.id, payload, token);
      toast.success(newStatus === 'final' ? 'Informe finalizado' : 'Informe actualizado');
      
      setSelected({ ...selected, status: newStatus });
      setIsEditing(false);
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
    // Use data from reportForHeader (if provided) or selected report
    const r = reportForHeader || selected || {};
    
    const doctorName = r.doctor_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    
    // Try to get extras from report object first (fetched from DB), otherwise fall back to current user extras if it's the same user
    let specialties = r.specialty_name;
    let mpps = r.mpps_code;
    let collegeCode = r.college_code;
    let collegeName = r.college_name;
    let collegeSiglas = r.college_siglas;

    // Fallback to doctorExtras if report data is missing (e.g. new report not yet saved/reloaded) AND it is the current user
    const isCurrentUser = String(r.doctor_id || user?.id) === String(user?.id);
    if (isCurrentUser) {
        if (!specialties) specialties = doctorExtras.specialties;
        if (!mpps) mpps = doctorExtras.mpps;
        // doctorExtras.college is a combined string, so we might need to parse or just use it if individual fields are missing
        // But let's try to use what we have.
    }

    const collegeString = (collegeName || collegeSiglas) 
        ? `${collegeName || ''} ${collegeSiglas ? `(${collegeSiglas})` : ''}`.trim() 
        : (isCurrentUser ? doctorExtras.college : '');

    const reportDate = formatDate(r.report_date || new Date().toISOString());

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${r.report_type || 'Informe Médico'}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12pt; color: #333; line-height: 1.6; margin: 0; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #059669; padding-bottom: 15px; }
        .header h1 { margin: 0; color: #059669; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; }
        .header h2 { margin: 5px 0 0; font-size: 14px; color: #666; font-weight: normal; }
        
        .info-section { margin-bottom: 30px; display: flex; justify-content: space-between; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .info-block h3 { margin: 0 0 5px; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
        .info-block p { margin: 0; font-weight: 600; color: #1e293b; font-size: 14px; }
        .info-block .sub-text { font-size: 12px; color: #64748b; font-weight: normal; margin-top: 2px; }

        .report-title { text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; text-transform: uppercase; color: #1e293b; text-decoration: underline; text-underline-offset: 4px; }
        
        .content { text-align: justify; min-height: 300px; }
        
        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        .footer p { margin: 2px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Centro de Especialidades Médicas Shaddai Rafa</h1>
        <h2>Rif: J-50466144-0</h2>
    </div>

    <div class="info-section">
        <div class="info-block" style="text-align: left;">
            <h3>Paciente</h3>
            <p>${p.patient_name || ''}</p>
            <div class="sub-text">C.I: ${p.patient_cedula || ''}</div>
        </div>
        <div class="info-block" style="text-align: right;">
            <h3>Médico Tratante</h3>
            <p>${doctorName}</p>
            <div class="sub-text">${specialties || ''}</div>
            <div class="sub-text">
                ${mpps ? `MPPS: ${mpps}` : ''} 
                ${collegeCode ? ` · CM: ${collegeCode}` : ''}
            </div>
            <div class="sub-text">${collegeString}</div>
        </div>
    </div>

    <div class="report-title">${r.report_type || 'Informe Médico'}</div>

    <div class="content">
        ${contentHtml || ''}
    </div>

    <div class="footer">
        <p>Generado el ${reportDate}</p>
        <p>Centro de Especialidades Médicas Shaddai Rafa - La salud es nuestra prioridad</p>
    </div>
</body>
</html>`;
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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" /> Informes Recientes
            </h3>
        </div>
        <div className="divide-y divide-slate-50">
          {items?.length ? items.slice(0, 5).map(r => (
            <button key={r.id} className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-all group" onClick={() => {
              if (r.status !== 'draft') viewReportAsPDF(r.id);
              else toast.info('Este informe es un borrador. Edítalo desde la pestaña Informes.');
            }}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${(r.status === 'final' || r.status === 'finalized') ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {(r.status === 'final' || r.status === 'finalized') ? <FileCheck className="w-4 h-4" /> : <FileEdit className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-slate-700 text-sm truncate group-hover:text-indigo-600 transition-colors">{r.report_type || 'Informe'}</span>
                        {r.status !== 'final' && r.status !== 'finalized' && (
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700">
                                Borrador
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{formatDate(r.created_at)}</span>
                        <span>·</span>
                        <span className="truncate">Dr. {r.doctor_name}</span>
                    </div>
                </div>
              </div>
            </button>
          )) : (
            <div className="p-6 text-center">
                <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-500">No hay informes registrados</p>
            </div>
          )}
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
        {isDoctorOrAdmin && (
            <button 
                onClick={() => {
                    setViewMode('create');
                    setSelected(null);
                    setForm({ report_type: 'Informe médico', content: '', status: 'draft' });
                    setNewContent('');
                }}
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
                            className={`w-full text-left p-4 hover:bg-slate-50 transition-all flex items-start gap-3 group ${selected?.id === r.id ? 'bg-indigo-50/50 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
                        >
                            <div className="flex-shrink-0">
                                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border shadow-sm transition-all ${selected?.id === r.id ? 'bg-white border-indigo-200 shadow-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${selected?.id === r.id ? 'text-indigo-500' : 'text-slate-400'}`}>
                                        {getMonth(r.created_at)}
                                    </span>
                                    <span className={`text-lg font-bold leading-none mt-0.5 ${selected?.id === r.id ? 'text-indigo-700' : 'text-slate-600'}`}>
                                        {getDay(r.created_at)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h5 className={`font-bold text-sm truncate transition-colors ${selected?.id === r.id ? 'text-indigo-700' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                                    {r.report_type}
                                </h5>
                                <div className="flex flex-col gap-0.5 mt-1">
                                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                        Dr. {r.doctor_name}
                                    </span>
                                    {r.specialty_name && (
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wide pl-2.5">
                                            {r.specialty_name}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    {r.status !== 'final' && r.status !== 'finalized' && (
                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-100">
                                            Borrador
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 mt-2 transition-colors ${selected?.id === r.id ? 'text-indigo-400' : 'text-slate-300 group-hover:text-indigo-300'}`} />
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
                                <p className="text-xs text-slate-500">Por: {selected.doctor_name || 'Desconocido'} · {formatDate(selected.created_at)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!isEditing && (
                                <>
                                    <button 
                                        onClick={exportSelectedToPDF} 
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors border border-rose-100 shadow-sm" 
                                        title="Descargar como PDF"
                                    >
                                        <FileText className="w-3.5 h-3.5" /> PDF
                                    </button>
                                    <button 
                                        onClick={exportSelectedToWord} 
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm" 
                                        title="Descargar como Word"
                                    >
                                        <FileEdit className="w-3.5 h-3.5" /> Word
                                    </button>
                                </>
                            )}
                            
                            {canEditReport(selected) && (
                                <>
                                    <div className="w-px h-5 bg-slate-200 mx-1"></div>
                                    {!isEditing ? (
                                        <>
                                            <button 
                                                onClick={() => setIsEditing(true)} 
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" /> Editar
                                            </button>
                                            <button onClick={() => remove(selected.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Informe">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            onClick={() => { setIsEditing(false); load(); }} // Cancel edit
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" /> Cancelar
                                        </button>
                                    )}
                                </>
                            )}
                            
                            <div className="w-px h-5 bg-slate-200 mx-1"></div>
                            <button 
                                onClick={() => { setSelected(null); setViewMode('list'); }}
                                className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors"
                                title="Cerrar vista"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-8 bg-white min-h-[500px]">
                        {isEditing ? (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800 flex items-center gap-2 mb-2">
                                    <FileEdit className="w-4 h-4" />
                                    Estás editando este informe. Recuerda guardar los cambios.
                                </div>
                                <RichTextEditor 
                                    value={selected.content} 
                                    onChange={(val) => setSelected({...selected, content: val})} 
                                />
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button onClick={() => update('draft')} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
                                        Guardar como Borrador
                                    </button>
                                    <button onClick={() => update('final')} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-lg shadow-emerald-200 hover:bg-emerald-700">
                                        <Save className="w-4 h-4 inline mr-2" />
                                        Guardar y Finalizar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="prose prose-slate max-w-none animate-in fade-in" dangerouslySetInnerHTML={{ __html: selected.content }} />
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

