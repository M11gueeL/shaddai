import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout";
import PublicRoute from "./routes/PublicRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute"; // Nuevo componente
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import ControlPanel from "./components/controlPanel/ControlPanel";
import ReceptionPanel from "./components/reception/ReceptionPanel";
import PaymentePanel from "./components/payments/PaymentPanel";
import MedicalRecordsPanel from "./components/medicalRecords/MedicalRecordsPanel";
import InventoryPanel from "./components/inventory/InventoryPanel";
import ProfilePanel from "./components/users/ProfilePanel";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Rutas accesibles por todos los roles autenticados */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePanel />} />
              
              {/* Panel de Control - Solo Admin */}
              <Route path="/controlpanel" element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <ControlPanel />
                </RoleProtectedRoute>
              } />
              
              {/* Recepción - Admin + Recepcionista */}
              <Route path="/reception" element={
                <RoleProtectedRoute allowedRoles={['admin', 'recepcionista']}>
                  <ReceptionPanel />
                </RoleProtectedRoute>
              } />
              
              {/* Historias Clínicas - Admin + Médico */}
              <Route path="/medicalrecords" element={
                <RoleProtectedRoute allowedRoles={['admin', 'medico']}>
                  <MedicalRecordsPanel />
                </RoleProtectedRoute>
              } />
              
              {/* Pago - Admin + Recepcionista */}
              <Route path="/payment" element={
                <RoleProtectedRoute allowedRoles={['admin', 'recepcionista']}>
                  <PaymentePanel />
                </RoleProtectedRoute>
              } />
              
              {/* Inventario - Admin + Recepcionista */}
              <Route path="/inventory" element={
                <RoleProtectedRoute allowedRoles={['admin', 'recepcionista']}>
                  <InventoryPanel />
                </RoleProtectedRoute>
              } />
              
              <Route index element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}