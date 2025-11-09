import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout";
import PublicRoute from "./routes/PublicRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute"; 
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import ControlPanel from "./components/controlPanel/ControlPanel";
import ReceptionPanel from "./components/reception/ReceptionPanel";
import PaymentPanel from "./components/payments/PaymentPanel";
import PaymentHome from "./components/payments/PaymentHome";
import RateManager from "./components/payments/RateManager";
import CashManager from "./components/payments/CashManager";
import AccountsWorkspace from "./components/payments/AccountsWorkspace";
import PaymentAudit from "./components/payments/PaymentAudit";
import MedicalRecordsPanel from "./components/medicalRecords/MedicalRecordsPanel";
import InventoryPanel from "./components/inventory/InventoryPanel";
import UserPanel from "./components/controlPanel/users/UserPanel";
import AllSessionsPanel from "./components/controlPanel/sessions/AllSessionsPanel";
import ProfilePanel from "./components/controlPanel/users/ProfilePanel";
import DatabaseBackupPanel from "./components/controlPanel/system/DatabaseBackupPanel";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
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
              } >
                <Route path="users" element={<UserPanel />} />
                <Route path="sessions" element={<AllSessionsPanel />} />
                <Route path="backup" element={<DatabaseBackupPanel />} />
              </Route>
              
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
              
              {/* Pago - Admin + Recepcionista 
                  ejemplo de subrutas protegidas para implementar en el futuro en otros modulos...
              */}
              <Route path="/payment" element={
                <RoleProtectedRoute allowedRoles={['admin', 'recepcionista']}>
                  <PaymentPanel />
                </RoleProtectedRoute>
              }>
                <Route index element={
                  <RoleProtectedRoute allowedRoles={['admin', 'recepcionista']}>
                    <PaymentHome />
                  </RoleProtectedRoute>
                } />
                <Route path="rate" element={
                  <RoleProtectedRoute allowedRoles={['admin', 'recepcionista']}>
                    <RateManager />
                  </RoleProtectedRoute>
                } />
                <Route path="cash" element={
                  <RoleProtectedRoute allowedRoles={['admin', 'recepcionista']}>
                    <CashManager />
                  </RoleProtectedRoute>
                } />
                <Route path="accounts" element={
                  <RoleProtectedRoute allowedRoles={['admin', 'recepcionista']}>
                    <AccountsWorkspace />
                  </RoleProtectedRoute>
                } />
                <Route path="audit" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <PaymentAudit />
                  </RoleProtectedRoute>
                } />
              </Route>
              
              {/* Inventario - Admin + Recepcionista */}
              <Route path="/inventory" element={
                <RoleProtectedRoute allowedRoles={['admin', 'recepcionista']}>
                  <InventoryPanel />
                </RoleProtectedRoute>
              } />
              
              <Route index element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        
            </Routes>
          </BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}