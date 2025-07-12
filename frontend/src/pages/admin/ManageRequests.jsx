import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/Loader';
import { AuthContext } from '../../context/AuthContext';
import BASE_URL from '../../api/api';

const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(10);
  // Add loading states for individual buttons
  const [buttonLoading, setButtonLoading] = useState({});
  const { auth } = useContext(AuthContext);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/api/requests`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setRequests(data.reverse());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    // Set loading state for this specific button
    setButtonLoading(prev => ({ ...prev, [`${id}-${status}`]: true }));
    
    try {
      await axios.put(
        `${BASE_URL}/api/requests/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      toast.success(`Request ${status}`);
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    } finally {
      // Clear loading state for this specific button
      setButtonLoading(prev => {
        const newState = { ...prev };
        delete newState[`${id}-${status}`];
        return newState;
      });
    }
  };

  // Pagination logic
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(requests.length / requestsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  useEffect(() => { fetchRequests(); }, []);

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Manage Requests</h1>
        
        <div className="mb-4 text-sm text-gray-600">
          Showing {indexOfFirstRequest + 1} to {Math.min(indexOfLastRequest, requests.length)} of {requests.length} requests
        </div>

        {loading ? <Loader /> : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border">Lecturer</th>
                    <th className="py-2 px-4 border">Type</th>
                    <th className="py-2 px-4 border">Item</th>
                    <th className="py-2 px-4 border">Quantity</th>
                    <th className="py-2 px-4 border">Duration</th>
                    <th className="py-2 px-4 border">Status</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRequests.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border">{r.lecturer.name}</td>
                      <td className="py-2 px-4 border">{r.type}</td>
                      <td className="py-2 px-4 border">
                        {r.type === 'Item' ? r.itemOrDocument.name : r.itemOrDocument.title}
                      </td>
                      <td className="py-2 px-4 border">{r.quantityRequested}</td>
                      <td className="py-2 px-4 border">{r.duration}</td>
                      <td className="py-2 px-4 border capitalize">{r.status}</td>
                      <td className="py-2 px-4 border space-x-2">
                        {r.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(r._id, 'approved')}
                              disabled={buttonLoading[`${r._id}-approved`]}
                              className={`px-3 py-1 rounded text-white font-medium min-w-[80px] ${
                                buttonLoading[`${r._id}-approved`]
                                  ? 'bg-green-400 cursor-not-allowed'
                                  : 'bg-green-500 hover:bg-green-600'
                              }`}
                            >
                              {buttonLoading[`${r._id}-approved`] ? (
                                <div className="flex items-center justify-center">
                                  <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      fill="none"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  ...
                                </div>
                              ) : (
                                'Approve'
                              )}
                            </button>
                            <button
                              onClick={() => updateStatus(r._id, 'declined')}
                              disabled={buttonLoading[`${r._id}-declined`]}
                              className={`px-3 py-1 rounded text-white font-medium min-w-[80px] ${
                                buttonLoading[`${r._id}-declined`]
                                  ? 'bg-red-400 cursor-not-allowed'
                                  : 'bg-red-500 hover:bg-red-600'
                              }`}
                            >
                              {buttonLoading[`${r._id}-declined`] ? (
                                <div className="flex items-center justify-center">
                                  <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      fill="none"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  ...
                                </div>
                              ) : (
                                'Decline'
                              )}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center space-x-1">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Previous
                </button>

                {getPageNumbers().map((number, index) => (
                  <button
                    key={index}
                    onClick={() => typeof number === 'number' && paginate(number)}
                    disabled={number === '...'}
                    className={`px-3 py-2 text-sm font-medium ${
                      number === currentPage
                        ? 'bg-blue-500 text-white rounded'
                        : number === '...'
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded'
                    }`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}; 

export default ManageRequests;