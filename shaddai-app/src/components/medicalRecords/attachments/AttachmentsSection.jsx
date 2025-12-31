import React, { useEffect, useState } from 'react';
import { Paperclip, UploadCloud, File, FileText, Image, Trash2, Download, Eye, X } from 'lucide-react';
import medicalRecordsApi from '../../../api/medicalRecords';
import { useToast } from '../../../context/ToastContext';

export default function AttachmentsSection({ recordId, token }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const load = async () => {
    try {
      const res = await medicalRecordsApi.listAttachments(recordId, token);
      setItems(res.data || []);
    } catch (e) { setItems([]); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [recordId]);

  const upload = async (e) => {
    e?.preventDefault();
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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <Image className="w-8 h-8 text-purple-500" />;
    if (['pdf'].includes(ext)) return <FileText className="w-8 h-8 text-rose-500" />;
    return <File className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-start gap-4">
        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Paperclip className="w-6 h-6" />
        </div>
        <div>
            <h3 className="text-lg font-bold text-slate-800">Archivos Adjuntos</h3>
            <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                Gestione documentos, imágenes y resultados de estudios externos relacionados con este expediente.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Column */}
        <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 sticky top-6">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-indigo-600" /> Subir Archivo
                </h4>
                <form onSubmit={upload} className="space-y-4">
                    <div 
                        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e)=>setFile(e.target.files?.[0] || null)} 
                        />
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                            {file ? (
                                <>
                                    <FileText className="w-8 h-8 text-indigo-600" />
                                    <p className="text-sm font-medium text-slate-700 truncate max-w-full px-2">{file.name}</p>
                                    <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="w-8 h-8 text-slate-300" />
                                    <p className="text-sm font-medium text-slate-600">Arrastre un archivo aquí</p>
                                    <p className="text-xs text-slate-400">o haga clic para seleccionar</p>
                                </>
                            )}
                        </div>
                    </div>

                    {file && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Descripción (Opcional)</label>
                            <input 
                                className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none placeholder:text-slate-400" 
                                placeholder="Ej.: Resultados de laboratorio" 
                                value={description} 
                                onChange={(e)=>setDescription(e.target.value)} 
                            />
                            <div className="flex gap-2 mt-4">
                                <button 
                                    type="button"
                                    onClick={() => { setFile(null); setDescription(''); }}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
                                >
                                    Subir
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-4">
            {items?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {items.map(a => (
                        <div key={a.id} className="group relative rounded-2xl bg-white p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl shrink-0">
                                {getFileIcon(a.file_name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-slate-800 text-sm truncate" title={a.file_name}>{a.file_name}</h5>
                                <p className="text-xs text-slate-500 mt-0.5">{new Date(a.uploaded_at).toLocaleDateString()}</p>
                                {a.description && <p className="text-xs text-slate-600 mt-2 line-clamp-2">{a.description}</p>}
                                <div className="flex items-center gap-2 mt-3">
                                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                        <Download className="w-3 h-3" /> Descargar
                                    </button>
                                </div>
                            </div>
                            <button 
                                onClick={() => remove(a.id)} 
                                className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center">
                    <Paperclip className="w-12 h-12 text-slate-300 mb-3" />
                    <h3 className="text-slate-900 font-medium">Sin archivos adjuntos</h3>
                    <p className="text-slate-500 text-sm mt-1">Suba documentos relevantes para el expediente.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
