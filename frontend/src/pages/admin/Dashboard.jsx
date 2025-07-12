// src/pages/admin/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';

const AdminDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/admin/items"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center"
          >
            <span className="text-xl font-medium">Manage Items</span>
            <p className="text-gray-500 mt-2">Add, edit, or delete department items</p>
          </Link>

          <Link
            to="/admin/documents"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center"
          >
            <span className="text-xl font-medium">Manage Documents</span>
            <p className="text-gray-500 mt-2">Upload or remove exclusive documents</p>
          </Link>

          <Link
            to="/admin/requests"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center"
          >
            <span className="text-xl font-medium">Manage Requests</span>
            <p className="text-gray-500 mt-2">Approve or decline user requests</p>
          </Link>

          <Link
            to="/admin/users"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center"
          >
            <span className="text-xl font-medium">Manage Users</span>
            <p className="text-gray-500 mt-2">View or delete user accounts</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
