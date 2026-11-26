import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from './context/AdminContext';
import AdminSidebar from './components/AdminSidebar';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagement/UserManagementPage';
import UserDetailPage from './pages/UserManagement/User/UserDetailPage';
import TemplateManagementPage from './pages/TemplateManagement/TemplateManagementPage';
import TemplateDetails from './pages/TemplateManagement/TemplateDetails';
import ManagementPage from './pages/Management/ManagementPage';
import RoleAccessPage from './pages/Management/RoleAccess/RoleAccessPage';
import ManagementUserPage from './pages/Management/UserManagement/ManagementUserPage';
import ThreeDAssetsPage from './pages/ThreeDAssetsPage';
import AdminLoginPage from './pages/AdminLoginPage';

function ProtectedLayout() {
  const { adminUser } = useAdmin();
  const location = useLocation();

  if (!adminUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-white text-gray-800 font-sans antialiased flex">
      {/* Left Dark Sidebar: Super Admin */}
      <AdminSidebar />

      {/* Right Main Content Canvas */}
      <main className="flex-1 h-screen overflow-y-auto bg-white p-[2vw] font-sans">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="/templates" element={<TemplateManagementPage />} />
          <Route path="/templates/:id" element={<TemplateDetails />} />
          <Route path="/management" element={<ManagementPage />} />
          <Route path="/management/role-access" element={<RoleAccessPage />} />
          <Route path="/management/users" element={<ManagementUserPage />} />
          <Route path="/3d-editor-assets" element={<ThreeDAssetsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const { adminUser } = useAdmin();

  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={adminUser ? <Navigate to="/" replace /> : <AdminLoginPage />}
      />

      {/* All protected Admin views */}
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
