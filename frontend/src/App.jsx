import { Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import RegisterLecturer from './pages/auth/RegisterLecturer';
import AdminDashboard from './pages/admin/Dashboard';
// import StorekeeperDashboard from './pages/storekeeper/Dashboard';
import ManageItems from './pages/admin/ManageItems';
import ManageRequests from './pages/admin/ManageRequests';
import LecturerItems from './pages/lecturer/LecturerItems';
import MyRequests from './pages/lecturer/MyRequests'; 
import ItemRequestsPage from './pages/storekeeper/ItemRequestsPage.jsx';
import AdminDocumentUpload from './pages/admin/AdminDocumentUpload.jsx';
import DocumentsList from './pages/lecturer/DocumentList.jsx';
import RoleProtectedRoute from './components/RoleProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register-lecturer" element={<RegisterLecturer />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleProtectedRoute>
        }
      />
      
      <Route
        path="/admin/items"
        element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <ManageItems />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/requests"
        element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <ManageRequests />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/upload-document"
        element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <AdminDocumentUpload />
          </RoleProtectedRoute>
        }
      />

      {/* Lecturer routes */}
      <Route
        path="/lecturer/items"
        element={
          <RoleProtectedRoute allowedRoles={['lecturer']}>
            <LecturerItems />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/lecturer/requests"
        element={
          <RoleProtectedRoute allowedRoles={['lecturer']}>
            <MyRequests />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/documents"
        element={
          <RoleProtectedRoute allowedRoles={['lecturer']}>
            <DocumentsList />
          </RoleProtectedRoute>
        }
      />

      {/* Storekeeper routes */}
      {/* <Route
        path="/storekeeper"
        element={
          <RoleProtectedRoute allowedRoles={['storekeeper']}>
            <StorekeeperDashboard />
          </RoleProtectedRoute>
        }
      /> */}

      <Route
        path="/storekeeper/item-requests"
        element={
          <RoleProtectedRoute allowedRoles={['storekeeper']}>
            <ItemRequestsPage />
          </RoleProtectedRoute>
        }
      />

      {/* Uncomment when ready */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

export default App;