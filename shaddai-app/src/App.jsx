import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout";
import PublicRoute from "./routes/PublicRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute"; 
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import ControlPanel from "./components/controlPanel/ControlPanel";
import ReceptionPanel from "./components/reception/ReceptionPanel";
import PaymentPanel from "./components/payments/panel/PaymentPanel";
import PaymentHome from "./components/payments/home/PaymentHome";
import RateManager from "./components/payments/rate/RateManager";
import CashManager from "./components/payments/cash/CashManager";
import AccountsWorkspace from "./components/payments/accounts/AccountsWorkspace";
import PaymentAudit from "./components/payments/audit/PaymentAudit";
import PaymentReports from "./components/payments/reports/PaymentReports";
import MedicalRecordsPanel from "./components/medicalRecords/MedicalRecordsPanel";
import InventoryPanel from "./components/inventory/InventoryPanel";
import UserPanel from "./components/controlPanel/users/UserPanel";
import RoomsPanel from "./components/controlPanel/rooms/RoomsPanel";
import AllSessionsPanel from "./components/controlPanel/sessions/AllSessionsPanel";
import ProfilePanel from "./components/controlPanel/users/ProfilePanel";
import DatabaseBackupPanel from "./components/controlPanel/system/DatabaseBackupPanel";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import SetPassword from './components/auth/SetPassword';
import ScrollToTop  from "./utils/ScrollToTop";
import AppPrivacy from "./components/legal/AppPrivacy";
import AppTerms from "./components/legal/AppTerms";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ConfirmProvider>
            <ScrollToTop />
            <Routes>
              
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/set-password" element={<SetPassword />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>

                  {/* Rutas accesibles por todos los roles autenticados */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<ProfilePanel />} />
                  <Route path="/privacy" element={<AppPrivacy />} />
                  <Route path="/terms" element={<AppTerms />} />
                  
                  {/* Panel de Control - Solo Admin */}
                  <Route path="/controlpanel" element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <ControlPanel />
                    </RoleProtectedRoute>
                  } >
                    <Route path="users" element={<UserPanel />} />
                    <Route path="rooms" element={<RoomsPanel />} />
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
                  
                  {/* Pago - Admin + Recepcionista */}
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

                    <Route path="reports" element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <PaymentReports />
                      </RoleProtectedRoute>
                    } />

                    {/* Auditoría de Pagos - Solo Admin */}
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
          </ConfirmProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}