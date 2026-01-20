import api from './axiosConfig';

const medicalRecordsApi = {
  // --- Medical Record (root) ---
  getByPatientId: (patientId) => api.get(`/medicalrecords/patient/${patientId}`),
  getByPatientCedula: (cedula) => api.get(`/medicalrecords/patient/cedula/${cedula}`),
  getById: (id) => api.get(`/medicalrecords/${id}`),
  createRecordForPatient: (patientId) => api.post(`/medicalrecords/patient/${patientId}`, {}),

  // --- Encounters ---
  createEncounter: (data) => api.post('/medicalrecords/encounters', data),
  getEncounterById: (id) => api.get(`/medicalrecords/encounters/${id}`),
  getEncountersForRecord: (recordId) => api.get(`/medicalrecords/${recordId}/encounters`),

  // --- Medical History ---
  addHistory: (recordId, data) => api.post(`/medicalrecords/${recordId}/history`, data),
  getHistory: (recordId, type) => {
    const url = type ? `/medicalrecords/${recordId}/history?type=${encodeURIComponent(type)}` : `/medicalrecords/${recordId}/history`;
    return api.get(url);
  },
  updateHistory: (historyId, data) => api.put(`/medicalrecords/history/${historyId}`, data),
  deleteHistory: (historyId) => api.delete(`/medicalrecords/history/${historyId}`),

  // --- Physical Exam ---
  savePhysicalExam: (encounterId, data) => api.put(`/medicalrecords/encounters/${encounterId}/physicalexam`, data),

  // --- Vital Signs ---
  addVitalSignsForEncounter: (encounterId, data) => api.post(`/medicalrecords/encounters/${encounterId}/vitalsigns`, data),
  addVitalSignsForRecord: (recordId, data) => api.post(`/medicalrecords/${recordId}/vitalsigns`, data),
  listVitalSignsForRecord: (recordId) => api.get(`/medicalrecords/${recordId}/vitalsigns`),

  // --- Diagnoses ---
  addDiagnosis: (encounterId, data) => api.post(`/medicalrecords/encounters/${encounterId}/diagnoses`, data),
  deleteDiagnosis: (diagnosisId) => api.delete(`/medicalrecords/diagnoses/${diagnosisId}`),

  // --- Treatment Plans ---
  addTreatmentPlan: (encounterId, data) => api.post(`/medicalrecords/encounters/${encounterId}/treatmentplans`, data),
  deleteTreatmentPlan: (planId) => api.delete(`/medicalrecords/treatmentplans/${planId}`),

  // --- Progress Notes ---
  addProgressNote: (encounterId, data) => api.post(`/medicalrecords/encounters/${encounterId}/progressnotes`, data),

  // --- Attachments ---
  listAttachments: (recordId) => api.get(`/medicalrecords/${recordId}/attachments`),
  registerAttachmentForRecord: (recordId, file, description) => {
    const form = new FormData();
    form.append('attachmentFile', file);
    if (description) form.append('description', description);
    return api.post(`/medicalrecords/${recordId}/attachments`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  registerAttachmentForEncounter: (encounterId, file, description) => {
    const form = new FormData();
    form.append('attachmentFile', file);
    if (description) form.append('description', description);
    return api.post(`/medicalrecords/encounters/${encounterId}/attachments`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteAttachment: (attachmentId) => api.delete(`/medicalrecords/attachments/${attachmentId}`),
  downloadAttachment: (attachmentId) => api.get(`/medicalrecords/attachments/${attachmentId}/download`, {
    responseType: 'blob',
  }),

  // --- Reports ---
  listReports: (recordId) => api.get(`/medicalrecords/${recordId}/reports`),
  getReport: (reportId) => api.get(`/medicalrecords/reports/${reportId}`),
  createReportForRecord: (recordId, data) => api.post(`/medicalrecords/${recordId}/reports`, data),
  createReportForEncounter: (encounterId, data) => api.post(`/medicalrecords/encounters/${encounterId}/reports`, data),
  updateReport: (reportId, data) => api.put(`/medicalrecords/reports/${reportId}`, data),
  deleteReport: (reportId) => api.delete(`/medicalrecords/reports/${reportId}`),
};

export default medicalRecordsApi;
