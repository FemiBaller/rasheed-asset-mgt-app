import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import DashboardLayout from '../../layouts/DashboardLayout';
import { AuthContext } from '../../context/AuthContext';
import BASE_URL from '../../api/api';

const ItemRequestsPage = () => {
  const [activeTab, setActiveTab] = useState('approved');
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [issuedRequests, setIssuedRequests] = useState([]);
  const [returnedRequests, setReturnedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useContext(AuthContext);

  const fetchRequests = async () => {
    if (!auth?.token) return;

    setLoading(true);
    try {
      const [approvedRes, issuedRes, returnedRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/requests/storekeeper/approved-items`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
        axios.get('http://localhost:5000/api/requests/storekeeper/issued-items', {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
        axios.get(`${BASE_URL}/api/requests/storekeeper/returned-items`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
      ]);

      // Reverse the arrays to show newest first
      setApprovedRequests(approvedRes.data.reverse());
      setIssuedRequests(issuedRes.data.reverse());
      setReturnedRequests(returnedRes.data.reverse());
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [auth]);

  const handleIssueItem = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/requests/${id}/issue`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      fetchRequests(); // Refresh data
    } catch (err) {
      console.error('Error issuing item:', err);
      alert('Currently out of stock.');
    }
  };

  const handleReturnItem = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/requests/${id}/return`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      fetchRequests(); // Refresh data
    } catch (err) {
      console.error('Error returning item:', err);
      alert('Failed to mark item as returned.');
    }
  };

  const renderRequests = (requests, actionButton) => (
    <div className="space-y-4">
      {requests.map((req) => (
        <div key={req._id} className="bg-white p-4 rounded shadow flex justify-between items-start">
          <div>
            <p><strong>Lecturer:</strong> {req.lecturer?.name}</p>
            <p><strong>Item:</strong> {req.itemOrDocument?.name}</p>
            <p><strong>Quantity:</strong> {req.quantityRequested}</p>
            <p><strong>Duration:</strong> {req.duration}</p>
          </div>
          {actionButton && (
            <button
              onClick={() => actionButton(req._id)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {activeTab === 'approved' ? 'Issue Item' : 'Mark as Returned'}
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-4">Item Requests</h2>

      <div className="flex space-x-4 mb-6">
        {['approved', 'issued'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading requests...</p>
      ) : activeTab === 'approved' ? (
        approvedRequests.length === 0 ? (
          <p>No approved requests available.</p>
        ) : (
          renderRequests(approvedRequests, handleIssueItem)
        )
      ) : activeTab === 'issued' ? (
        issuedRequests.length === 0 ? (
          <p>No issued items yet.</p>
        ) : (
          renderRequests(issuedRequests, handleReturnItem)
        )
      ) : (
        returnedRequests.length === 0 ? (
          <p>No returned items yet.</p>
        ) : (
          renderRequests(returnedRequests, null)
        )
      )}
    </DashboardLayout>
  );
};

export default ItemRequestsPage;