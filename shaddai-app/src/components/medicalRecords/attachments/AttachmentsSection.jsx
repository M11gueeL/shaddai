import React, { useEffect, useState } from 'react';
import medicalRecordsApi from '../../../api/medicalRecords';
import { useToast } from '../../../context/ToastContext';

export default function AttachmentsSection({ recordId, token }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');

  const load = async () => {
    try {
      const res = await medicalRecordsApi.listAttachments(recordId, token);
      setItems(res.data || []);
    } catch (e) { setItems([]); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [recordId]);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    try {
      await medicalRecordsApi.registerAttachmentForRecord(recordId, file, description, token);
      toast.success('Adjunto registrado');
      setFile(null); setDescription('');
      load();
    } catch (e) { toast.error('No se pudo subir'); }
  };

  const remove = async (id) => {
    try {
      await medicalRecordsApi.deleteAttachment(id, token);
      toast.success('Adjunto eliminado');
      load();
    } catch (e) { toast.error('No se pudo eliminar'); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <div className="text-gray-800 font-medium">Subir adjunto</div>
        <form onSubmit={upload} className="mt-3 space-y-3">
          <div>
            <label className="text-sm text-gray-600">Descripción</label>
            <input className="w-full mt-1 px-3 py-2 border rounded-lg" value={description} onChange={(e)=>setDescription(e.target.value)} />
          </div>
          <div>
            <input type="file" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Registrar</button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-4 text-gray-800 font-medium">Adjuntos</div>
        <div className="divide-y">
          {items?.length ? items.map(a => (
            <div key={a.id} className="px-4 py-3 text-sm text-gray-700 flex items-center justify-between">
              <div>
                <div className="font-medium">{a.file_name}</div>
                <div className="text-xs text-gray-500">{a.uploader_name} · {new Date(a.uploaded_at).toLocaleString()}</div>
                {a.description && <div className="text-xs text-gray-600 mt-1">{a.description}</div>}
              </div>
              <div className="flex items-center gap-3">
                {/* Placeholder for download if implemented */}
                <button className="text-xs text-red-600 hover:underline" onClick={() => remove(a.id)}>Eliminar</button>
              </div>
            </div>
          )) : <div className="px-4 py-6 text-sm text-gray-500">Sin adjuntos</div>}
        </div>
      </div>
    </div>
  );
}
