import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout";
import PublicRoute from "./routes/PublicRoute";
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
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/controlpanel" element={<ControlPanel />} />
              <Route path="/profile" element={<ProfilePanel />} />
              <Route path="/reception" element={<ReceptionPanel />} />
              <Route path="/medicalrecords" element={<MedicalRecordsPanel />} />
              <Route path="/payment" element={<PaymentePanel />} />
              <Route path="/inventory" element={<InventoryPanel />} />
              <Route index element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          {/* Not found or fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
