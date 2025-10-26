import axios from 'axios';

const API_URL = 'http://localhost/shaddai/shaddai-api/public';

const getAuthHeaders = (token, extraHeaders = {}) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  },
});

const medicalRecordsApi = {
  // --- Medical Record (root) ---
  getByPatientId: (patientId, token) => axios.get(`${API_URL}/medicalrecords/patient/${patientId}`, getAuthHeaders(token)),
  getByPatientCedula: (cedula, token) => axios.get(`${API_URL}/medicalrecords/patient/cedula/${cedula}`, getAuthHeaders(token)),
  getById: (id, token) => axios.get(`${API_URL}/medicalrecords/${id}`, getAuthHeaders(token)),
  createRecordForPatient: (patientId, token) => axios.post(`${API_URL}/medicalrecords/patient/${patientId}`, {}, getAuthHeaders(token)),

  // --- Encounters ---
  createEncounter: (data, token) => axios.post(`${API_URL}/medicalrecords/encounters`, data, getAuthHeaders(token)),
  getEncounterById: (id, token) => axios.get(`${API_URL}/medicalrecords/encounters/${id}`, getAuthHeaders(token)),
  getEncountersForRecord: (recordId, token) => axios.get(`${API_URL}/medicalrecords/${recordId}/encounters`, getAuthHeaders(token)),

  // --- Medical History ---
  addHistory: (recordId, data, token) => axios.post(`${API_URL}/medicalrecords/${recordId}/history`, data, getAuthHeaders(token)),
  getHistory: (recordId, token, type) => {
    const url = type ? `${API_URL}/medicalrecords/${recordId}/history?type=${encodeURIComponent(type)}` : `${API_URL}/medicalrecords/${recordId}/history`;
    return axios.get(url, getAuthHeaders(token));
  },
  updateHistory: (historyId, data, token) => axios.put(`${API_URL}/medicalrecords/history/${historyId}`, data, getAuthHeaders(token)),
  deleteHistory: (historyId, token) => axios.delete(`${API_URL}/medicalrecords/history/${historyId}`, getAuthHeaders(token)),

  // --- Physical Exam ---
  savePhysicalExam: (encounterId, data, token) => axios.put(`${API_URL}/medicalrecords/encounters/${encounterId}/physicalexam`, data, getAuthHeaders(token)),

  // --- Vital Signs ---
  addVitalSignsForEncounter: (encounterId, data, token) => axios.post(`${API_URL}/medicalrecords/encounters/${encounterId}/vitalsigns`, data, getAuthHeaders(token)),
  addVitalSignsForRecord: (recordId, data, token) => axios.post(`${API_URL}/medicalrecords/${recordId}/vitalsigns`, data, getAuthHeaders(token)),
  listVitalSignsForRecord: (recordId, token) => axios.get(`${API_URL}/medicalrecords/${recordId}/vitalsigns`, getAuthHeaders(token)),

  // --- Diagnoses ---
  addDiagnosis: (encounterId, data, token) => axios.post(`${API_URL}/medicalrecords/encounters/${encounterId}/diagnoses`, data, getAuthHeaders(token)),
  deleteDiagnosis: (diagnosisId, token) => axios.delete(`${API_URL}/medicalrecords/diagnoses/${diagnosisId}`, getAuthHeaders(token)),

  // --- Treatment Plans ---
  addTreatmentPlan: (encounterId, data, token) => axios.post(`${API_URL}/medicalrecords/encounters/${encounterId}/treatmentplans`, data, getAuthHeaders(token)),
  deleteTreatmentPlan: (planId, token) => axios.delete(`${API_URL}/medicalrecords/treatmentplans/${planId}`, getAuthHeaders(token)),

  // --- Progress Notes ---
  addProgressNote: (encounterId, data, token) => axios.post(`${API_URL}/medicalrecords/encounters/${encounterId}/progressnotes`, data, getAuthHeaders(token)),

  // --- Attachments ---
  listAttachments: (recordId, token) => axios.get(`${API_URL}/medicalrecords/${recordId}/attachments`, getAuthHeaders(token)),
  registerAttachmentForRecord: (recordId, file, description, token) => {
    const form = new FormData();
    form.append('attachmentFile', file);
    if (description) form.append('description', description);
    return axios.post(`${API_URL}/medicalrecords/${recordId}/attachments`, form, getAuthHeaders(token, { 'Content-Type': 'multipart/form-data' }));
  },
  registerAttachmentForEncounter: (encounterId, file, description, token) => {
    const form = new FormData();
    form.append('attachmentFile', file);
    if (description) form.append('description', description);
    return axios.post(`${API_URL}/medicalrecords/encounters/${encounterId}/attachments`, form, getAuthHeaders(token, { 'Content-Type': 'multipart/form-data' }));
  },
  deleteAttachment: (attachmentId, token) => axios.delete(`${API_URL}/medicalrecords/attachments/${attachmentId}`, getAuthHeaders(token)),

  // --- Reports ---
  listReports: (recordId, token) => axios.get(`${API_URL}/medicalrecords/${recordId}/reports`, getAuthHeaders(token)),
  getReport: (reportId, token) => axios.get(`${API_URL}/medicalrecords/reports/${reportId}`, getAuthHeaders(token)),
  createReportForRecord: (recordId, data, token) => axios.post(`${API_URL}/medicalrecords/${recordId}/reports`, data, getAuthHeaders(token)),
  createReportForEncounter: (encounterId, data, token) => axios.post(`${API_URL}/medicalrecords/encounters/${encounterId}/reports`, data, getAuthHeaders(token)),
  updateReport: (reportId, data, token) => axios.put(`${API_URL}/medicalrecords/reports/${reportId}`, data, getAuthHeaders(token)),
  deleteReport: (reportId, token) => axios.delete(`${API_URL}/medicalrecords/reports/${reportId}`, getAuthHeaders(token)),
};

export default medicalRecordsApi;
