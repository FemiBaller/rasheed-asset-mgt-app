import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import DashboardLayout from '../../layouts/DashboardLayout';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext
import BASE_URL from '../../api/api';

const MyRequests = () => {
  const { auth } = useContext(AuthContext); // Get auth from context
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const token = auth?.token; // Use token from context instead of localStorage

        if (!token) {
          console.error('No token found. User may not be authenticated.');
          setLoading(false);
          return;
        }

        const res = await axios.get(`${BASE_URL}/api/requests/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('Fetched requests:', res.data); // Debug log to see request structure
        setRequests(res.data);
      } catch (err) {
        console.error('Error fetching your requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRequests();
  }, [auth]); // Add auth as dependency

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <p className="text-center text-gray-600">Loading your requests...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">My Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-600">No requests found.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Requested</th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req, index) => (
                  <tr key={req._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {req.itemOrDocument?.name || 'Item name not available'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          req.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : req.status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.quantityRequested}</td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyRequests;