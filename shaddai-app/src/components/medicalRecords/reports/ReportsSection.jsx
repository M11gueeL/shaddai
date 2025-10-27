import React, { useEffect, useRef, useState } from 'react';
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
      if (selected?.id === id) setSelected(null);
      load();
    } catch (e) { toast.error('No se pudo eliminar'); }
  };

  // Using a custom Quill wrapper (RichTextEditor)

  // no ref needed; we render to a temporary container for exports

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
    // Render export HTML into a hidden container for accurate layout
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
      const imgWidth = pageWidth - 40; // margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let y = 20;
      if (imgHeight < pageHeight) {
        pdf.addImage(imgData, 'PNG', 20, y, imgWidth, imgHeight);
      } else {
        // paginate
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
      // Export as legacy .doc (HTML-based) which Word opens natively
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

  // Generic exporters for arbitrary HTML (used in creation flow)
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

  const exportHtmlToWord = (html, name = 'informe') => {
    try {
      const wordHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:w="urn:schemas-microsoft-com:office:word"
              xmlns="http://www.w3.org/TR/REC-html40">
          <head><meta charset="utf-8" /></head>
          <body>${html}</body>
        </html>`;
      const blob = new Blob([wordHtml], { type: 'application/msword' });
      saveAs(blob, `${name}.doc`);
    } catch (e) {
      toast.error('Error al exportar a Word');
    }
  };

  // Create and immediately export
  const createAndExport = async (format) => {
    try {
      const res = await medicalRecordsApi.createReportForRecord(recordId, { report_type: form.report_type, content: newContent, status: 'final' }, token);
      // Determine created report for consistent export naming
      const created = res?.data?.report || res?.data || null;
      const html = buildExportHtml(newContent, created || undefined);
      if (format === 'pdf') await exportHtmlToPDF(html);
      else exportHtmlToWord(html, created?.report_type || form.report_type || 'informe');
      toast.success('Informe guardado como final y exportado');
      setForm({ report_type: form.report_type, content: '', status: 'draft' });
      setNewContent('');
      load();
    } catch (e) {
      toast.error('No se pudo crear y exportar');
    }
  };

  // From condensed view or list: fetch report and export directly
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

  const openReportForEdit = async (r) => {
    try {
      const res = await medicalRecordsApi.getReport(r.id, token);
      const full = res.data;
      if (canEditReport(full)) {
        setSelected(full);
        return;
      }
      if (full.status !== 'draft') {
        await viewReportAsPDF(full.id);
      } else {
        toast.warning('Solo el creador puede editar o eliminar este borrador');
      }
    } catch (e) {
      // Si falla el fetch, intenta último recurso con dato de lista
      if (canEditReport(r)) {
        openReport(r.id);
        return;
      }
      if (r.status !== 'draft') {
        await viewReportAsPDF(r.id);
      } else {
        toast.warning('No se pudo abrir el informe');
      }
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

  const formatStatus = (status) => {
    switch (status) {
      case 'draft': return 'borrador';
      case 'final': return 'final';
      case 'signed': return 'firmado';
      default: return status || '';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Historial */}
      <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm transition">
        <div className="p-4 text-slate-900 font-medium">Historial de informes</div>
        <div className="divide-y">
          {items?.length ? items.map(r => (
            <div key={r.id} className="px-4 py-3 text-sm text-slate-700 flex items-center justify-between hover:bg-slate-50/80 transition">
              <div className="min-w-0">
                <div className="font-medium truncate">{r.report_type || 'Informe'}</div>
                <div className="text-xs text-slate-500 truncate">{r.doctor_name} · {r.report_date} · {formatStatus(r.status)}</div>
              </div>
              <div className="flex items-center gap-3">
                {canEditReport(r) ? (
                  <>
                    <button className="text-xs text-blue-600 hover:underline" onClick={() => openReportForEdit(r)}>Editar</button>
                    <button className="text-xs text-red-600 hover:underline" onClick={() => remove(r.id)}>Eliminar</button>
                  </>
                ) : (
                  r.status !== 'draft' ? (
                    <button className="text-xs text-slate-600 hover:underline" onClick={() => viewReportAsPDF(r.id)}>Ver PDF</button>
                  ) : (
                    <span className="text-xs text-slate-400">Borrador</span>
                  )
                )}
              </div>
            </div>
          )) : <div className="px-4 py-6 text-sm text-gray-500">Sin informes</div>}
        </div>
      </div>

      {/* Editor / Creador */}
      <div className="lg:col-span-7 space-y-4">
        {isDoctorOrAdmin && !selected && (
          <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm p-4">
            <div className="text-slate-900 font-medium">Nuevo informe</div>
            <div className="mt-3 grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm text-slate-600">Tipo</label>
                <select className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 pr-8 appearance-none focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15" value={form.report_type} onChange={(e)=>setForm({...form, report_type:e.target.value})}>
                  <option>Informe médico</option>
                  <option>Reposo médico</option>
                  <option>Referencia</option>
                  <option>Interconsulta</option>
                  <option>Constancia</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600">Contenido</label>
                <RichTextEditor value={newContent} onChange={setNewContent} />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="text-xs text-slate-500 text-center">Elige cómo guardar o exporta directamente.</div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => createWithStatus('draft')} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50 transition">Guardar borrador</button>
                    <button onClick={() => createWithStatus('final')} className="rounded-lg bg-blue-600 px-3 py-2 text-white shadow hover:bg-blue-700 transition">Guardar final</button>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => createAndExport('pdf')} className="rounded-lg bg-gray-800 px-4 py-2 text-white shadow hover:bg-gray-900 transition">Guardar y exportar PDF</button>
                    <button onClick={() => createAndExport('word')} className="rounded-lg bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700 transition">Guardar y exportar Word</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selected && (
          <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="text-slate-900 font-medium">Editar informe</div>
              <button className="text-xs text-blue-600 hover:underline" onClick={() => setSelected(null)}>Crear uno nuevo</button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm text-slate-600">Tipo</label>
                <select className="w-full mt-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 pr-8 appearance-none focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/15" value={selected.report_type || ''} onChange={(e)=>setSelected({...selected, report_type:e.target.value})}>
                  <option>Informe médico</option>
                  <option>Reposo médico</option>
                  <option>Referencia</option>
                  <option>Interconsulta</option>
                  <option>Constancia</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600">Contenido</label>
                <RichTextEditor value={selected.content || ''} onChange={(v)=>setSelected({...selected, content:v})} />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2 justify-center">
                  <button onClick={() => update('draft')} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 transition">Guardar borrador</button>
                  <button onClick={() => update('final')} className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 transition">Guardar final</button>
                </div>
                <div className="flex gap-2 justify-center">
                  <button onClick={exportSelectedToPDF} className="rounded-lg bg-gray-800 px-4 py-2 text-white shadow hover:bg-gray-900 transition">Exportar PDF</button>
                  <button onClick={exportSelectedToWord} className="rounded-lg bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700 transition">Exportar Word</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
