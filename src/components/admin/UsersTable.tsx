'use client';

import { useState, useCallback } from 'react';
import { Trash2, Loader2, AlertCircle } from 'lucide-react';
import { adminApi } from '@/lib/api';
import ConfirmationDialog from './ConfirmationDialog';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  createdAt: string;
}

interface UsersTableProps {
  users: User[];
  onRefresh: () => void;
}

const ROLE_OPTIONS = ['ADMIN', 'LANDLORD', 'STUDENT'] as const;

export default function UsersTable({ users, onRefresh }: UsersTableProps) {
  const [deleteItem, setDeleteItem] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleRoleChange = useCallback(async (id: string, role: string) => {
    setUpdatingId(id);
    setError('');
    try {
      await adminApi.updateUserRole(id, role);
      onRefresh();
    } catch {
      setError('Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  }, [onRefresh]);

  const handleDelete = useCallback(async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await adminApi.deleteUser(deleteItem);
      setDeleteItem(null);
      onRefresh();
    } catch {
      setError('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  }, [deleteItem, onRefresh]);

  if (users.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
        <p className="text-gray-400">No users found</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 text-red-600 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">&times;</button>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Users list">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-600">{user.phone || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingId === user.id}
                        aria-label={`Role for ${user.name}`}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border appearance-none cursor-pointer pr-8 outline-none ${
                          user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          user.role === 'LANDLORD' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {ROLE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {updatingId === user.id && (
                        <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setDeleteItem(user.id)}
                      aria-label="Delete user"
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteItem && (
        <ConfirmationDialog
          title="Delete User"
          message="Are you sure you want to delete this user? All their data including properties, videos, and reviews will be permanently removed."
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
          loading={deleting}
        />
      )}
    </>
  );
}
