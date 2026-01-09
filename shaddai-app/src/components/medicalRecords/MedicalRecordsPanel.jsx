import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Stethoscope, FileText, Activity, ClipboardList, Paperclip, AlertCircle, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import medicalRecordsApi from '../../api/medicalRecords';
import userApi from '../../api/userApi';
import PatientsApi from '../../api/PatientsApi';
import MedicalRecordWelcome from './MedicalRecordWelcome';
import DailyAppointmentsDashboard from './DailyAppointmentsDashboard';
import SearchPatientBar from './SearchPatientBar';
import RecordHeader from './RecordHeader';
import EncountersList from './encounters/EncountersList';
import EncounterEditor from './encounters/EncounterEditor';
import EncounterDetailModal from './encounters/EncounterDetailModal';
import HistorySection from './history/HistorySection';
import VitalsSection from './vitals/VitalsSection';
import ReportsSection from './reports/ReportsSection';
import AttachmentsSection from './attachments/AttachmentsSection';
import PatientDetail from '../reception/patients/PatientDetail';
import ElegantHeader from '../common/ElegantHeader';

const cardBase = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6";

export default function MedicalRecordsPanel() {
    const { token, user } = useAuth();
    const toast = useToast();

    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
        const [pendingPatient, setPendingPatient] = useState(null); // when no record exists

    const [showNewEncounter, setShowNewEncounter] = useState(false);
    const [selectedEncounterId, setSelectedEncounterId] = useState(null);
    const [showEditPatient, setShowEditPatient] = useState(false);
    const [patientForEdit, setPatientForEdit] = useState(null);
    const [patientRefreshKey, setPatientRefreshKey] = useState(0);
    const [exporting, setExporting] = useState(false);

    const handleExportFullHistory = async () => {
        if (!record) return;
        setExporting(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/shaddai/shaddai-api/public';
            const url = `${API_URL}/medicalrecords/${record.id}/reports/full`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Verificar que sea un PDF real
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.indexOf('application/pdf') === -1) {
                console.error('Respuesta no es PDF:', await response.text());
                throw new Error('El servidor no devolvió un PDF válido.');
            }

            if (!response.ok) throw new Error('Error al generar reporte');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `Historia_Clinica_${record.patient_cedula || 'Paciente'}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            toast.success('Historia clínica exportada correctamente');
        } catch (error) {
            console.error(error);
            toast.error('Error al exportar la historia clínica');
        } finally {
            setExporting(false);
        }
    };

    // Load doctors and specialties once
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [docsRes, specsRes] = await Promise.all([
                    userApi.getDoctors(token),
                    userApi.getSpecialties(token),
                ]);
                if (cancelled) return;
                setDoctors(docsRes.data || []);
                setSpecialties(specsRes.data || []);
            } catch (e) {
                // Non-fatal; doctors may only be needed for admins
            }
        })();
        return () => { cancelled = true; };
    }, [token]);

        const handleSearchByCedula = async (cedula) => {
        if (!cedula) return;
        setLoading(true);
        try {
                // 1) Resolve patient first
                const pRes = await PatientsApi.getByCedula(cedula, token);
                const patient = pRes.data;
                // 2) Try load record by patient ID
                try {
                    const rRes = await medicalRecordsApi.getByPatientId(patient.id, token);
                    setRecord(rRes.data);
                    setPendingPatient(null);
                    toast.success('Historia cargada');
                } catch (err) {
                    // If not found, set pending patient to allow creation
                    if (err?.response?.status === 404) {
                        setRecord(null);
                        setPendingPatient({ id: patient.id, full_name: patient.full_name, cedula: patient.cedula });
                        toast.info('Este paciente no tiene historia clínica. Puedes crearla.');
                    } else {
                        throw err;
                    }
                }
        } catch (e) {
                setRecord(null);
                setPendingPatient(null);
                const msg = e?.response?.data?.error || 'Paciente no encontrado';
                toast.warning(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchByPatientId = async (patientId, silent = false) => {
        if (!patientId) return;
        setLoading(true);
        try {
                // Fetch patient to display if needed
                let patient = null;
                try { const pRes = await PatientsApi.getById(patientId, token); patient = pRes.data; } catch {}
                try {
                    const res = await medicalRecordsApi.getByPatientId(patientId, token);
                    setRecord(res.data);
                    setPendingPatient(null);
                    if (!silent) toast.success('Historia cargada');
                } catch (err) {
                    if (err?.response?.status === 404 && patient) {
                        setRecord(null);
                        setPendingPatient({ id: patient.id, full_name: patient.full_name, cedula: patient.cedula });
                        if (!silent) toast.info('Este paciente no tiene historia clínica. Puedes crearla.');
                    } else {
                        throw err;
                    }
                }
        } catch (e) {
            setRecord(null);
                setPendingPatient(null);
                const msg = e?.response?.data?.error || 'No se encontró historia para el paciente';
            if (!silent) toast.warning(msg);
        } finally {
            setLoading(false);
        }
    };

        const handleCreateRecord = async () => {
            if (!pendingPatient?.id) return;
            setLoading(true);
            try {
                const res = await medicalRecordsApi.createRecordForPatient(pendingPatient.id, token);
                const rec = res.data?.record || null;
                if (rec) {
                    setRecord(rec);
                    setPendingPatient(null);
                    toast.success('Historia clínica creada');
                } else {
                    toast.error('No se pudo crear la historia clínica');
                }
            } catch (e) {
                const msg = e?.response?.data?.error || 'No se pudo crear la historia clínica';
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        };

    const reloadEncounters = async () => {
        if (!record?.id) return;
        try {
            const res = await medicalRecordsApi.getEncountersForRecord(record.id, token);
            setRecord((prev) => ({ ...prev, recent_encounters: res.data }));
        } catch {}
    };

    const onEncounterCreated = (encounter) => {
        setShowNewEncounter(false);
        reloadEncounters();
        setSelectedEncounterId(encounter?.id);
    };

    // Persistence Logic
    useEffect(() => {
        if (token && user?.id) {
            const key = `shaddai_active_patient_id_${user.id}`;
            const savedPatientId = localStorage.getItem(key);
            if (savedPatientId && !record && !pendingPatient) {
                handleSearchByPatientId(savedPatientId, true);
            }
        }
    }, [token, user?.id]);

    useEffect(() => {
        if (record?.patient_id && user?.id) {
            const key = `shaddai_active_patient_id_${user.id}`;
            localStorage.setItem(key, record.patient_id);
        }
    }, [record, user?.id]);

    const handleCloseRecord = () => {
        setRecord(null);
        setPendingPatient(null);
        if (user?.id) {
            const key = `shaddai_active_patient_id_${user.id}`;
            localStorage.removeItem(key);
        }
        setActiveTab('summary');
    };

    const tabs = useMemo(() => ([
        { key: 'summary', label: 'Resumen', icon: Activity },
        { key: 'encounters', label: 'Consultas', icon: Stethoscope },
        { key: 'history', label: 'Antecedentes', icon: ClipboardList },
        { key: 'vitals', label: 'Signos Vitales', icon: Activity },
        { key: 'reports', label: 'Informes', icon: FileText },
        { key: 'attachments', label: 'Adjuntos', icon: Paperclip },
    ]), []);
    const [activeTab, setActiveTab] = useState('summary');

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-8 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="space-y-6">
                    <ElegantHeader 
                        icon={Stethoscope}
                        sectionName="Historias Clínicas"
                        title="Gestión de"
                        highlightText="Pacientes"
                        description="Consulta, edita y gestiona las historias clínicas de tus pacientes de manera eficiente y segura."
                    />

                    <div className="relative z-20">
                        <SearchPatientBar onSearchByCedula={handleSearchByCedula} onSearchByPatientId={handleSearchByPatientId} loading={loading} />
                    </div>
                </div>

                {record ? (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <RecordHeader
                            record={record}
                            onNewEncounter={() => setShowNewEncounter(true)}
                            onNewReport={() => setActiveTab('reports')}
                            onClose={handleCloseRecord}
                            onEditPatient={async (patientId) => {
                                if (!patientId) return;
                                try {
                                    const res = await PatientsApi.getById(patientId, token);
                                    setPatientForEdit(res.data);
                                    setShowEditPatient(true);
                                } catch {}
                            }}
                            refreshKey={patientRefreshKey}
                        />

                        {/* Navigation Tabs */}
                        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 inline-flex flex-wrap gap-1 w-full md:w-auto">
                            {tabs.map(t => {
                                const Icon = t.icon;
                                const isActive = activeTab === t.key;
                                return (
                                    <button
                                        key={t.key}
                                        onClick={() => setActiveTab(t.key)}
                                        className={`
                                            flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden
                                            ${isActive 
                                                ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100' 
                                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                        {t.label}
                                        {isActive && (
                                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 bg-indigo-500 rounded-t-full opacity-50"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Content Area */}
                        <div className="min-h-[400px]">
                            {activeTab === 'summary' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                                    <div className="lg:col-span-2 space-y-6">
                                        <EncountersList
                                            recordId={record.id}
                                            encounters={record.recent_encounters || []}
                                            onOpenEncounter={(id) => setSelectedEncounterId(id)}
                                        />
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-blue-500" />
                                                    Informes Recientes
                                                </h3>
                                                <button onClick={() => setActiveTab('reports')} className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                                    Ver todos
                                                </button>
                                            </div>
                                            <ReportsSection recordId={record.id} record={record} token={token} user={user} condensed />
                                            
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <button 
                                                    onClick={handleExportFullHistory}
                                                    disabled={exporting}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-xl transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {exporting ? (
                                                        <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Download className="w-4 h-4" />
                                                    )}
                                                    {exporting ? 'Exportando...' : 'Exportar Historia'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'encounters' && (
                                <div className="animate-in fade-in duration-300">
                                    <EncountersList
                                        recordId={record.id}
                                        encounters={record.recent_encounters || []}
                                        onOpenEncounter={(id) => setSelectedEncounterId(id)}
                                        allowCreate
                                        onCreate={() => setShowNewEncounter(true)}
                                    />
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="animate-in fade-in duration-300">
                                    <HistorySection recordId={record.id} token={token} />
                                </div>
                            )}

                            {activeTab === 'vitals' && (
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-in fade-in duration-300">
                                    <VitalsSection recordId={record.id} token={token} />
                                </div>
                            )}

                            {activeTab === 'reports' && (
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-in fade-in duration-300">
                                    <ReportsSection recordId={record.id} record={record} token={token} user={user} />
                                </div>
                            )}

                            {activeTab === 'attachments' && (
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-in fade-in duration-300">
                                    <AttachmentsSection recordId={record.id} token={token} />
                                </div>
                            )}
                        </div>
                    </div>
                ) : pendingPatient ? (
                    <div className="max-w-2xl mx-auto mt-12 animate-in fade-in zoom-in duration-300">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 text-center space-y-6">
                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle className="w-8 h-8 text-amber-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-slate-800">Historia Clínica No Encontrada</h3>
                                <p className="text-slate-500">
                                    El paciente <span className="font-medium text-slate-900">{pendingPatient.full_name}</span> (C.I: {pendingPatient.cedula}) no tiene una historia clínica activa.
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-3 pt-2">
                                <button 
                                    disabled={loading} 
                                    onClick={() => setPendingPatient(null)} 
                                    className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    disabled={loading} 
                                    onClick={handleCreateRecord} 
                                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all"
                                >
                                    Crear Historia Clínica
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-8">
                        <DailyAppointmentsDashboard onSelectPatient={handleSearchByPatientId} />
                    </div>
                )}

                {showNewEncounter && record && (
                    <EncounterEditor
                        record={record}
                        token={token}
                        user={user}
                        doctors={doctors}
                        specialties={specialties}
                        onClose={() => setShowNewEncounter(false)}
                        onCreated={onEncounterCreated}
                    />
                )}

                {selectedEncounterId && (
                    <EncounterDetailModal
                        encounterId={selectedEncounterId}
                        token={token}
                        onClose={() => setSelectedEncounterId(null)}
                        onChanged={reloadEncounters}
                    />
                )}

                {showEditPatient && patientForEdit && (
                    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] h-[90vh] animate-in zoom-in-95 duration-200">
                            <PatientDetail
                                patient={patientForEdit}
                                onClose={() => { setShowEditPatient(false); setPatientForEdit(null); }}
                                onPatientUpdated={async () => {
                                    try {
                                        if (record?.id) {
                                            const r = await medicalRecordsApi.getById(record.id, token);
                                            setRecord((prev) => ({ ...r.data, recent_encounters: prev?.recent_encounters || [] }));
                                            try { await reloadEncounters(); } catch {}
                                        }
                                    } catch {}
                                    setPatientRefreshKey(Date.now());
                                    setShowEditPatient(false);
                                    setPatientForEdit(null);
                                }}
                                initialEditing={true}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
