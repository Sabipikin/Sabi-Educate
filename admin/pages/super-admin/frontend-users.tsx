'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface FrontendUser {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

interface FormData {
  email: string;
  full_name: string;
  region: string;
  password: string;
}

export default function FrontendUsers() {
  const { token } = useAdminAuth();
  const [users, setUsers] = useState<FrontendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<FrontendUser | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    full_name: '',
    region: 'uk',
    password: '',
  });
  const [passwordReset, setPasswordReset] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/frontend-users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch frontend users');
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ email: '', full_name: '', region: 'uk', password: '' });
    setOpenModal(true);
  };

  const openEditModal = (user: FrontendUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      region: 'uk',
      password: '',
    });
    setOpenModal(true);
  };

  const openResetPasswordModal = (user: FrontendUser) => {
    setEditingUser(user);
    setPasswordReset('');
    setOpenPasswordModal(true);
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, any> = {
        email: formData.email,
        full_name: formData.full_name,
      };
      if (!editingUser) {
        payload.password = formData.password;
        payload.region = formData.region;
      }

      const url = editingUser
        ? `http://localhost:8000/api/admin/frontend-users/${editingUser.id}`
        : 'http://localhost:8000/api/admin/frontend-users';
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to save user');
      }

      setOpenModal(false);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/frontend-users/${editingUser.id}/password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ new_password: passwordReset }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to reset password');
      }

      setOpenPasswordModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user: FrontendUser) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/admin/frontend-users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update status');
      }
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/admin/frontend-users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to delete user');
      }
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Frontend Users</h1>
            <p className="text-gray-400">Manage main app users with edit, password reset, and active/inactive controls.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            + Add User
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-600 text-red-300 rounded-lg p-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400">Loading users...</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Created</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750 transition">
                    <td className="px-6 py-3 text-white">{user.email}</td>
                    <td className="px-6 py-3 text-white">{user.full_name || '—'}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.is_active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openResetPasswordModal(user)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`px-3 py-1 text-white rounded-lg text-sm ${
                          user.is_active ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="p-6 text-center text-gray-400">No frontend users found.</div>
            )}
          </div>
        )}
      </div>

      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingUser ? 'Edit Frontend User' : 'Create Frontend User'}
            </h2>
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Region</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="uk">UK</option>
                    <option value="ie">IE</option>
                    <option value="eu">EU</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {openPasswordModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">Reset Password for {editingUser.email}</h2>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordReset}
                  onChange={(e) => setPasswordReset(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenPasswordModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
