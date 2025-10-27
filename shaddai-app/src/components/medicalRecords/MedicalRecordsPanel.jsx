import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import medicalRecordsApi from '../../api/medicalRecords';
import userApi from '../../api/userApi';
import PatientsApi from '../../api/PatientsApi';

import SearchPatientBar from './SearchPatientBar';
import RecordHeader from './RecordHeader';
import EncountersList from './encounters/EncountersList';
import EncounterEditor from './encounters/EncounterEditor';
import EncounterDetailModal from './encounters/EncounterDetailModal';
import HistorySection from './history/HistorySection';
import VitalsSection from './vitals/VitalsSection';
import ReportsSection from './reports/ReportsSection';
import AttachmentsSection from './attachments/AttachmentsSection';

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
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Historias Clínicas</h1>
            </div>

            <SearchPatientBar onSearchByCedula={handleSearchByCedula} onSearchByPatientId={handleSearchByPatientId} loading={loading} />

                    {record ? (
                <div className="space-y-4">
                    <RecordHeader
                        record={record}
                        onNewEncounter={() => setShowNewEncounter(true)}
                        onNewReport={() => setActiveTab('reports')}
                    />

                    <div className="border-b border-gray-200" />

                    {/* Tabs */}
                    <div className="flex gap-2">
                        {tabs.map(t => (
                            <button key={t.key} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === t.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveTab(t.key)}>
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
                            <HistorySection recordId={record.id} token={token} />
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
                        <VitalsSection recordId={record.id} token={token} />
                    )}

                                {activeTab === 'reports' && (
                                    <ReportsSection recordId={record.id} record={record} token={token} user={user} />
                                )}

                    {activeTab === 'attachments' && (
                        <AttachmentsSection recordId={record.id} token={token} />
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
                        <div className="text-gray-500 text-sm">Busca un paciente por su número de cédula, nombre, teléfono o email para cargar su historia.</div>
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
        </div>
    );
}