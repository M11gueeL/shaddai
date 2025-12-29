import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import medicalRecordsApi from '../../api/medicalRecords';
import userApi from '../../api/userApi';
import PatientsApi from '../../api/PatientsApi';
import MedicalRecordWelcome from './MedicalRecordWelcome';
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

        const handleSearchByPatientId = async (patientId) => {
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
                    toast.success('Historia cargada');
                } catch (err) {
                    if (err?.response?.status === 404 && patient) {
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
                const msg = e?.response?.data?.error || 'No se encontró historia para el paciente';
            toast.warning(msg);
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
        toast.success('Encuentro creado');
        setShowNewEncounter(false);
        reloadEncounters();
        setSelectedEncounterId(encounter?.id);
    };

    const tabs = useMemo(() => ([
        { key: 'summary', label: 'Resumen' },
        { key: 'encounters', label: 'Consultas' },
        { key: 'history', label: 'Antecedentes' },
        { key: 'vitals', label: 'Signos' },
        { key: 'reports', label: 'Informes' },
        { key: 'attachments', label: 'Adjuntos' },
    ]), []);
    const [activeTab, setActiveTab] = useState('summary');

    return (
        <div className="p-4 sm:p-6 space-y-4 overflow-x-hidden">
            <ElegantHeader 
                icon={Stethoscope}
                sectionName="Historias Clínicas"
                title="Gestión de"
                highlightText="Pacientes"
                description="Consulta, edita y gestiona las historias clínicas de tus pacientes de manera eficiente y segura."
            />

            <SearchPatientBar onSearchByCedula={handleSearchByCedula} onSearchByPatientId={handleSearchByPatientId} loading={loading} />

                    {record ? (
                <div className="space-y-4">
                    <RecordHeader
                        record={record}
                        onNewEncounter={() => setShowNewEncounter(true)}
                        onNewReport={() => setActiveTab('reports')}
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

                    <div className="border-b border-gray-200" />

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 overflow-x-auto md:overflow-visible pb-1">
                        {tabs.map(t => (
                            <button
                                key={t.key}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === t.key ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                onClick={() => setActiveTab(t.key)}
                                title={`Ir a ${t.label}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'summary' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <EncountersList
                                recordId={record.id}
                                encounters={record.recent_encounters || []}
                                onOpenEncounter={(id) => setSelectedEncounterId(id)}
                            />
                            <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-xl p-4 shadow-sm">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="text-sm text-slate-500">Informes y constancias recientes</div>
                                    <button className="text-xs text-blue-600 hover:underline" onClick={() => setActiveTab('reports')}>Ir a informes</button>
                                </div>
                                <ReportsSection recordId={record.id} record={record} token={token} user={user} condensed />
                            </div>
                        </div>
                    )}

                    {activeTab === 'encounters' && (
                        <EncountersList
                            recordId={record.id}
                            encounters={record.recent_encounters || []}
                            onOpenEncounter={(id) => setSelectedEncounterId(id)}
                            allowCreate
                            onCreate={() => setShowNewEncounter(true)}
                        />
                    )}

                    {activeTab === 'history' && (
                        <HistorySection recordId={record.id} token={token} />
                    )}

                    {activeTab === 'vitals' && (
                        <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-xl p-4 shadow-sm">
                            <div className="text-sm text-slate-500 mb-2">Registrar y revisar signos vitales</div>
                            <VitalsSection recordId={record.id} token={token} />
                        </div>
                    )}

                                {activeTab === 'reports' && (
                                    <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-xl p-4 shadow-sm">
                                        <div className="text-sm text-slate-500 mb-2">Informes y constancias</div>
                                        <ReportsSection recordId={record.id} record={record} token={token} user={user} />
                                    </div>
                                )}

                    {activeTab === 'attachments' && (
                        <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-xl p-4 shadow-sm">
                            <div className="text-sm text-slate-500 mb-2">Documentos y archivos adjuntos</div>
                            <AttachmentsSection recordId={record.id} token={token} />
                        </div>
                    )}
                </div>
                    ) : pendingPatient ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <div className="text-gray-900 font-semibold">No hay historia clínica para este paciente</div>
                            <div className="text-sm text-gray-600 mt-1">Paciente: {pendingPatient.full_name} · C.I: {pendingPatient.cedula}</div>
                            <div className="mt-4 flex gap-3">
                                <button disabled={loading} onClick={handleCreateRecord} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">Crear historia clínica</button>
                                <button disabled={loading} onClick={() => setPendingPatient(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[calc(100vh-200px)]">
                            <MedicalRecordWelcome />
                        </div>
                    )
            }

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
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-2 sm:p-4">
                    <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl overflow-hidden max-h-[90vh] h-[90vh]">
                        <PatientDetail
                            patient={patientForEdit}
                            onClose={() => { setShowEditPatient(false); setPatientForEdit(null); }}
                            onPatientUpdated={async () => {
                                // Refresca datos del record y fuerza refetch del header
                                try {
                                    if (record?.id) {
                                        const r = await medicalRecordsApi.getById(record.id, token);
                                        // Preserva encuentros recientes para no vaciar la UI
                                        setRecord((prev) => ({ ...r.data, recent_encounters: prev?.recent_encounters || [] }));
                                        // Recarga lista de encuentros para sincronizar
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
    );
}
