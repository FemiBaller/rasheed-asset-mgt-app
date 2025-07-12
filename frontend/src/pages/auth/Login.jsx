import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import BASE_URL from '../../api/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
      login(data);
      toast.success('Login successful!');

      // redirect based on role
      if (data.role === 'admin') navigate('/admin/items ');
      else if (data.role === 'lecturer') navigate('/lecturer/items');
      else if (data.role === 'storekeeper') navigate('/storekeeper/item-requests');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl mb-6 font-semibold text-center">Login</h2>

        <label className="block mb-4">
          <span className="text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className={`mt-1 block w-full border rounded-md p-2 focus:ring focus:ring-blue-200 transition ${
              loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            }`}
            placeholder="you@example.com"
          />
        </label>

        <label className="block mb-6">
          <span className="text-gray-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className={`mt-1 block w-full border rounded-md p-2 focus:ring focus:ring-blue-200 transition ${
              loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            }`}
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 rounded-md transition flex items-center justify-center ${
            loading
              ? 'bg-blue-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link 
            to="/register-lecturer" 
            className={`text-blue-600 hover:underline ${
              loading ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;