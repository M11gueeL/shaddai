import React, { useEffect, useRef, useState } from 'react';
import medicalRecordsApi from '../../../api/medicalRecords';
import { useToast } from '../../../context/ToastContext';
import RichTextEditor from '../../common/RichTextEditor';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

export default function ReportsSection({ recordId, record, token, user }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null); // report object
  const [form, setForm] = useState({ report_type: 'Informe médico', recipient: '', content: '', status: 'draft' });
  const [newContent, setNewContent] = useState('');
  const isDoctorOrAdmin = Array.isArray(user?.roles) && (user.roles.includes('medico') || user.roles.includes('admin'));

  const load = async () => {
    try {
      const res = await medicalRecordsApi.listReports(recordId, token);
      setItems(res.data || []);
    } catch (e) {
      setItems([]);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [recordId]);

  const openReport = async (id) => {
    try {
      const res = await medicalRecordsApi.getReport(id, token);
      setSelected(res.data);
    } catch (e) { toast.error('No se pudo abrir el informe'); }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await medicalRecordsApi.createReportForRecord(recordId, { ...form, content: newContent }, token);
      toast.success('Informe creado');
      setForm({ report_type: form.report_type, recipient: '', content: '', status: 'draft' });
      setNewContent('');
      load();
    } catch (e) { toast.error('No se pudo crear'); }
  };

  const update = async () => {
    if (!selected?.id) return;
    try {
      await medicalRecordsApi.updateReport(selected.id, { report_type: selected.report_type, recipient: selected.recipient, content: selected.content, status: selected.status }, token);
      toast.success('Informe actualizado');
      load();
    } catch (e) { toast.error('No se pudo actualizar'); }
  };

  const remove = async (id) => {
    try {
      await medicalRecordsApi.deleteReport(id, token);
      toast.success('Informe eliminado');
      if (selected?.id === id) setSelected(null);
      load();
    } catch (e) { toast.error('No se pudo eliminar'); }
  };

  // Using a custom Quill wrapper (RichTextEditor)

  // no ref needed; we render to a temporary container for exports

  const buildExportHtml = (contentHtml) => {
    const p = record || {};
    const doctorName = selected?.doctor_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-4 text-gray-800 font-medium">Informes</div>
        <div className="divide-y">
          {items?.length ? items.map(r => (
            <div key={r.id} className="px-4 py-3 text-sm text-gray-700 flex items-center justify-between">
              <div>
                <div className="font-medium">{r.report_type || 'Informe'}</div>
                <div className="text-xs text-gray-500">{r.doctor_name} · {r.report_date} · {r.status}</div>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-xs text-blue-600 hover:underline" onClick={() => openReport(r.id)}>Abrir</button>
                <button className="text-xs text-red-600 hover:underline" onClick={() => remove(r.id)}>Eliminar</button>
              </div>
            </div>
          )) : <div className="px-4 py-6 text-sm text-gray-500">Sin informes</div>}
        </div>
      </div>

      <div className="space-y-4">
        {isDoctorOrAdmin && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <div className="text-gray-800 font-medium">Nuevo informe</div>
            <form onSubmit={submit} className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">Tipo</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.report_type} onChange={(e)=>setForm({...form, report_type:e.target.value})}>
                  <option>Informe médico</option>
                  <option>Reposo médico</option>
                  <option>Referencia</option>
                  <option>Interconsulta</option>
                  <option>Constancia</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Destinatario</label>
                <input className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.recipient} onChange={(e)=>setForm({...form, recipient:e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Contenido</label>
                <RichTextEditor value={newContent} onChange={setNewContent} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Crear</button>
              </div>
            </form>
          </div>
        )}

        {selected && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <div className="text-gray-800 font-medium">Editar informe</div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">Tipo</label>
                <input className="w-full mt-1 px-3 py-2 border rounded-lg" value={selected.report_type || ''} onChange={(e)=>setSelected({...selected, report_type:e.target.value})} />
              </div>
              <div>
                <label className="text-sm text-gray-600">Destinatario</label>
                <input className="w-full mt-1 px-3 py-2 border rounded-lg" value={selected.recipient || ''} onChange={(e)=>setSelected({...selected, recipient:e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Contenido</label>
                <RichTextEditor value={selected.content || ''} onChange={(v)=>setSelected({...selected, content:v})} />
              </div>
              <div>
                <label className="text-sm text-gray-600">Estado</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg" value={selected.status || 'draft'} onChange={(e)=>setSelected({...selected, status:e.target.value})}>
                  <option value="draft">Borrador</option>
                  <option value="final">Final</option>
                  <option value="signed">Firmado</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button onClick={() => { setSelected(s => ({...s, status: 'draft'})); update(); }} className="px-4 py-2 border rounded-lg">Guardar borrador</button>
                <button onClick={() => { setSelected(s => ({...s, status: 'final'})); update(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar final</button>
                <button onClick={exportSelectedToPDF} className="px-4 py-2 bg-gray-800 text-white rounded-lg">Exportar PDF</button>
                <button onClick={exportSelectedToWord} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Exportar Word</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
