
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/Loader';
import { AuthContext } from '../../context/AuthContext';
import BASE_URL from '../../api/api';

const ManageItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', quantity: 1 });
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { auth } = useContext(AuthContext);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/api/items`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setItems(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/api/items/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        toast.success('Item updated successfully');
      } else {
        await axios.post(`${BASE_URL}/api/items`, formData, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        toast.success('Item created successfully');
      }
      setFormData({ name: '', description: '', quantity: 1 });
      setEditingId(null);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
    });
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeletingId(itemToDelete._id);
    setShowDeleteModal(false);
    try {
      await axios.delete(`${BASE_URL}/api/items/${itemToDelete._id}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      toast.success('Item deleted');
      setItems(prev => prev.filter(i => i._id !== itemToDelete._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
      setItemToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Manage Items</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Item Name"
            required
            className="border rounded p-2"
          />
          <input
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="border rounded p-2"
          />
          <input
            name="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            required
            className="border rounded p-2"
          />
          <button
            type="submit"
            className="md:col-span-3 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
            disabled={submitting}
          >
            {submitting ? <Loader small /> : editingId ? 'Update Item' : 'Add Item'}
          </button>
        </form>

        {loading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border">Name</th>
                  <th className="py-2 px-4 border">Description</th>
                  <th className="py-2 px-4 border">Quantity</th>
                  <th className="py-2 px-4 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border">{item.name}</td>
                    <td className="py-2 px-4 border">{item.description}</td>
                    <td className="py-2 px-4 border">{item.quantity}</td>
                    <td className="py-2 px-4 border space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(item)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        {deletingId === item._id ? <Loader small /> : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && itemToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Confirm Deletion</h2>
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{itemToDelete.name}</strong>?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  {deletingId === itemToDelete._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageItems;
