
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/Loader';
import { AuthContext } from '../../context/AuthContext';
import BASE_URL from '../../api/api';

const DocumentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsPerPage] = useState(8);
  const { auth } = useContext(AuthContext);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/api/documents`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setDocuments(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId, title) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/documents/${documentId}/download`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
          responseType: 'blob'
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Try to get filename from response headers or use title
      const contentDisposition = response.headers['content-disposition'];
      let filename = title;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    }
  };

  const getFileIcon = (fileUrl) => {
    const extension = fileUrl?.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📈';
      default: return '📎';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastDocument = currentPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstDocument, indexOfLastDocument);
  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm]);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Documents Library</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-4 text-sm text-gray-600">
          {filteredDocuments.length > 0 && (
            <>
              Showing {indexOfFirstDocument + 1} to {Math.min(indexOfLastDocument, filteredDocuments.length)} of {filteredDocuments.length} documents
              {searchTerm && ` (filtered from ${documents.length} total)`}
            </>
          )}
        </div>

        {loading ? (
          <Loader />
        ) : (
          <>
            {currentDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No documents found' : 'No documents available'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Documents uploaded by admin will appear here'
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentDocuments.map((doc) => (
                    <div key={doc._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                      <div className="p-6">
                        {/* File Icon */}
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg">
                          <span className="text-3xl">{getFileIcon(doc.fileUrl)}</span>
                        </div>

                        {/* Document Info */}
                        <div className="text-center mb-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2" title={doc.title}>
                            {doc.title}
                          </h3>
                          {doc.description && (
                            <p className="text-sm text-gray-600 line-clamp-3" title={doc.description}>
                              {doc.description}
                            </p>
                          )}
                        </div>

                        {/* Upload Date */}
                        <div className="text-xs text-gray-500 text-center mb-4">
                          Uploaded: {formatDate(doc.createdAt)}
                        </div>

                        {/* Download Button */}
                        <button
                          onClick={() => handleDownload(doc._id, doc.title)}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-medium transition duration-200 flex items-center justify-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center space-x-1">
                    {/* Previous button */}
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

                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-2 text-sm font-medium ${
                          number === currentPage
                            ? 'bg-blue-500 text-white rounded'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded'
                        }`}
                      >
                        {number}
                      </button>
                    ))}

                    {/* Next button */}
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DocumentsList;










// // src/pages/admin/ManageDocuments.jsx
// import React, { useEffect, useState, useContext } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import DashboardLayout from '../../layouts/DashboardLayout';
// import Loader from '../../components/Loader';
// import { AuthContext } from '../../context/AuthContext';

// const ManageDocuments = () => {
//   const [docs, setDocs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const { auth } = useContext(AuthContext);

//   const fetchDocs = async () => {
//     setLoading(true);
//     try {
//       const { data } = await axios.get('http://localhost:5000/api/documents', {
//         headers: { Authorization: `Bearer ${auth.token}` }
//       });
//       setDocs(data);
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to fetch documents');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteDoc = async (id) => {
//     if (!window.confirm('Delete this document?')) return;
//     try {
//       await axios.delete(`http://localhost:5000/api/documents/${id}`, {
//         headers: { Authorization: `Bearer ${auth.token}` }
//       });
//       toast.success('Document deleted');
//       setDocs(prev => prev.filter(d => d._id !== id));
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Delete failed');
//     }
//   };

//   useEffect(() => { fetchDocs(); }, []);

//   return (
//     <DashboardLayout>
//       <div className="p-4">
//         <h1 className="text-2xl font-semibold mb-4">Manage Documents</h1>
//         {loading ? <Loader /> : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white">
//               <thead>
//                 <tr>
//                   <th className="py-2 px-4 border">Title</th>
//                   <th className="py-2 px-4 border">Description</th>
//                   <th className="py-2 px-4 border">Uploaded By</th>
//                   <th className="py-2 px-4 border">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {docs.map(doc => (
//                   <tr key={doc._id} className="hover:bg-gray-50">
//                     <td className="py-2 px-4 border">{doc.title}</td>
//                     <td className="py-2 px-4 border">{doc.description}</td>
//                     <td className="py-2 px-4 border">{doc.uploadedBy?.name}</td>
//                     <td className="py-2 px-4 border space-x-2">
//                       <a
//                         href={`http://localhost:5000${doc.fileUrl}`}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
//                       >Download</a>
//                       <button
//                         onClick={() => deleteDoc(doc._id)}
//                         className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//                       >Delete</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default ManageDocuments;