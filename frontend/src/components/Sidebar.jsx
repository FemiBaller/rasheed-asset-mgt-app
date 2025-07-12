import { NavLink, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { auth, logout } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);

  const role = auth?.user?.role;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkBaseClass =
    'block px-4 py-2 rounded text-left w-full text-white transition-all duration-200';
  const activeClass = 'bg-yellow-500 text-gray-900 font-semibold';
  const inactiveClass = 'hover:bg-yellow-600 hover:text-white';

  return (
    <div className="w-64 min-h-screen bg-gray-800 text-white p-4 relative">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-12">Dashboard</h2>
      </div>

      <nav className="space-y-3">
        {role === 'admin' && (
          <>
            <NavLink
              to="/admin/items"
              className={({ isActive }) =>
                `${linkBaseClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              Manage Items
            </NavLink>
            <NavLink
              to="/admin/upload-document"
              className={({ isActive }) =>
                `${linkBaseClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              Manage Documents
            </NavLink>
            <NavLink
              to="/admin/requests"
              className={({ isActive }) =>
                `${linkBaseClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              Manage Requests
            </NavLink>
          </>
        )}

      {role === 'lecturer' && (
  <>
    <NavLink
      to="/lecturer/items"
      className={({ isActive }) =>
        `${linkBaseClass} ${isActive ? activeClass : inactiveClass}`
      }
    >
      Available Items
    </NavLink>
    <NavLink
      to="/lecturer/requests"
      className={({ isActive }) =>
        `${linkBaseClass} ${isActive ? activeClass : inactiveClass}`
      }
    >
      My Requests
    </NavLink>

    <NavLink
      to="/documents"
      className={({ isActive }) =>
        `${linkBaseClass} ${isActive ? activeClass : inactiveClass}`
      }
    >
      View Documents
    </NavLink>
  </>
)}


        {role === 'storekeeper' && (
          <>
            <NavLink
             to="/storekeeper/item-requests"
              className={({ isActive }) =>
                `${linkBaseClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              Approved Requests
            </NavLink>
          </>
        )}
      </nav>

      <button
        onClick={() => setShowModal(true)}
        className="mt-10 bg-red-600 hover:bg-red-700 px-4 py-2 rounded w-full text-white"
      >
        Logout
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-80 text-gray-800">
            <h3 className="text-lg font-semibold mb-4">Are you sure you want to logout?</h3>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
